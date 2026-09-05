import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. Bypass Turbopack ESM bug by forcing Node's native CommonJS require
const pdfParse = require("pdf-parse");

// 2. Next.js App Router Standard: Override Vercel's default 15s timeout
export const maxDuration = 60; 

// Helper function to safely parse LLM output
function cleanAndParseJSON(rawText) {
  if (!rawText) throw new Error("Empty response received from AI model.");
  let cleaned = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No valid JSON structure found in the AI response.");
  }
  
  return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
}

export async function POST(request) {
  let submissionId = null;
  try {
    const body = await request.json();
    submissionId = body.submissionId;

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { rubric: true }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    let base64Data = "";
    let extractedText = "";
    
    try {
      // 3. Cloud-Native Fetch: Direct buffer streaming, no local file system required
      const pdfResponse = await fetch(submission.filePath);
      if (!pdfResponse.ok) {
        throw new Error(`Cloud storage returned status ${pdfResponse.status}`);
      }
      const arrayBuffer = await pdfResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 4. Instant Native Parsing: Extracts text in milliseconds for the frontend
      const parsedPdf = await pdfParse(buffer);
      extractedText = parsedPdf.text;
      
      // Convert for Gemini
      base64Data = buffer.toString("base64");
    } catch (readErr) {
      console.error("[AI Evaluation] Error fetching or parsing PDF:", readErr);
      throw new Error("Failed to process the document: " + readErr.message);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured in the environment variables.");
    }

    // 5. Optimized Prompt: AI focuses solely on metadata, avoiding text regurgitation timeouts
    const prompt = `You are an academic grading assistant. Analyze the attached academic PDF document to determine:
1. The actual title of the proposal, report, or assignment extracted directly from the document content (do NOT use the filename). If no clear title exists, summarize the main topic in a concise title.
2. A detailed academic summary of the document (around 3-4 sentences).
3. AI generated probability percentage (0-100%, lower is better).
4. Key technologies, tools, libraries, or concepts referenced in the document (comma-separated string).
5. Exactly 3 technical viva questions to ask the student to test their comprehension of their work. For each question, extract a precise quote or marker (1-2 sentences) from the document showing the exact context/evidence where the question was derived.

Return ONLY a valid JSON object matching this schema. Do not wrap in markdown blocks.
{
  "title": "string",
  "summary": "string",
  "aiScore": number,
  "entities": "string",
  "vivaQuestions": [
    {
      "text": "string",
      "marker": "string"
    }
  ]
}`;

    // 6. Modern Gemini 1.5 endpoint with strict JSON typing
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ inlineData: { mimeType: "application/pdf", data: base64Data } }, { text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    let docTitle = submission.docTitle;
    let summary = "";
    let aiScore = 15;
    let entities = "";
    let vivaQuestions = [];

    if (response.ok) {
      const resData = await response.json();
      const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (responseText) {
        const parsed = cleanAndParseJSON(responseText);
        docTitle = parsed.title || submission.docTitle;
        summary = parsed.summary || "";
        aiScore = typeof parsed.aiScore === "number" ? parsed.aiScore : 15;
        entities = Array.isArray(parsed.entities) ? parsed.entities.join(", ") : (parsed.entities || "");
        
        if (Array.isArray(parsed.vivaQuestions)) {
          vivaQuestions = parsed.vivaQuestions
            .map(q => ({ text: q.text || q.question || "", marker: q.marker || q.evidence || q.context || "" }))
            .filter(q => q.text.trim().length > 0);
        }
      } else {
        throw new Error("Gemini returned an empty response body.");
      }
    } else {
      const errText = await response.text();
      throw new Error(`Gemini API call failed: ${response.status} - ${errText}`);
    }

    if (vivaQuestions.length === 0) throw new Error("Gemini failed to generate valid viva questions.");

    // 7. Data Merge: Saves both the AI metadata AND the instantly parsed full document text
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        docTitle,
        summary,
        aiScore,
        entities,
        fullText: extractedText,
        status: "needs_grading"
      }
    });

    await prisma.vivaQuestion.deleteMany({ where: { submissionId } });
    await prisma.vivaQuestion.createMany({
      data: vivaQuestions.map(q => ({ text: q.text, added: false, marker: q.marker || null, submissionId }))
    });

    return NextResponse.json({ success: true, docTitle, summary, aiScore, entities, vivaQuestions });
  } catch (error) {
    console.error("[AI Evaluation] Evaluation API error:", error);
    if (submissionId) {
      try {
        await prisma.submission.delete({ where: { id: submissionId } }).catch(() => {});
      } catch (cleanupErr) {}
    }
    return NextResponse.json({ error: "AI Evaluation failed: " + error.message }, { status: 500 });
  }
}