# fastify-api-template

Fastify + TypeScript で構築した API サーバーのテンプレート

## 主な構成

- **API サーバー**: Fastify (API Gateway + Lambda + ECR 構成)
- **API ドキュメント**: Swagger (CloudFront + S3 でホスティング)
- **インフラ管理**: AWS CDK
- **データベース**: DynamoDB
- **認証**: Cognito

## API ドキュメント

- デプロイ済みの Swagger UI は **[こちら](https://d8znd970cbcjg.cloudfront.net/)**

- **Basic 認証情報**は以下を参照：  
  [swagger-ui/src/basic-auth.js (L6–L7)](https://github.com/Inouey1008/fastify-api-template/blob/6c56759636854ef4796c6b6e292abe3275f4cfa9/swagger-ui/src/basic-auth.js#L6-L7)

## ビルドガイド　（ローカル開発）

### 1. Node.js のセットアップ

`.nvmrc` に指定されたバージョンの Node.js をインストールする

```sh
nvm install
nvm use
```

### 2. package のインストール

```sh
npm install
```

### 3. 環境変数の設定

`api/.env.exmaple` を参考にプロジェクトのルートに `api/.env` を作成する

```
cp api/.env.example api/.env
```

### 4. AWS CLI ログイン

- SSO 認証を使ってログインする

```sh
aws sso login --profile YOUR_AWS_ACCOUNT
```

### 5. Fastify アプリの起動

```sh
cd api
npm run dev
```

Fastify サーバーが `http://localhost:3000` で起動する

### 6. Swagger の起動

```sh
cd swagger-ui
npm run dev
```

API ドキュメントが http://localhost:3010 で確認可能
