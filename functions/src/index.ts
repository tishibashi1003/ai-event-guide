import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getGenkitInstance } from "./utils/genkit";
import { gemini15Flash, textEmbedding004 } from "@genkit-ai/vertexai";
import { eventSearchPrompt } from "./prompts/eventSearch";
import { convertYYYYMMDDToTimestamp } from "./utils/date";
import { Event } from "./types/firestoreDocument";
import { OutputEventSchema } from "./types/prompt";
import { checkDuplicateEvent } from "./prompts/checkDeplicate";

initializeApp();

exports.scheduledGetEventFunction = onSchedule({
  schedule: "0 0 * * *",
  region: "asia-northeast1",
  secrets: ['GOOGLE_GENAI_API_KEY'],
  timeoutSeconds: 1800,
}, async (event) => {
  const db = getFirestore();

  try {
    // sleep関数の定義
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // genkitインスタンスの初期化
    const genkitInstance = await getGenkitInstance({
      model: gemini15Flash.withConfig({ googleSearchRetrieval: { disableAttribution: true } })
    });

    // 直近4週間の土日を取得
    const getWeekendDates = () => {
      const dates: Date[] = [];
      const today = new Date();

      // 4週間分（28日）の日付をチェック
      for (let i = 0; i < 28; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);

        // 土曜日（6）または日曜日（0）の場合、配列に追加
        if (date.getDay() === 6 || date.getDay() === 0) {
          dates.push(date);
        }
      }
      return dates;
    };

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}年${month}月${day}日`;
    };

    // 各土日に対してイベントを取得
    const weekendDates = getWeekendDates();

    for (const targetDate of weekendDates) {
      for (const genre of ["ショッピングモール", "住宅展示場", "スポーツ", "祭り", ""]) {
        try {
          const prefectureEvents = await eventSearchPrompt(genkitInstance, {
            address: {
              prefecture: "岐阜県",
            },
            targetDate: formatDate(targetDate),
            genre,
          });
          const parsedEventResult = OutputEventSchema.array().parse(prefectureEvents.output);

          const savedTargetDateEventList = await db.collection("events")
            .where("eventDate", "==", convertYYYYMMDDToTimestamp(targetDate.toISOString()))
            .get();

          console.log("savedTargetDateEventList", JSON.stringify(savedTargetDateEventList.docs.map(doc => doc.data()), null, 2));

          // イベントを個別に保存
          for (const event of parsedEventResult) {

            console.log("event", JSON.stringify(event, null, 2));

            const isDuplicateResult = await checkDuplicateEvent(genkitInstance, {
              target: event,
              eventList: savedTargetDateEventList.docs.map(doc => doc.data() as Event),
            });
            console.log("重複チェック結果:", isDuplicateResult.output);

            if (isDuplicateResult.output.isDuplicate) {
              continue;
            }

            const docId = `${event.eventDateYYYYMMDD}-${event.eventLocationNameEn.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            const docRef = db.collection("events").doc(docId);
            // @ts-expect-error custom 以下は型定義がない
            const renderedContent = prefectureEvents.custom.candidates[0].groundingMetadata.searchEntryPoint.renderedContent ?? "";

            const eventVector = await genkitInstance.embed({
              embedder: textEmbedding004,
              content: `${event.eventCategoryEn} ${event.eventLocationCityEn}`,
            });

            const eventData: Event = {
              id: docId,
              ...event,
              eventDate: convertYYYYMMDDToTimestamp(event.eventDateYYYYMMDD),
              // @ts-ignore vector が zod で定義されていないため
              eventVector: FieldValue.vector(eventVector),
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              renderedContent
            };

            await docRef.set(eventData);
            await sleep(30000);
          }

          // 各日付の処理完了後にログを記録
          await db.collection("scheduleLog").add({
            executedAt: new Date(),
            status: "success",
            targetDate: Timestamp.fromDate(targetDate),
            eventCount: parsedEventResult.length,
            message: `Successfully fetched and updated ${parsedEventResult.length} events for ${formatDate(targetDate)}`,
          });

        } catch (error) {
          console.error(`Error processing date ${formatDate(targetDate)}:`, error);

          // エラーログを記録するが、処理は続行
          await db.collection("scheduleLog").add({
            executedAt: new Date(),
            status: "error",
            targetDate: Timestamp.fromDate(targetDate),
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    console.log("Scheduled function completed processing all weekend dates");
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
  enforceAppCheck: true,
  maxInstances: 2,
  minInstances: 1,
}, async (request) => {
  const db = getFirestore();

  try {
    const {
      userId,
      limit = 10,
      startDate,
      endDate
    } = request.data;

    // App Checkのトークン検証
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        '認証されていないリクエストです。'
      );
    }

    // ユーザーIDの一致を確認
    if (request.auth.uid !== userId) {
      throw new HttpsError(
        'permission-denied',
        '不正なユーザーIDです。'
      );
    }

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
