/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript チェッカーの設定
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: 'tsconfig.json',
  },

  // キャッシュと最適化の設定
  experimental: {
    serverActions: {
      allowedOrigins: ['zenn-hackathon-b8dca.web.app'],
    },
  },

  // ビルドの設定
  reactStrictMode: true,

  // 404ページの設定
  output: 'standalone',
}

module.exports = nextConfig
