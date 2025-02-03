import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall } from "firebase-functions/v2/https";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getGenkitInstance } from "./utils/genkit";
import { gemini15Flash, textEmbedding004 } from "@genkit-ai/vertexai";
import { eventSearchPrompt } from "./prompts/eventSearch";
import { convertYYYYMMDDToTimestamp } from "./utils/date";
import { Event, EventInteractionHistory, EventSchema } from "./types/firestoreDocument";
import { generateUserProfileVector } from "./utils/vector";
import { OutputEventSchema } from "./types/prompt";
import { EventInteractionInputSchema } from "./types/params";

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

exports.addEventInteractionAndRecalculateUserPreference = onCall({
  region: "asia-northeast1",
}, async (request) => {
  const db = getFirestore();

  try {
    const parsedData = EventInteractionInputSchema.parse(request.data);
    const { userId, interactions } = parsedData;

    // ユーザーの既存の履歴を取得（直近10件）
    const historiesSnapshot = await db
      .collection("eventInteractionHistories")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const histories: EventInteractionHistory[] = historiesSnapshot.docs.map(doc => doc.data() as EventInteractionHistory);

    // 新しいインタラクションを追加
    const batch = db.batch();
    const historyCollection = db.collection("eventInteractionHistories");
    const timestamp = Timestamp.now();

    // 各インタラクションに対してイベントベクトルを取得し、履歴を保存
    for (const { eventId, action } of interactions) {
      const eventDoc = await db.collection("events").doc(eventId).get();
      if (!eventDoc.exists) {
        console.warn(`Event not found: ${eventId}`);
        continue;
      }

      const parsedEvent = EventSchema.parse(eventDoc.data());
      const eventVector = parsedEvent?.eventVector;

      if (!eventVector) {
        console.warn(`Event vector not found for event ID: ${eventId}`);
        continue;
      }

      const historyData: EventInteractionHistory = {
        userId,
        eventId,
        action,
        eventVector,
        createdAt: timestamp,
      };

      const historyRef = historyCollection.doc();
      batch.set(historyRef, historyData);
      histories.push(historyData);
    }

    // ユーザープロファイルベクトルを生成
    const userVector = generateUserProfileVector(histories);

    // ユーザードキュメントを更新
    const userRef = db.collection("users").doc(userId);
    batch.update(userRef, {
      preferenceVector: FieldValue.vector(userVector),
      updatedAt: timestamp,
    });

    await batch.commit();

    return {
      success: true,
      message: "User interactions and vector updated successfully",
    };
  } catch (error) {
    console.error("Error updating user interactions:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred");
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
