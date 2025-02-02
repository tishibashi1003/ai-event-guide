import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getGenkitInstance } from "./utils/genkit";
import { gemini15Flash } from "@genkit-ai/vertexai";

initializeApp();

exports.scheduledGetEventFunction = onSchedule({
  schedule: "0 0 * * *",
  region: "asia-northeast1",
  secrets: ['GOOGLE_GENAI_API_KEY'],
}, async (event) => {
  const db = getFirestore();

  try {
    // genkitインスタンスの初期化
    const genkitInstance = await getGenkitInstance({});

    // Geminiの接続テスト
    const geminiResult = await genkitInstance.generate(
      "こんにちは！今日の日付を教えてください。"
    );

    // Vertex AIの接続テスト（モデルを切り替えて）
    const vertexInstance = await getGenkitInstance({
      model: gemini15Flash.withConfig({ googleSearchRetrieval: { disableAttribution: true } })
    });

    const vertexResult = await vertexInstance.generate(
      "Hello! What is today's date?"
    );

    const writeResult = await db.collection("scheduleLog").add({
      executedAt: new Date(),
      status: "success",
      geminiResponse: geminiResult.text || "No response",
      vertexResponse: vertexResult.text || "No response",
    });

    console.log(`Scheduled function executed successfully. Log ID: ${writeResult.id}`);
    console.log("Gemini Response:", JSON.stringify(geminiResult, null, 2));
    console.log("Vertex AI Response:", JSON.stringify(vertexResult, null, 2));
  } catch (error) {
    console.error("Error executing scheduled function:", error);
    throw error;
  }
});
