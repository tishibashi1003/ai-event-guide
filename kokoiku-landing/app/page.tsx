import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Star, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">😊</span>
          </div>
          <span className="text-2xl font-bold text-amber-400">ココいく</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/auth">
              ログイン / 会員登録
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section with Background Shapes */}
      <section className="relative overflow-hidden">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="0" cy="0" r="30" fill="#FDE68A" fillOpacity="0.5" />
            <circle cx="100" cy="10" r="20" fill="#FCD34D" fillOpacity="0.4" />
            <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="#FBBF24" fillOpacity="0.3" />
            <rect x="80" y="70" width="30" height="30" fill="#F59E0B" fillOpacity="0.2" />
          </svg>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">週末をもっと楽しく、もっとワクワクに</h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12">
              家族みんなの「好き」から、素敵な週末のお出かけ先を見つけよう
            </p>
            <Button size="lg" className="rounded-full bg-amber-400 hover:bg-amber-500" asChild>
              <Link href="/auth">
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/50 backdrop-blur border-none">
            <CardContent className="pt-6">
              <div className="rounded-full w-12 h-12 bg-amber-100 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AIパーソナライズ</h3>
              <p className="text-gray-600">あなたの「好き」を学習し、最高の週末体験をご提案</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur border-none">
            <CardContent className="pt-6">
              <div className="rounded-full w-12 h-12 bg-amber-100 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">週末限定イベント</h3>
              <p className="text-gray-600">最新の週末イベント情報をリアルタイムで更新</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur border-none">
            <CardContent className="pt-6">
              <div className="rounded-full w-12 h-12 bg-amber-100 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">簡単操作</h3>
              <p className="text-gray-600">スワイプするだけの直感的な操作で理想の週末が見つかる</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-100 rounded-3xl -rotate-1"></div>
          <div className="relative bg-white rounded-3xl p-8 rotate-1">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">家族の思い出作りを、もっと楽しく</h2>
                <p className="text-gray-600 mb-6">
                  家族みんなの興味や好みを理解して、ぴったりな週末のお出かけスポットをご提案。スワイプするだけのカンタン操作で、新しい発見が待っています。
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    <span>近くの人気スポットを発見</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    <span>週末限定イベントをチェック</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span>お気に入りを保存</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sZg3GQnS34GXw916cXbRCPwHuExwAo.png"
                  alt="ココいくアプリのスクリーンショット"
                  className="rounded-xl shadow-2xl mx-auto max-w-[300px]"
                />
                <div className="absolute -bottom-6 -right-6 bg-amber-400 rounded-full p-4 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">さあ、素敵な週末を見つけましょう</h2>
        <p className="text-xl text-gray-600 mb-8">新しい週末の楽しみ方を見つけてみませんか</p>
        <Button size="lg" className="rounded-full bg-amber-400 hover:bg-amber-500" asChild>
          <Link href="/auth">
            ログイン / 会員登録
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 border-t">
        <p>© 2024 ココいく All rights reserved.</p>
      </footer>
    </div>
  )
}

