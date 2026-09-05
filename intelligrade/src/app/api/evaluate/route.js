import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; 

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

    if (!submissionId) return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { rubric: true }
    });

    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    let base64Data = "";
    
    try {
      const pdfResponse = await fetch(submission.filePath);
      if (!pdfResponse.ok) throw new Error(`Cloud storage returned status ${pdfResponse.status}`);
      const arrayBuffer = await pdfResponse.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString("base64");
    } catch (readErr) {
      throw new Error("Failed to fetch document from cloud: " + readErr.message);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key is missing.");

    const prompt = `You are an academic grading assistant. Analyze the attached academic PDF document to determine:
1. The actual title of the proposal, report, or assignment extracted directly from the document content. If no clear title exists, summarize the main topic in a concise title.
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
    { "text": "string", "marker": "string" }
  ]
}`;

    // Stable 3.6-flash endpoint
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ inlineData: { mimeType: "application/pdf", data: base64Data } }, { text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    let docTitle = submission.docTitle, summary = "", aiScore = 15, entities = "", vivaQuestions = [];

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
      }
    } else {
      throw new Error(`Gemini API call failed: ${response.status}`);
    }

    if (vivaQuestions.length === 0) throw new Error("Gemini failed to generate viva questions.");

    await prisma.submission.update({
      where: { id: submissionId },
      data: { docTitle, summary, aiScore, entities, status: "needs_grading" }
    });

    await prisma.vivaQuestion.deleteMany({ where: { submissionId } });
    await prisma.vivaQuestion.createMany({
      data: vivaQuestions.map(q => ({ text: q.text, added: false, marker: q.marker || null, submissionId }))
    });

    return NextResponse.json({ success: true, docTitle, summary, aiScore, entities, vivaQuestions });
  } catch (error) {
    console.error("[AI Evaluation] Evaluation API error:", error);
    return NextResponse.json({ error: "AI Evaluation failed: " + error.message }, { status: 500 });
  }
}