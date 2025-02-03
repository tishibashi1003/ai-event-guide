import { getFunctions } from 'firebase/functions';
import { httpsCallable } from 'firebase/functions';
import useSWR from 'swr';

const functions = getFunctions();
functions.region = 'asia-northeast1';

// Cloud Functionsのレスポンス型
export type CloudFunctionResponse<T> = {
  data: T;
  error: Error | null;
  isLoading: boolean;
  mutate: () => Promise<void>;
};

// findSimilarEventsの引数型
export type FindSimilarEventsParams = {
  userId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
};

// findSimilarEventsのレスポンス型
export type FindSimilarEventsResponse = {
  success: boolean;
  eventIds: string[];
  period: {
    start: string;
    end: string | null;
  };
};

// Cloud Functionsのフェッチャー
const functionFetcher = async <T, P>(
  functionName: string,
  params: P
): Promise<T> => {
  const callable = httpsCallable(functions, functionName);
  const result = await callable(params);
  return result.data as T;
};

/**
 * Cloud Functionsを呼び出すためのカスタムフック
 * @param functionName 関数名
 * @param params パラメータ
 * @returns レスポンス
 */
export function useFirebaseFunction<T, P>(
  functionName: string,
  params: P | null,
  options?: {
    disabled?: boolean;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
  }
) {
  const { data, error, isLoading, mutate } = useSWR(
    params && !options?.disabled ? [functionName, params] : null,
    ([name, p]) => functionFetcher<T, P>(name, p),
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

/**
 * findSimilarEventsを呼び出すためのカスタムフック
 * @param params パラメータ
 * @returns レスポンス
 */
export function useFindSimilarEvents(
  params: FindSimilarEventsParams | null,
  options?: {
    disabled?: boolean;
  }
) {
  return useFirebaseFunction<FindSimilarEventsResponse, FindSimilarEventsParams>(
    'findSimilarEvents',
    params,
    options
  );
}

// 他のCloud Functions用のカスタムフックもここに追加できます
