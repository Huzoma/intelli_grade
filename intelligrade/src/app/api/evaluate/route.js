import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to safely isolate and parse JSON from LLM output
function cleanAndParseJSON(rawText) {
  if (!rawText) throw new Error("Empty response received from AI model.");
  
  let cleaned = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  
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

    // 2. Fetch PDF file directly from Supabase public URL and convert to Base64
    let base64Data = "";
    try {
      const pdfResponse = await fetch(submission.filePath);
      if (!pdfResponse.ok) {
        throw new Error(`Cloud storage returned status ${pdfResponse.status}`);
      }
      const arrayBuffer = await pdfResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Data = buffer.toString("base64");
    } catch (readErr) {
      console.error("[AI Evaluation] Error fetching PDF from Supabase:", readErr);
      throw new Error("Failed to download the document from the cloud: " + readErr.message);
    }

    // 3. Verify Gemini API Key configuration
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured in the server environment variables (.env).");
    }

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
        
        docTitle = parsed.title || submission.docTitle;
        summary = parsed.summary || "";
        aiScore = typeof parsed.aiScore === "number" ? parsed.aiScore : 15;
        
        if (Array.isArray(parsed.entities)) {
          entities = parsed.entities.join(", ");
        } else if (typeof parsed.entities === "string") {
          entities = parsed.entities;
        }
        
        fullText = parsed.fullText || "";
        
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

    // 4. Update the Submission status to needs_grading
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        docTitle,
        summary,
        aiScore,
        entities,
        fullText,
        status: "needs_grading"
      }
    });

    // 5. Insert the viva questions
    await prisma.vivaQuestion.deleteMany({
      where: { submissionId }
    });

    await prisma.vivaQuestion.createMany({
      data: vivaQuestions.map(q => ({
        text: q.text,
        added: false,
        marker: q.marker || null,
        submissionId
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
    
    // Clean up database record only; file stays in Supabase for debugging
    if (submissionId) {
      try {
        await prisma.submission.delete({ where: { id: submissionId } }).catch(() => {});
      } catch (cleanupErr) {
        console.error("[AI Evaluation] Failed to cleanup database:", cleanupErr);
      }
    }
    
    return NextResponse.json({ error: "AI Evaluation failed: " + error.message }, { status: 500 });
  }
}