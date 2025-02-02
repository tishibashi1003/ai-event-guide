import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getGenkitInstance } from "./utils/genkit";
import { gemini15Flash } from "@genkit-ai/vertexai";
import { eventSearchPrompt } from "./prompts/eventSearch";
import { OutputEventSchema } from "./types/event";
import { convertYYYYMMDDToTimestamp } from "./utils/date";

initializeApp();

exports.scheduledGetEventFunction = onSchedule({
  schedule: "0 0 * * *",
  region: "asia-northeast1",
  secrets: ['GOOGLE_GENAI_API_KEY'],
}, async (event) => {
  const db = getFirestore();

  try {
    // genkitインスタンスの初期化
    const genkitInstance = await getGenkitInstance({
      model: gemini15Flash.withConfig({ googleSearchRetrieval: { disableAttribution: true } })
    });


    // 各都道府県のイベントを検索
    const prefectureEvents = await eventSearchPrompt(genkitInstance, {
      address: {
        prefecture: "岐阜県",
        city: "垂井町",
      },
    });
    const parsedEventResult = OutputEventSchema.array().parse(prefectureEvents.output);


    // イベント情報をFirestoreに保存
    const batch = db.batch();
    const eventsCollection = db.collection("events");

    // 新しいイベントを追加
    parsedEventResult.forEach((event) => {
      const docRef = eventsCollection.doc();
      batch.set(docRef, {
        ...event,
        eventStartDateYYYYMMDD: convertYYYYMMDDToTimestamp(event.eventStartDateYYYYMMDD),
        eventEndDateYYYYMMDD: convertYYYYMMDDToTimestamp(event.eventEndDateYYYYMMDD),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();

    // ログを記録
    await db.collection("scheduleLog").add({
      executedAt: new Date(),
      status: "success",
      eventCount: parsedEventResult.length,
      message: `Successfully fetched and updated ${parsedEventResult.length} events`,
    });

    console.log(`Scheduled function executed successfully. Found ${parsedEventResult.length} events.`);
  } catch (error) {
    console.error("Error executing scheduled function:", error);

    // エラーログを記録
    await db.collection("scheduleLog").add({
      executedAt: new Date(),
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
});
