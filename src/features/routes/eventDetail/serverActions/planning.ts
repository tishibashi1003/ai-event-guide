'use server'

import { ExecutionsClient } from '@google-cloud/workflows';

// Cloud Workflows のリージョンとプロジェクトIDを設定
const location = 'asia-northeast1'; // 例: 'us-central1'
const projectId = 'zenn-hackathon-b8dca';

// ワークフローの名前
const workflowName = 'test';

interface WorkflowParams {
  eventLocation: string;
  eventPlace: string;
  eventCity: string;
  eventTitle: string;
  considerBaby: boolean;
  startLocation: string;
}

export async function executeWorkflow(params: WorkflowParams): Promise<string> {
  // ExecutionsClient の初期化
  const client = new ExecutionsClient();

  // ワークフローの実行リクエストを作成
  const request = {
    parent: client.workflowPath(projectId, location, workflowName),
    execution: {
      argument: JSON.stringify({
        location: params.eventLocation,
        place: params.eventPlace,
        current_location: params.startLocation,
        event_title: params.eventTitle,
        consider_baby: params.considerBaby,
      }),
    },
  };

  try {
    // ワークフローを実行
    const [executionResponse] = await client.createExecution(request);
    const executionName = executionResponse.name;
    console.log(`Workflow execution started: ${executionName}`);

    // 実行が完了するまでポーリング
    let execution;
    do {
      [execution] = await client.getExecution({ name: executionName });
      await new Promise(resolve => setTimeout(resolve, 2000));
    } while (execution.state === 'ACTIVE');

    console.log(`Workflow execution finished with state: ${execution.state}`);
    console.log(`Workflow result: ${execution.result}`);

    if (execution.state !== 'SUCCEEDED') {
      throw new Error(`Workflow execution failed with state: ${execution.state}`);
    }

    if (!execution.result) {
      return 'AIプランを生成できませんでした。';
    }

    // JSON文字列として解析してみる
    try {
      const jsonResult = JSON.parse(execution.result);
      return typeof jsonResult === 'string' ? jsonResult.replace(/\\n/g, '\n') : execution.result;
    } catch {
      // JSON解析に失敗した場合は、直接文字列として処理
      return execution.result.replace(/\\n/g, '\n');
    }

  } catch (error) {
    console.error('Error executing workflow:', error);
    throw error;
  }
}
