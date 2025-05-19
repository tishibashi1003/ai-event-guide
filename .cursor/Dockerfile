FROM node:20

# 開発に必要なツールをインストール
RUN apt-get update && \
  apt-get install -y git vim curl && \
  rm -rf /var/lib/apt/lists/*

# yarn 1.22.19をグローバルインストール
RUN npm install -g yarn@1.22.19

# 作業ディレクトリ
WORKDIR /app

# ポート3000を公開
EXPOSE 3000

# デフォルトコマンド
CMD [ "yarn", "dev" ]
