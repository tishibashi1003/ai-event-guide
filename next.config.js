/** @type {import('next').NextConfig} */
const nextConfig = {
  // その他の設定...

  // ビルドキャッシュの設定
  experimental: {
    // ビルドキャッシュを有効化
    turbotrace: {
      enabled: true,
    },
  },

  // TypeScript チェッカーの設定
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: 'tsconfig.json',
  },
}

module.exports = nextConfig
