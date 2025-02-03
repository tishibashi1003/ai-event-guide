import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall } from "firebase-functions/v2/https";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getGenkitInstance } from "./utils/genkit";
import { gemini15Flash, textEmbedding004 } from "@genkit-ai/vertexai";
import { eventSearchPrompt } from "./prompts/eventSearch";
import { convertYYYYMMDDToTimestamp } from "./utils/date";
import { Event } from "./types/firestoreDocument";
import { OutputEventSchema } from "./types/prompt";

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
      // イベントIDを生成（例：event-{eventTitleEn}-{eventDateYYYYMMDD}）
      const docId = `${event.eventDateYYYYMMDD}-${event.eventLocationNameEn.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const docRef = eventsCollection.doc(docId);

      // イベントの各フィールドを個別にベクトル化
      const eventVector = await genkitInstance.embed({
        embedder: textEmbedding004,
        content: `${event.eventCategoryEn} ${event.eventLocationCityEn}`,
      });

      const eventData: Event = {
        id: docId, // docRef.id から docId に変更
        ...event,
        eventDate: convertYYYYMMDDToTimestamp(event.eventDateYYYYMMDD),
        // @ts-ignore vector が zod で定義されていないため
        eventVector: FieldValue.vector(eventVector),
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


exports.findSimilarEvents = onCall({
  region: "asia-northeast1",
}, async (request) => {
  const db = getFirestore();

  try {
    const {
      userId,
      limit = 10,
      startDate, // ISO文字列形式（例：2024-02-15）
      endDate    // ISO文字列形式（例：2024-03-15）
    } = request.data;

    // ユーザードキュメントを取得
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    if (!userData?.preferenceVector) {
      throw new Error("User preference vector not found");
    }

    // 日付範囲の設定
    let startDateTime = new Date();
    startDateTime.setHours(0, 0, 0, 0);

    let endDateTime;

    // startDateが指定されている場合は、その日付を使用
    if (startDate) {
      startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
    }

    // endDateが指定されている場合は、その日付を使用
    if (endDate) {
      endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
    }

    // イベントコレクションに対してベクトル検索を実行
    const eventsCollection = db.collection("events");
    let query = eventsCollection.where('eventDate', '>=', Timestamp.fromDate(startDateTime));

    // 終了日が指定されている場合は、範囲条件を追加
    if (endDateTime) {
      query = query.where('eventDate', '<=', Timestamp.fromDate(endDateTime));
    }

    const vectorQuery = query.findNearest({
      vectorField: 'eventVector',
      queryVector: userData.preferenceVector,
      limit,
      distanceMeasure: 'EUCLIDEAN'
    });

    const querySnapshot = await vectorQuery.get();

    // イベントIDのリストを返す
    const eventIds = querySnapshot.docs.map(doc => doc.id);

    return {
      success: true,
      eventIds,
      period: {
        start: startDateTime.toISOString(),
        end: endDateTime ? endDateTime.toISOString() : null
      }
    };
  } catch (error) {
    console.error("Error finding similar events:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred");
  }
});
