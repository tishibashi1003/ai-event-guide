'use server'

import { ExecutionsClient } from '@google-cloud/workflows';

// Cloud Workflows のリージョンとプロジェクトIDを設定
const location = 'asia-northeast1'; // 例: 'us-central1'
const projectId = 'zenn-hackathon-b8dca';

// ワークフローの名前
const workflowName = 'test';

export async function executeWorkflow() {
  // ExecutionsClient の初期化
  const client = new ExecutionsClient();

  // ワークフローの実行リクエストを作成
  const request = {
    parent: client.workflowPath(projectId, location, workflowName),
    execution: {
      argument: JSON.stringify({ location: '岐阜市', place: 'アクアウォーク大垣', current_location: '大垣市' }), // ワークフローに渡す引数
    },
  };

  try {
    // ワークフローを実行
    const [executionResponse] = await client.createExecution(request);
    const executionName = executionResponse.name;
    console.log(`Workflow execution started: ${executionName}`);

    // 実行が完了するまでポーリング (オプション)
    let execution;
    do {
      [execution] = await client.getExecution({ name: executionName });
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒ごとにポーリング
    } while (execution.state === 'ACTIVE');

    console.log(`Workflow execution finished with state: ${execution.state}`);
    console.log(`Workflow result: ${execution.result}`);

  } catch (error) {
    console.error('Error executing workflow:', error);
  }
}
