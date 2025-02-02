import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getGenkitInstance } from "./utils/genkit";
import { gemini15Flash, textEmbedding004 } from "@genkit-ai/vertexai";
import { eventSearchPrompt } from "./prompts/eventSearch";
import { Event, OutputEventSchema } from "./types/event";
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

    // 日付範囲の計算
    const today = new Date();
    const after14Days = new Date(today);
    after14Days.setDate(today.getDate() + 14); // 14日後

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}年${month}月${day}日`;
    };

    // 各都道府県のイベントを検索
    const prefectureEvents = await eventSearchPrompt(genkitInstance, {
      address: {
        prefecture: "岐阜県",
      },
      targetDate: formatDate(after14Days),
    });
    const parsedEventResult = OutputEventSchema.array().parse(prefectureEvents.output);

    // イベント情報をFirestoreに保存
    const batch = db.batch();
    const eventsCollection = db.collection("events");

    // 新しいイベントを追加
    for (const event of parsedEventResult) {
      const docRef = eventsCollection.doc();

      // イベントの説明文からベクトルを生成
      const eventText = `${event.eventTitleJa}\n${event.eventDescriptionJa}\n${event.eventLocationNameJa}\n${event.eventCategoryEn}\n${event.eventLocationCity}`;
      const vector = await genkitInstance.embed({
        embedder: textEmbedding004,
        content: eventText,
      });

      const eventData: Event = {
        id: docRef.id,
        ...event,
        eventDate: convertYYYYMMDDToTimestamp(event.eventDateYYYYMMDD),
        // @ts-ignore vector が zod で定義されていないため
        eventVector: FieldValue.vector(vector),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }


      batch.set(docRef, eventData);
    }

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
