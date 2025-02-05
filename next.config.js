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
}

module.exports = nextConfig
