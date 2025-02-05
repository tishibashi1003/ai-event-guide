/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript チェッカーの設定
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: 'tsconfig.json',
  },

  // キャッシュと最適化の設定
  experimental: {
    // Next.js 14の推奨設定
    serverActions: true,
    serverComponentsExternalPackages: [],
  },

  // ビルドの設定
  swcMinify: true,
  reactStrictMode: true,
}

module.exports = nextConfig
