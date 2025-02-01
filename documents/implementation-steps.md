# 実装手順書

## 1. 環境構築

### 1.1 プロジェクトの初期設定

```bash
# プロジェクトディレクトリの作成
mkdir ai-event-guide
cd ai-event-guide

# Next.jsプロジェクトの作成
yarn create next-app . --typescript --tailwind --eslint

# 必要なパッケージのインストール
yarn add firebase @firebase/auth
yarn add @google-cloud/aiplatform
yarn add @genkit-ai/googleai genkit
yarn add @heroicons/react @headlessui/react
yarn add react-swipeable react-map-gl
```

### 1.2 Firebase 設定

1. Firebase コンソールでプロジェクトを作成
2. Authentication 設定
   - Google 認証の有効化
3. Firestore の設定
   - データベースの作成
   - セキュリティルールの設定
   - ベクトル検索インデックスの作成

```javascript
// firestore.indexes.json
{
  "indexes": [],
  "fieldOverrides": [],
  "vectorConfigs": [
    {
      "name": "vector-search-config",
      "dimension": 1536,
      "metric": "COSINE",
      "type": "FLOAT32",
      "collections": ["swiped_events", "user_preference_vectors"]
    }
  ]
}
```

### 1.3 Google Cloud 設定

1. Vertex AI API の有効化

2. サービスアカウントの設定

   ```bash
   # 1. サービスアカウントの作成
   gcloud iam service-accounts create ai-event-guide-sa \
     --display-name="AI Event Guide Service Account"

   # 2. 必要な権限の付与
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:ai-event-guide-sa@$PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"

   # 3. 認証情報（キー）のダウンロード
   gcloud iam service-accounts keys create ./service-account-key.json \
     --iam-account=ai-event-guide-sa@$PROJECT_ID.iam.gserviceaccount.com
   ```

   このサービスアカウントは以下の目的で使用します：

   - Vertex AI（Gemini API）へのアクセス
   - Cloud Run からの認証済み API コール
   - Firebase Data Connect からの認証済みデータベースアクセス

   環境変数の設定：

   ```bash
   # 開発環境（.env.local）
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

   # Cloud Run環境
   # デプロイ時に --set-env-vars で設定
   GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/service-account-key.json
   ```

   セキュリティに関する注意事項：

   - サービスアカウントキーは Git リポジトリにコミットしないでください
   - 本番環境では、Cloud Run の Workload Identity を使用することを推奨します
   - キーのローテーションを定期的に行うことを推奨します

3. Gemini API の有効化

## 2. バックエンド実装

### 2.1 イベント情報収集システム（Vertex AI Studio & Genkit）

参考ドキュメント: [Genkit Google Search Sample](https://github.com/tanabee/genkit-google-search-sample?source=post_page-----7f142f5c9693--------------------------------)

```typescript
// src/lib/ai/eventCollector.ts
import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { GeminiService } from './gemini';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  writeBatch,
  doc,
} from 'firebase/firestore';

export class EventCollector {
  private geminiService: GeminiService;
  private ai: any;
  private db: any;

  constructor() {
    this.geminiService = new GeminiService();
    this.ai = genkit({
      plugins: [googleAI()],
      model: gemini15Flash,
    });
    this.db = getFirestore();
  }

  async collectAndProcessEvents() {
    // 1. イベント情報の収集
    const rawEvents = await this.collectRawEvents();

    // 2. イベント情報の構造化
    const structuredEvents = await this.structureEvents(rawEvents);

    // 3. ベクトル埋め込みの生成
    const eventsWithEmbeddings = await this.generateEventEmbeddings(
      structuredEvents
    );

    // 4. Firestoreへの保存
    await this.saveEvents(eventsWithEmbeddings);
  }

  private async collectRawEvents() {
    const prompt = `
      以下の条件で週末のイベント情報を収集し、JSONフォーマットで出力してください：
      - 家族向けイベント
      - 子供が楽しめるイベント
      - アウトドアアクティビティ
      - 文化・教育イベント

      出力フォーマット:
      {
        "events": [
          {
            "title": "イベント名",
            "description": "イベント説明",
            "event_date": "YYYY-MM-DD HH:mm:ss",
            "location_name": "開催場所",
            "latitude": 35.xxxx,
            "longitude": 139.xxxx,
            "price_info": {
              "adult": 1000,
              "child": 500
            },
            "age_restriction": "制限年齢",
            "tags": ["タグ1", "タグ2"]
          }
        ]
      }
    `;

    const { text } = await this.ai.generate(prompt);
    return JSON.parse(text).events;
  }

  private async structureEvents(rawEvents: any[]) {
    // Genkit を使用してイベント情報を構造化
    const structuredEvents = await Promise.all(
      rawEvents.map(async (event) => {
        const features = await this.geminiService.extractEventFeatures(event);
        return {
          ...event,
          ...features,
          created_at: new Date(),
        };
      })
    );
    return structuredEvents;
  }

  private async generateEventEmbeddings(events: any[]) {
    return Promise.all(
      events.map(async (event) => {
        const embedding = await this.geminiService.generateEmbedding(
          `${event.title} ${event.description}`
        );
        return {
          ...event,
          embedding_vector: embedding,
        };
      })
    );
  }

  private async saveEvents(events: any[]) {
    const batch = writeBatch(this.db);
    const eventsCollection = collection(this.db, 'swiped_events');

    events.forEach((event) => {
      const docRef = doc(eventsCollection);
      batch.set(docRef, {
        ...event,
        created_at: new Date(),
      });
    });

    await batch.commit();
  }
}
```

### 2.2 ベクトル検索の実装

```typescript
// src/lib/search/vectorSearch.ts
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

export class VectorSearch {
  private db: any;

  constructor() {
    this.db = getFirestore();
  }

  async findSimilarEvents(userPreferenceVector: number[], limit: number = 10) {
    const eventsRef = collection(this.db, 'swiped_events');

    const vectorQuery = eventsRef.findNearest({
      vectorField: 'embedding_vector',
      queryVector: userPreferenceVector,
      limit,
      distanceMeasure: 'COSINE',
    });

    const snapshot = await vectorQuery.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async findRecommendedEvents(userId: string, limit: number = 10) {
    // 1. ユーザーの好みベクトルを取得
    const userVectorRef = doc(this.db, 'user_preference_vectors', userId);
    const userVectorDoc = await userVectorRef.get();
    const userVector = userVectorDoc.data()?.preference_vector;

    if (!userVector) {
      throw new Error('User preference vector not found');
    }

    // 2. 直近30日間でいいねしたカテゴリを取得
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const likedEventsQuery = query(
      collection(this.db, 'swiped_events'),
      where('user_id', '==', userId),
      where('interaction_type', '==', 'like'),
      where('created_at', '>=', Timestamp.fromDate(thirtyDaysAgo))
    );

    const likedEventsSnapshot = await getDocs(likedEventsQuery);
    const likedCategories = new Set(
      likedEventsSnapshot.docs.map((doc) => doc.data().category)
    );

    // 3. ベクトル検索で類似イベントを取得
    const similarEvents = await this.findSimilarEvents(userVector, limit * 2);

    // 4. スコアの計算と並び替え
    const scoredEvents = similarEvents.map((event) => {
      const categoryBonus = likedCategories.has(event.category) ? 0.3 : 0;
      const vectorScore = 1 - event.distance; // distanceを類似度スコアに変換
      const totalScore = vectorScore * 0.7 + categoryBonus;

      return {
        ...event,
        score: totalScore,
      };
    });

    // スコアで降順ソートして上位limit件を返す
    return scoredEvents.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async updateUserPreferenceVector(userId: string, newVector: number[]) {
    const vectorRef = doc(this.db, 'user_preference_vectors', userId);

    await setDoc(
      vectorRef,
      {
        user_id: userId,
        preference_vector: newVector,
        updated_at: new Date(),
      },
      { merge: true }
    );
  }
}
```

### 2.4 AI 実装（Gemini API）

```typescript
// src/lib/ai/gemini.ts
import { VertexAI } from '@google-cloud/aiplatform';

export class GeminiService {
  private vertexAi: VertexAI;
  private modelName = 'gemini-pro';

  constructor() {
    this.vertexAi = new VertexAI({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: 'us-central1',
    });
  }

  // イベントテキストからベクトル埋め込みを生成
  async generateEmbedding(text: string): Promise<number[]> {
    const model = this.vertexAi.preview.getModel(this.modelName);
    const result = await model.embedText(text);
    return result.embeddings[0].values; // 1536次元のベクトルを返す
  }

  // イベントの特徴抽出
  async extractEventFeatures(description: string) {
    const prompt = `
      以下のイベント説明から特徴を抽出してください：
      - ジャンル（アウトドア、文化、スポーツなど）
      - 対象年齢層
      - 雰囲気（にぎやか、静か、など）
      - 予算帯

      イベント説明：
      ${description}
    `;

    const model = this.vertexAi.preview.getModel(this.modelName);
    const result = await model.generateText(prompt);
    return result.predictions[0];
  }

  // ユーザーの好みベクトル更新
  async updatePreferenceVector(
    currentVector: number[], // 現在のユーザーの好みベクトル
    eventVector: number[], // スワイプしたイベントのベクトル
    action: 'like' | 'dislike' | 'save' // スワイプの方向
  ): Promise<number[]> {
    // 重み付け係数の設定
    const weight = (() => {
      switch (action) {
        case 'save':
          return 0.3; // 「ココいく！」は強い正の影響
        case 'like':
          return 0.2; // 「いいね」は中程度の正の影響
        case 'dislike':
          return -0.1; // 「スキップ」は弱い負の影響
      }
    })();
    return currentVector.map((val, i) => {
      const newVal = val + eventVector[i] * weight;
      return Math.max(-1, Math.min(1, newVal)); // 値を-1から1の範囲に収める
    });
  }
}
```

### 2.5 ユーザー好みベクトル管理

```typescript
// src/lib/preferences/vectorManager.ts
export class UserPreferenceVectorManager {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  // 初期ベクトルの生成
  async generateInitialVector(preferences: {
    categories: string[];
    targetAge?: string;
    pricePreference?: string;
  }): Promise<number[]> {
    const preferencesText = `
      好みのカテゴリ: ${preferences.categories.join('、')}
      対象年齢: ${preferences.targetAge || '指定なし'}
      価格帯: ${preferences.pricePreference || '指定なし'}
    `;

    return await this.geminiService.generateEmbedding(preferencesText);
  }

  // スワイプ操作に基づくベクトル更新
  async updateVector(params: {
    currentVector: number[];
    eventVector: number[];
    interactionType: 'like' | 'dislike' | 'save';
  }): Promise<number[]> {
    const { currentVector, eventVector, interactionType } = params;

    // 重み付け係数の設定
    const weight = (() => {
      switch (interactionType) {
        case 'save':
          return 0.3; // 「ココいく！」は強い正の影響
        case 'like':
          return 0.2; // 「いいね」は中程度の正の影響
        case 'dislike':
          return -0.1; // 「スキップ」は弱い負の影響
      }
    })();

    // ベクトルの更新
    const updatedVector = currentVector.map((val, i) => {
      const newVal = val + eventVector[i] * weight;
      // -1から1の範囲に収める
      return Math.max(-1, Math.min(1, newVal));
    });

    // ベクトルの正規化
    const magnitude = Math.sqrt(
      updatedVector.reduce((sum, val) => sum + val * val, 0)
    );
    return updatedVector.map((val) => val / magnitude);
  }

  // 類似イベントの検索
  async findSimilarEvents(params: {
    userVector: number[];
    userId: string;
    events: Array<{
      id: string;
      category: string;
      embedding_vector: number[];
    }>;
    limit?: number;
  }): Promise<Array<{ id: string; score: number }>> {
    const { userVector, userId, events, limit = 10 } = params;

    // 直近30日間のいいねしたカテゴリを取得
    const likedCategories = await db.swiped_events.findMany({
      where: {
        user_id: userId,
        interaction_type: 'like',
        created_at: {
          gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { category: true },
      distinct: ['category'],
    });

    const likedCategorySet = new Set(likedCategories.map((e) => e.category));

    // 重み付きスコアの計算
    const scores = events.map((event) => {
      const cosineSimilarity = this.calculateCosineSimilarity(
        userVector,
        event.embedding_vector
      );

      const categoryScore = likedCategorySet.has(event.category) ? 0.3 : 0;

      return {
        id: event.id,
        score: cosineSimilarity * 0.7 + categoryScore,
      };
    });

    // スコアでソートして上位を返す
    return scores.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // コサイン類似度の計算
  private calculateCosineSimilarity(
    vectorA: number[],
    vectorB: number[]
  ): number {
    const dotProduct = vectorA.reduce(
      (sum, val, i) => sum + val * vectorB[i],
      0
    );
    const magnitudeA = Math.sqrt(
      vectorA.reduce((sum, val) => sum + val * val, 0)
    );
    const magnitudeB = Math.sqrt(
      vectorB.reduce((sum, val) => sum + val * val, 0)
    );
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

// 使用例
// src/app/api/events/route.ts
export async function POST(req: Request) {
  const vectorManager = new UserPreferenceVectorManager();
  const { userId, eventId, interactionType } = await req.json();

  try {
    // 1. 現在のユーザーベクトルを取得
    const currentVector = await db.user_preference_vectors.findUnique({
      where: { user_id: userId },
    });

    // 2. イベントベクトルを取得
    const event = await db.swiped_events.findUnique({
      where: { id: eventId },
    });

    if (!currentVector || !event) {
      throw new Error('Vector not found');
    }

    // 3. ベクトルを更新
    const updatedVector = await vectorManager.updateVector({
      currentVector: currentVector.preference_vector,
      eventVector: event.embedding_vector,
      interactionType,
    });

    // 4. 更新されたベクトルを保存
    await db.user_preference_vectors.update({
      where: { user_id: userId },
      data: {
        preference_vector: updatedVector,
        updated_at: new Date(),
      },
    });

    // 5. 類似イベントを検索
    const events = await db.swiped_events.findMany();
    const similarEvents = await vectorManager.findSimilarEvents({
      userVector: updatedVector,
      userId,
      events,
      limit: 10,
    });

    return Response.json({ similarEvents });
  } catch (error) {
    console.error('Vector update failed:', error);
    return Response.error();
  }
}
```

### 2.3 Firestore セキュリティルールの設定

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー認証のヘルパー関数
    function isAuthenticated() {
      return request.auth != null;
    }

    // 自分のデータかどうかをチェック
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // ユーザー情報
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId);
    }

    // スワイプしたイベント
    match /swiped_events/{eventId} {
      allow read: if isAuthenticated() && isOwner(resource.data.user_id);
      allow create: if isAuthenticated() && isOwner(request.resource.data.user_id);
      allow update: if isAuthenticated() && isOwner(resource.data.user_id);
    }

    // 保存済みイベント
    match /saved_events/{savedId} {
      allow read: if isAuthenticated() && isOwner(resource.data.user_id);
      allow create: if isAuthenticated() && isOwner(request.resource.data.user_id);
      allow delete: if isAuthenticated() && isOwner(resource.data.user_id);
    }

    // ユーザー設定
    match /user_preferences/{prefId} {
      allow read: if isAuthenticated() && isOwner(resource.data.user_id);
      allow write: if isAuthenticated() && isOwner(request.resource.data.user_id);
    }

    // ユーザーの好みベクトル
    match /user_preference_vectors/{vectorId} {
      allow read: if isAuthenticated() && isOwner(resource.data.user_id);
      allow write: if isAuthenticated() && isOwner(request.resource.data.user_id);
    }
  }
}
```

## 3. フロントエンド実装

### 3.1 Firebase 初期化

```typescript
// src/lib/firebase/config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase の初期化
export const initializeFirebase = () => {
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    return { app, db, auth };
  }
  return null;
};
```

### 3.2 認証コンテキストの実装

```typescript
// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // ユーザー情報をFirestoreに保存
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            firebase_uid: user.uid,
            display_name: user.displayName,
            email: user.email,
            created_at: new Date(),
            updated_at: new Date(),
            last_login: new Date(),
          });
        } else {
          await setDoc(
            userRef,
            {
              last_login: new Date(),
              updated_at: new Date(),
            },
            { merge: true }
          );
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

## 4. デプロイ手順

### 4.1 開発環境での実行

```bash
# 環境変数の設定
cp .env.example .env.local

# 必要な環境変数を設定
GOOGLE_CLOUD_PROJECT_ID=your-project-id
FIREBASE_CONFIG={"apiKey":"...","authDomain":"..."}

# 開発サーバーの起動
yarn dev
```

### 4.2 Cloud Run デプロイ

```bash
#!/bin/bash

# イメージのビルド
docker build -t ai-event-guide .

# Google Cloud へのログイン（初回のみ）
gcloud auth login

# プロジェクトの設定
gcloud config set project $PROJECT_ID

# Container Registry への認証
gcloud auth configure-docker

# イメージのタグ付けとプッシュ
docker tag ai-event-guide gcr.io/$PROJECT_ID/ai-event-guide
docker push gcr.io/$PROJECT_ID/ai-event-guide

# Cloud Run へのデプロイ
gcloud run deploy ai-event-guide \
  --image gcr.io/$PROJECT_ID/ai-event-guide \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID" \
  --set-env-vars="FIREBASE_CONFIG=$(cat firebase-config.json | base64)"
```

## 5. テスト実装

### 5.1 単体テスト

```bash
# テストの実行
yarn test
```

### 5.2 E2E テスト

```bash
# Cypressのインストール
yarn add -D cypress

# テストの実行
yarn cypress run
```

## 質問事項

1. Gemini API の具体的な利用制限や料金プランについて
2. ベクトル検索の具体的な実装方法（PostgreSQL での設定など）
3. イベント情報の収集方法の最適化について
4. 本番環境でのスケーリング戦略について

これらの情報が明確になり次第、実装手順書を更新いたします。

### 2.3 プロンプト管理（Dotprompt）

```typescript
// src/lib/ai/prompts/event-collection.prompt
---
model: googleai/gemini-1.5-flash
name: eventCollection
input:
  schema:
    eventTypes: string[]
    prefecture: string
    city: string
    maxTravelTime: number
---
以下の条件で週末のイベント情報を収集し、JSONフォーマットで出力してください：

イベントタイプ：
{{#each eventTypes}}
- {{this}}
{{/each}}

地域条件：
- 基準地点: {{prefecture}}{{city}}
- 移動時間の目安: 車で{{maxTravelTime}}分以内

出力フォーマット:
{
  "events": [
    {
      "title": "イベント名",
      "description": "イベント説明",
      "event_date": "YYYY-MM-DD HH:mm:ss",
      "location_name": "開催場所",
      "prefecture": "都道府県",
      "city": "市区町村",
      "latitude": 35.xxxx,
      "longitude": 139.xxxx,
      "estimated_travel_time": 30,
      "price_info": {
        "adult": 1000,
        "child": 500
      },
      "age_restriction": "制限年齢",
      "tags": ["タグ1", "タグ2"]
    }
  ]
}

注意事項：
- 移動時間の目安を超えるイベントは除外してください
- 公共交通機関でのアクセスが困難な場所は、その旨を説明に含めてください
- 駐車場情報があれば、説明に含めてください
```

### 2.4 プロンプトのバリアント管理

```typescript
// src/lib/ai/prompts/event-collection.pro.prompt
---
model: googleai/gemini-1.5-pro
name: eventCollection
input:
  schema:
    eventTypes: string[]
    prefecture: string
    city: string
    maxTravelTime: number
---
// ... same content as event-collection.prompt ...
```

プロンプトのバリアントを使用する場合：

```typescript
const eventCollectionPrompt = await this.ai.prompt('event-collection', {
  variant: process.env.NODE_ENV === 'production' ? 'pro' : undefined,
});
```

### 2.3 イベント収集システム

```typescript
// src/lib/eventCollection/collector.ts
export class EventCollector {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async collectEvents(searchParams: {
    location: string;
    searchRadius: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    preferences?: {
      categories?: string[];
      priceRange?: string;
      targetAge?: string;
    };
  }) {
    // 1. Google検索によるイベント情報の収集
    const searchPrompt = `
      ${searchParams.location}周辺で開催される
      ${searchParams.dateRange.start.toLocaleDateString()}から
      ${searchParams.dateRange.end.toLocaleDateString()}までの
      家族向けイベントを検索してください。
      ${
        searchParams.preferences?.categories
          ? `特に${searchParams.preferences.categories.join(
              '、'
            )}のイベントを重視してください。`
          : ''
      }
      検索結果は以下のJSON形式で返してください：
      {
        "events": [{
          "title": "イベント名",
          "description": "イベントの詳細な説明",
          "start_date": "開始日時",
          "end_date": "終了日時",
          "address": "開催場所の住所",
          "price_range": "価格帯",
          "target_age": "対象年齢",
          "category": "カテゴリ"
        }]
      }
    `;

    const model = this.geminiService.getModel();
    const searchResult = await model.generateText(searchPrompt);
    const rawEvents = JSON.parse(searchResult.predictions[0]).events;

    // 2. 各イベントの特徴抽出とベクトル生成
    const processedEvents = await Promise.all(
      rawEvents.map(async (event) => {
        const features = await this.geminiService.extractEventFeatures(
          event.description
        );
        const embedding = await this.geminiService.generateEmbedding(
          `${event.title} ${event.description}`
        );
        return {
          ...event,
          ...features,
          embedding_vector: embedding,
        };
      })
    );

    return processedEvents;
  }
}
```
