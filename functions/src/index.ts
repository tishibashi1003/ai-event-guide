import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

initializeApp();

exports.scheduledGetEventFunction = onSchedule("0 0 * * *", async (event) => {
  const db = getFirestore();

  try {
    const writeResult = await db.collection("scheduleLog").add({
      executedAt: new Date(),
      status: "success"
    });

    console.log(`Scheduled function executed successfully. Log ID: ${writeResult.id}`);
  } catch (error) {
    console.error("Error executing scheduled function:", error);
    throw error;
  }
});
