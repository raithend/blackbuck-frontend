# フォトバブル API

フォトバブルの作成、取得、更新、削除を行うAPIエンドポイントです。

## エンドポイント

### 1. 全ページ共通 API

#### GET /api/photo-bubbles
特定のページのフォトバブルを取得します。

**クエリパラメータ:**
- `page_url` (必須): ページのURL（例: `/users/123`, `/classifications/dinosaurs`）

**レスポンス:**
```json
[
  {
    "id": "uuid",
    "name": "フォトバブル名",
    "user_id": "作成者のUUID",
    "page_url": "/users/123",
    "image_url": "https://example.com/image.jpg",
    "target_url": "https://example.com/link",
    "x_position": 100,
    "y_position": 150,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/photo-bubbles
新しいフォトバブルを作成します。

**リクエストボディ:**
```json
{
  "name": "フォトバブル名",
  "page_url": "/users/123",
  "image_url": "https://example.com/image.jpg",
  "target_url": "https://example.com/link",
  "x_position": 100,
  "y_position": 150
}
```

**必須フィールド:**
- `name`: フォトバブル名
- `page_url`: ページのURL
- `image_url`: 画像のURL

**オプションフィールド:**
- `target_url`: リンク先のURL
- `x_position`: X座標（デフォルト: 0）
- `y_position`: Y座標（デフォルト: 0）

#### PUT /api/photo-bubbles?id={id}
フォトバブルを更新します。

**クエリパラメータ:**
- `id` (必須): フォトバブルのID

**リクエストボディ:**
```json
{
  "name": "更新された名前",
  "image_url": "https://example.com/new-image.jpg",
  "x_position": 200,
  "y_position": 250
}
```

#### DELETE /api/photo-bubbles?id={id}
フォトバブルを削除します。

**クエリパラメータ:**
- `id` (必須): フォトバブルのID

### 2. プロフィールページ専用 API

#### GET /api/photo-bubbles/profile
プロフィールページ専用のフォトバブルを取得します。

**クエリパラメータ:**
- `account_id` (必須): プロフィール所有者のアカウントID

**レスポンス:**
```json
[
  {
    "id": "uuid",
    "name": "フォトバブル名",
    "user_id": "作成者のUUID",
    "page_url": "/users/123",
    "image_url": "https://example.com/image.jpg",
    "target_url": "https://example.com/link",
    "x_position": 100,
    "y_position": 150,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "profile_user_id": "123"
  }
]
```

### 3. 画像アップロード API

#### POST /api/upload/photo-bubble
フォトバブル用の画像をAWS S3にアップロードします。

**認証:** 必須（ログインユーザーのみ）

**リクエスト:**
- `Content-Type`: `multipart/form-data`
- `file`: 画像ファイル

**制限:**
- ファイルサイズ: 5MB以下
- 対応形式: JPEG, JPG, PNG, GIF, WebP

**レスポンス:**
```json
{
  "url": "https://bucket.s3.region.amazonaws.com/photo-bubbles/user-id/timestamp-filename.jpg",
  "filename": "image.jpg",
  "size": 1024000,
  "type": "image/jpeg"
}
```

## 認証

- **GET**: 認証不要（誰でも閲覧可能）
- **POST/PUT/DELETE**: 認証必須（ログインユーザーのみ）

## 権限制御

### 作成権限
- ログインユーザーは誰でもフォトバブルを作成可能
- プロフィールページ（`/users/{accountId}`）では、そのユーザーのみが作成可能

### 更新・削除権限
- 作成者のみが更新・削除可能

## 画像ストレージ

フォトバブルの画像はAWS S3に保存されます：

- **パス**: `photo-bubbles/{user_id}/{timestamp}-{filename}`
- **アクセス**: 公開読み取り可能
- **セキュリティ**: アップロード時のみ認証が必要

## 使用例

### フロントエンドでの使用

```typescript
// 画像をアップロード
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/photo-bubble', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  return result.url; // S3のURL
};

// 新しいフォトバブルを作成
const createPhotoBubble = async (data: PhotoBubbleCreate) => {
  const response = await fetch('/api/photo-bubbles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// プロフィールページのフォトバブルを取得
const getProfilePhotoBubbles = async (accountId: string) => {
  const response = await fetch(`/api/photo-bubbles/profile?account_id=${accountId}`);
  return response.json();
};

// フォトバブルを更新
const updatePhotoBubble = async (id: string, data: PhotoBubbleUpdate) => {
  const response = await fetch(`/api/photo-bubbles?id=${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// フォトバブルを削除
const deletePhotoBubble = async (id: string) => {
  const response = await fetch(`/api/photo-bubbles?id=${id}`, {
    method: 'DELETE',
  });
  return response.json();
};
```

## エラーレスポンス

```json
{
  "error": "エラーメッセージ"
}
```

### ステータスコード
- `400`: リクエストパラメータが不正
- `401`: 認証が必要
- `403`: 権限がない
- `404`: リソースが見つからない
- `500`: サーバーエラー 