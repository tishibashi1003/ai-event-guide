import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getGenkitInstance } from "./utils/genkit";
import { gemini15Flash } from "@genkit-ai/googleai";

initializeApp();

exports.scheduledGetEventFunction = onSchedule({
  schedule: "0 0 * * *",
  region: "asia-northeast1"
}, async (event) => {
  const db = getFirestore();

  try {
    // genkitインスタンスの初期化
    const genkitInstance = await getGenkitInstance({
      model: gemini15Flash,
    });

    // Geminiの接続テスト
    const geminiResult = await genkitInstance.generate(
      "こんにちは！今日の日付を教えてください。"
    );

    // Vertex AIの接続テスト（モデルを切り替えて）
    const vertexInstance = await getGenkitInstance({
      model: "vertex-ai/chat-bison",
    });

    const vertexResult = await vertexInstance.generate(
      "Hello! What is today's date?"
    );

    const writeResult = await db.collection("scheduleLog").add({
      executedAt: new Date(),
      status: "success",
      geminiResponse: geminiResult.message || "No response",
      vertexResponse: vertexResult.message || "No response",
    });

    console.log(`Scheduled function executed successfully. Log ID: ${writeResult.id}`);
    console.log("Gemini Response:", geminiResult.message);
    console.log("Vertex AI Response:", vertexResult.message);
  } catch (error) {
    console.error("Error executing scheduled function:", error);
    throw error;
  }
});
