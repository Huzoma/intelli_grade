import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

// Helper function to safely isolate and parse JSON from LLM output
function cleanAndParseJSON(rawText) {
  if (!rawText) throw new Error("Empty response received from AI model.");
  
  // Strip out markdown code fences
  let cleaned = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  
  // Extract strictly the outermost JSON object bounds
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No valid JSON structure found in the AI response.");
  }
  
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  return JSON.parse(cleaned);
}

export async function POST(request) {
  let submissionId = null;
  try {
    const body = await request.json();
    submissionId = body.submissionId;

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    // 1. Fetch submission with rubric details
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { rubric: true }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // 2. Read PDF file from Vercel's /tmp disk and convert to Base64
    let base64Data = "";
    try {
      const filename = path.basename(submission.filePath);
      const filePath = path.join("/tmp", filename); 
      const fileBuffer = await fs.readFile(filePath);
      base64Data = fileBuffer.toString("base64");
    } catch (readErr) {
      console.error("[AI Evaluation] Error reading PDF file from disk:", readErr);
      throw new Error("Failed to read the uploaded document for evaluation: " + readErr.message);
    }

    // 3. Verify Gemini API Key configuration
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[AI Evaluation] GEMINI_API_KEY is missing from environment variables.");
      throw new Error("Gemini API key is not configured in the server environment variables (.env).");
    }

    console.log(`[AI Evaluation] GEMINI_API_KEY detected. Making live API call for submission: "${submission.docTitle}"`);

    const rubricCriteria = submission.rubric 
      ? JSON.parse(submission.rubric.criteriaList).join("\n") 
      : "Standard academic quality";

    const prompt = `You are an academic grading assistant. Analyze the attached academic PDF document to determine:
1. The actual title of the proposal, report, or assignment extracted directly from the document content (do NOT use the filename). If no clear title exists within the document, summarize the main topic in a concise title.
2. A detailed academic summary of the document (around 3-4 sentences).
3. AI generated probability percentage (0-100%, lower is better, human text is usually < 20%).
4. Key technologies, tools, libraries, or concepts referenced in the document (comma-separated string).
5. Exactly 3 technical viva questions to ask the student to test their comprehension of their work. For each question, extract a precise quote or marker (1-2 sentences) from the document showing the exact context/evidence where the question was derived.
6. The full text content of the document (extract verbatim all paragraphs and text from the PDF, preserving raw text with double newlines separating paragraphs).

Return ONLY a valid JSON object matching this schema. Do not wrap in markdown blocks like \`\`\`json.
{
  "title": "string",
  "summary": "string",
  "aiScore": number,
  "entities": "string",
  "fullText": "string",
  "vivaQuestions": [
    {
      "text": "string",
      "marker": "string"
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    let docTitle = submission.docTitle;
    let summary = "";
    let aiScore = 15;
    let entities = "";
    let fullText = "";
    let vivaQuestions = [];

    if (response.ok) {
      const resData = await response.json();
      const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (responseText) {
        const parsed = cleanAndParseJSON(responseText);
        console.log("[AI Evaluation] Live API response received successfully:", parsed);
        
        docTitle = parsed.title || submission.docTitle;
        summary = parsed.summary || "";
        aiScore = typeof parsed.aiScore === "number" ? parsed.aiScore : 15;
        
        // Normalize entities whether returned as array or string
        if (Array.isArray(parsed.entities)) {
          entities = parsed.entities.join(", ");
        } else if (typeof parsed.entities === "string") {
          entities = parsed.entities;
        } else {
          entities = "";
        }
        
        fullText = parsed.fullText || "";
        
        // Normalize viva questions format
        if (Array.isArray(parsed.vivaQuestions)) {
          vivaQuestions = parsed.vivaQuestions
            .map(q => ({
              text: q.text || q.question || "",
              marker: q.marker || q.evidence || q.context || ""
            }))
            .filter(q => q.text.trim().length > 0);
        }
      } else {
        throw new Error("Gemini returned an empty response body.");
      }
    } else {
      const errText = await response.text();
      throw new Error(`Gemini API call failed with status ${response.status}: ${errText}`);
    }

    if (vivaQuestions.length === 0) {
      throw new Error("Gemini API failed to generate valid viva questions.");
    }

    // 4. Update the Submission status to needs_grading and bind scores, summary, entities & fullText
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        docTitle: docTitle,
        summary: summary,
        aiScore: aiScore,
        entities: entities,
        fullText: fullText,
        status: "needs_grading"
      }
    });

    // 5. Insert the viva questions in database linked to this submission
    await prisma.vivaQuestion.deleteMany({
      where: { submissionId }
    });

    await prisma.vivaQuestion.createMany({
      data: vivaQuestions.map(q => ({
        text: q.text,
        added: false,
        marker: q.marker || null,
        submissionId: submissionId
      }))
    });

    return NextResponse.json({
      success: true,
      docTitle,
      summary,
      aiScore,
      entities,
      vivaQuestions
    });
  } catch (error) {
    console.error("[AI Evaluation] Evaluation API error:", error);
    
    // Clean up / rollback the created submission to prevent dangling records
    if (submissionId) {
      try {
        const subToDelete = await prisma.submission.findUnique({
          where: { id: submissionId }
        });
        if (subToDelete) {
          await prisma.submission.delete({ where: { id: submissionId } });
          const filename = path.basename(subToDelete.filePath);
          const filePath = path.join("/tmp", filename); 
          await fs.unlink(filePath).catch(() => {});
          console.log(`[AI Evaluation] Rollback successful: Deleted submission database record and file for ID: ${submissionId}`);
        }
      } catch (cleanupErr) {
        console.error("[AI Evaluation] Failed to cleanup files during error rollback:", cleanupErr);
      }
    }
    
    return NextResponse.json({ error: "AI Evaluation failed: " + error.message }, { status: 500 });
  }
}