import { z } from "zod"

export interface Event {
  id: string
  title: string
  image: string
  date: string
  location: string
  distance: string
  price: string
  ageRange: string
  categories: string[]
  description: string
}

export const weekendEvents: Event[] = [
  {
    id: "1",
    title: "週末ファミリーピクニック",
    image: "/placeholder.svg?height=300&width=400",
    date: "2023年7月15日 10:00-16:00",
    location: "中央公園",
    distance: "2.5km",
    price: "無料",
    ageRange: "全年齢",
    categories: ["アウトドア", "自然", "家族向け"],
    description:
      "緑豊かな中央公園で、家族で楽しめるピクニックイベントを開催します。自然の中でリラックスしながら、様々なアクティビティやゲームを楽しめます。お弁当を持参して、素敵な週末をお過ごしください。",
  },
  {
    id: "2",
    title: "子供科学実験教室",
    image: "/placeholder.svg?height=300&width=400",
    date: "2023年7月16日 13:00-15:00",
    location: "市民科学館",
    distance: "4.2km",
    price: "500円",
    ageRange: "6-12歳",
    categories: ["教育", "科学", "体験"],
    description:
      "楽しみながら科学を学ぶ、子供向けの実験教室です。簡単な実験を通じて、科学の不思議さや面白さを体験できます。未来の科学者を目指す子供たちにおすすめです。",
  },
  {
    id: "3",
    title: "週末マルシェ",
    image: "/placeholder.svg?height=300&width=400",
    date: "2023年7月15日-16日 9:00-17:00",
    location: "駅前広場",
    distance: "1.0km",
    price: "入場無料",
    ageRange: "全年齢",
    categories: ["食", "ショッピング", "文化"],
    description:
      "地元の新鮮な野菜や手作り品が集まる週末マルシェ。美味しい食べ物や素敵な雑貨を見つけながら、地域の魅力を再発見しましょう。",
  },
]

export const customEvents: Event[] = [
  {
    id: "4",
    title: "夏休み工作教室",
    image: "/placeholder.svg?height=300&width=400",
    date: "2023年8月5日 10:00-12:00",
    location: "市民センター",
    distance: "3.0km",
    price: "1000円（材料費込）",
    ageRange: "5-15歳",
    categories: ["クラフト", "教育", "創作"],
    description:
      "夏休みの思い出作りに、オリジナルの工作を作ってみませんか？経験豊富な講師が丁寧に指導します。完成した作品はお持ち帰りいただけます。夏休みの自由研究にもピッタリです。",
  },
  {
    id: "5",
    title: "ファミリースポーツデー",
    image: "/placeholder.svg?height=300&width=400",
    date: "2023年8月12日 9:00-16:00",
    location: "市民総合体育館",
    distance: "5.5km",
    price: "一家族1000円",
    ageRange: "全年齢",
    categories: ["スポーツ", "健康", "家族向け"],
    description:
      "家族みんなで楽しめる様々なスポーツアクティビティを用意しています。バスケットボール、卓球、バドミントンなど、多彩な競技を体験できます。家族の絆を深めながら、健康的な一日を過ごしましょう。",
  },
  {
    id: "6",
    title: "夏の星空観察会",
    image: "/placeholder.svg?height=300&width=400",
    date: "2023年8月20日 20:00-22:00",
    location: "市立天文台",
    distance: "7.0km",
    price: "大人1000円、子供500円",
    ageRange: "全年齢",
    categories: ["科学", "自然", "教育"],
    description:
      "専門家のガイドで夏の星座を観察します。大型望遠鏡を使って、普段見ることのできない惑星や星雲も見られるかも。夏の夜空の魅力を存分に楽しみましょう。",
  },
]

export const kokoIkuListEvents: Event[] = [
  {
    id: "7",
    title: "夏祭り花火大会",
    image: "/placeholder.svg?height=300&width=400",
    date: "2023年8月15日 19:00-21:00",
    location: "河川敷公園",
    distance: "3.5km",
    price: "無料",
    ageRange: "全年齢",
    categories: ["お祭り", "花火", "夏のイベント"],
    description: "夏の夜空を彩る壮大な花火大会。地元の屋台も多数出店され、家族や友人と楽しい夏の思い出を作れます。",
  },
  {
    id: "8",
    title: "親子クッキング教室",
    image: "/placeholder.svg?height=300&width=400",
    date: "2023年8月22日 10:00-12:00",
    location: "コミュニティセンター",
    distance: "2.0km",
    price: "一組2000円",
    ageRange: "5歳以上",
    categories: ["料理", "親子", "教育"],
    description: "親子で楽しく料理を学びます。季節の食材を使った簡単でおいしいレシピに挑戦しましょう。",
  },
  {
    id: "9",
    title: "ミニ鉄道フェスティバル",
    image: "/placeholder.svg?height=300&width=400",
    date: "2023年9月2日-3日 10:00-17:00",
    location: "市民公園",
    distance: "4.8km",
    price: "大人800円、子供500円",
    ageRange: "全年齢",
    categories: ["鉄道", "模型", "家族向け"],
    description: "ミニチュア鉄道の乗車体験や、精巧な鉄道模型の展示など、鉄道ファンにはたまらないイベントです。",
  },
]

export const SearchEventInputSchema = z.object({
  prefecture: z.string(),
  city: z.string(),
});

export type SearchEventInput = z.infer<typeof SearchEventInputSchema>;
