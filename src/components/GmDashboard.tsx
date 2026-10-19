"use client";

import React, { useState, useEffect } from "react";
import { MMProject } from "@/types/schema";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Download,
  Copy,
  Check,
  Radio,
  Clock,
  FileText,
  AlertTriangle,
  Navigation,
  Image as ImageIcon,
  Eye,
  X,
  Search,
  Building2,
  Anchor,
  HelpCircle,
  Flame,
  Maximize2,
  ExternalLink,
  Radar,
  Scroll,
  Shield,
  ShieldAlert,
  Scale,
  Users,
  EyeOff,
  Compass,
  Printer,
  Sparkles,
  PhoneCall,
} from "lucide-react";
import { audioEngine } from "@/utils/audioSynth";
import { generateSynopsisMarkdown, generateFullScriptMarkdown, printDocumentText } from "@/utils/scriptGenerator";
import { EruptionMonitoringChart } from "./EruptionMonitoringChart";
import { Day3TacticalMap } from "./Day3TacticalMap";
import { Day1NauticalMap } from "./Day1NauticalMap";

export interface Day2ActionOption {
  id: string;
  title: string;
  organization: string;
  evidenceId: string;
  badge: string;
  summary: string;
  detail: string;
  hasPhoto?: boolean;
  hasDocument?: boolean;
  documentUrl?: string;
  hasAudio?: boolean;
  audioCue?: string;
}

export const TOKYO_ACTIONS: Day2ActionOption[] = [
  {
    id: "T-1",
    title: "T-1: 防衛庁　小笠原周辺海域の水中聴音（ソナー）データの照会",
    organization: "防衛庁 / 海上自衛隊",
    evidenceId: "ev-sonar-shadow",
    badge: "深海ソナー",
    summary: "防衛庁パッシブソナー網の探知ログの照会。この生物は自ら周期的な振動をしており、海中に重低音が響いていることが分かった。複数拠点に設置されている受動型海中ソナーにより、水中物体の位置と速度が推定できた。それによると、水深800m以深を時速約6km（日速約150km / 3.3ノット）の一定ペースで北上する深海生体生物が伊豆・小笠原海溝沿いを移動中であると考えられる。",
    detail: "防衛庁パッシブソナー網の探知ログの照会。この生物は自ら周期的な振動をしており、海中に重低音が響いていることが分かった。複数拠点に設置されている受動型海中ソナーにより、水中物体の位置と速度が推定できた。それによると、水深800m以深を時速約6km（日速約150km / 3.3ノット）の一定ペースで北上する深海生体生物が伊豆・小笠原海溝沿いを移動中であると考えられる。",
  },
  {
    id: "T-2",
    title: "T-2: 西之島避難船舶の無線傍受ログ解析",
    organization: "海上保安庁 警備救難部",
    evidenceId: "ev-evacuation-radio-log",
    badge: "通信傍受",
    summary: "海上保安庁による西之島周辺避難船舶の交信記録。複数船舶より「噴火前に、見たこともないほど巨大な黒い生物の影が海中を移動していた。その後に西之島の噴火の煙が見えた」との入電が記録されていた。巨大生物の通過が西之島の噴火に先行している証言が複数ある。",
    detail: "海上保安庁による西之島周辺避難船舶の交信記録。複数船舶より「噴火前に、見たこともないほど巨大な黒い生物の影が海中を移動していた。その後に西之島の噴火の煙が見えた」との入電が記録されていた。巨大生物の通過が西之島の噴火に先行している証言が複数ある。",
  },
  {
    id: "T-3",
    title: "T-3: 海保捜索機MA722 巨大生物の航空偵察レポート（空撮写真）",
    organization: "海上保安庁 羽田航空基地",
    evidenceId: "ev-aerial-recon-report",
    badge: "航空写真",
    summary: "羽田航空基地MA722による観測記録。西之島の噴煙の観測のために急行した海上保安庁の飛行機により、水深10〜20mに浮上していた巨大な影と明瞭な航跡波（ケルビン波）を写真撮影。撮影から数分後、生物は深海へと潜航した。",
    detail: "羽田航空基地MA722による観測記録。西之島の噴煙の観測のために急行した海上保安庁の飛行機により、水深10〜20mに浮上していた巨大な影と明瞭な航跡波（ケルビン波）を写真撮影。撮影から数分後、生物は深海へと潜航した。",
    hasPhoto: true,
  },
];

export const FIELD_ACTIONS: Day2ActionOption[] = [
  {
    id: "F-1",
    title: "F-1: 遭難船スクリュー付着物の生体組織鑑定",
    organization: "小笠原水産センター / 研究所",
    evidenceId: "ev-propeller-tissue",
    badge: "生体組織鑑定",
    summary: "スクリューによってちぎれた生体組織を確認すると、軟体動物特有の柔軟性のある筋肉組織と、大きな吸盤とその内側に特徴的なリング状の硬い歯（キチン質の爪状構造）が並んでいた。水深600m以深に生息する【ダイオウイカの触手】と特定。Day 1で船を襲いスクリューを止めた生物の正体であることが判明した。しかし、記録されている通常のダイオウイカ（全長十数m）では、スクリューを止めるほどの力を出すことは考えにくい。",
    detail: "スクリューによってちぎれた生体組織を確認すると、軟体動物特有の柔軟性のある筋肉組織と、大きな吸盤とその内側に特徴的なリング状の硬い歯（キチン質の爪状構造）が並んでいた。水深600m以深に生息する【ダイオウイカの触手】と特定。Day 1で船を襲いスクリューを止めた生物の正体であることが判明した。しかし、記録されている通常のダイオウイカ（全長十数m）では、スクリューを止めるほどの力を出すことは考えにくい。",
  },
  {
    id: "F-2",
    title: "F-2: 遭難漁船・ホエールウォッチング船長の目撃聴取",
    organization: "二見港 漁業協同組合",
    evidenceId: "ev-fisherman-guide-testimony",
    badge: "ベテラン目撃調書",
    summary: "二見港での事情聴取。通常の成体マッコウクジラ（15〜18m）とは比較にならない規格外の巨大さであり、クジラ特有の潮吹きも一切確認されなかった。触手のようなものがあり、推定では100m近くはあったという。また、北へと向かっていることと、水中に入れたマイクからクジラとは異なる重低音の鳴き声のようなものを発していることが確認できた。",
    detail: "二見港での事情聴取。通常の成体マッコウクジラ（15〜18m）とは比較にならない規格外の巨大さであり、クジラ特有の潮吹きも一切確認されなかった。触手のようなものがあり、推定では100m近くはあったという。また、北へと向かっていることと、水中に入れたマイクからクジラとは異なる重低音の鳴き声のようなものを発していることが確認できた。",
  },
  {
    id: "F-3",
    title: "F-3: 巨大生物を目撃したベテランダイバーからの聴取",
    organization: "小笠原村診療所 救護所",
    evidenceId: "ev-diver-trauma-record",
    badge: "潜水士カルテ",
    summary: "潜水士からの事情聴取調書。西之島近海の水深40mから深海を見下ろした際、巨大な黒い影の中で無数の触手のようなものがうごめき、絡み合っている異様な姿を目撃。海中では音源の方向が特定しにくいものの、繰り返しその巨体から内臓を揺らすような激しい振動を感じ、しばらくして西之島が噴火したと証言している。",
    detail: "潜水士からの事情聴取調書。西之島近海の水深40mから深海を見下ろした際、巨大な黒い影の中で無数の触手のようなものがうごめき、絡み合っている異様な姿を目撃。海中では音源の方向が特定しにくいものの、繰り返しその巨体から内臓を揺らすような激しい振動を感じ、しばらくして西之島が噴火したと証言している。",
  },
  {
    id: "F-4",
    title: "F-4: 小笠原気象観測所の海底地震計・移動震源と特殊振動解析",
    organization: "気象庁 小笠原気象観測所",
    evidenceId: "ev-moving-epicenter",
    badge: "海底地震計・特殊振動解析",
    summary: "気象庁小笠原観測所の地震計データ。西之島の噴火以前に海底のマグマの上昇や熱水の移動に伴う振動周波を検知。この振動周波は南から北に向かって線を引くように伸びており、西之島周辺のマグマが南側から刺激されていたことが判明した。また、火山の噴火にともなって地震も検出されている。",
    detail: "気象庁小笠原観測所の地震計データ。西之島の噴火以前に海底のマグマの上昇や熱水の移動に伴う振動周波を検知。この振動周波は南から北に向かって線を引くように伸びており、西之島周辺のマグマが南側から刺激されていたことが判明した。また、火山の噴火にともなって地震も検出されている。",
  },
];

// ==========================================
// Day 3 合議制アクション（旧Day 4から前倒し新設）
// ==========================================
export const DAY3_TOKYO_ACTIONS: Day2ActionOption[] = [
  {
    id: "T-3A",
    title: "T-3A: 隕石について調べる",
    organization: "科学警察研究所 / 防衛装備庁 先端技術研究所",
    evidenceId: "ev-tokyo-meteorite-analysis",
    badge: "隕石精密分析",
    summary: "1ヶ月前の流星雨の際、朝潮危機管理官が小笠原の海岸で拾い東京へ持ち帰っていた小さな隕石片の精密分析。この隕石は強い磁気特性を持ち、さらに海水に浸けることで隕石内の微量金属が溶出することが判明。また、これまでに地球上に落ちてきた隕石とも共通点が多く見られる。",
    detail: "1ヶ月前の流星雨の際、朝潮危機管理官が小笠原の海岸で拾い東京へ持ち帰っていた小さな隕石片の精密分析。この隕石は強い磁気特性を持ち、さらに海水に浸けることで隕石内の微量金属が溶出することが判明。また、これまでに地球上に落ちてきた隕石とも共通点が多く見られる。",
  },
  {
    id: "T-3B",
    title: "T-3B: 八丈島の火山性微動について調べる",
    organization: "気象庁 地震火山部 / 防衛庁",
    evidenceId: "ev-hachijo-tremor-analysis",
    badge: "八丈島微動解析",
    summary: "八丈島・青ヶ島の地震計データと防衛庁のパッシブソナーの解析。防衛庁のパッシブソナーでの巨大生物の位置と、地震計データによる火山性微動とは同じ場所で起きている。巨大生物が海底で起こす特別な振動が、海底のマグマ溜まりを刺激している可能性がある。物体はこの北上ペース（時速約6km / 日速約150km）を正確に維持し、伊豆諸島沿いの海底を北上し続けている。",
    detail: "八丈島・青ヶ島の地震計データと防衛庁のパッシブソナーの解析。防衛庁のパッシブソナーでの巨大生物の位置と、地震計データによる火山性微動とは同じ場所で起きている。巨大生物が海底で起こす特別な振動が、海底のマグマ溜まりを刺激している可能性がある。物体はこの北上ペース（時速約6km / 日速約150km）を正確に維持し、伊豆諸島沿いの海底を北上し続けている。",
  },
  {
    id: "T-3C",
    title: "T-3C: 八丈島の島民からの情報を調べる",
    organization: "八丈島総合開発センター / 底土港漁協 / 島嶼警察署",
    evidenceId: "ev-hachijo-resident-and-sonar",
    badge: "八丈島島民証言",
    summary: "八丈島・三宅島の神社に古くから保管・奉納されていた隕石が、この一カ月の間に何者かによって組織的に盗み出されていたと発覚。さらに青ヶ島沖や八丈島付近の海へ不審船から海中へ何らかの物体を投棄していた目撃証言も得られた。",
    detail: "八丈島・三宅島の神社に古くから保管・奉納されていた隕石が、この一カ月の間に何者かによって組織的に盗み出されていたと発覚。さらに青ヶ島沖や八丈島付近の海へ不審船から海中へ何らかの物体を投棄していた目撃証言も得られた。",
  },
];

export const DAY3_FIELD_ACTIONS: Day2ActionOption[] = [
  {
    id: "F-3A",
    title: "F-3A: 小笠原気象観測所での落下隕石記録の調査",
    organization: "気象庁 小笠原気象観測所 地質研究室",
    evidenceId: "ev-ogasawara-meteorite-analysis",
    badge: "落下隕石記録",
    summary: "気象庁小笠原観測所の地質データ。古くから小笠原諸島周辺には同種の隕石が落下していた記録がある。さらに1ヶ月前の流星雨の目撃証言から、父島南西沖に一際大きな光を放つ流星が落下したと推定される目撃証言が複数確認できた。",
    detail: "気象庁小笠原観測所の地質データ。古くから小笠原諸島周辺には同種の隕石が落下していた記録がある。さらに1ヶ月前の流星雨の目撃証言から、父島南西沖に一際大きな光を放つ流星が落下したと推定される目撃証言が複数確認できた。",
  },
  {
    id: "F-3B",
    title: "F-3B: 神社での調査",
    organization: "小笠原神社",
    evidenceId: "ev-shrine-curse-stone",
    badge: "小笠原神社聞き取り",
    summary: "小笠原神社の聞き取り調査。神社の倉庫に保管されていた隕石が組織的に盗み出されていたことが発覚（八丈島・三宅島でも同様の盗難）。また、神主からは神社に伝わる古文書【盟約の祝詞】が存在し、巨大な生き物や火山の噴火が見られる場合には「船で海へ出て海中に長い筒を差し入れて読み上げる」ことになっていると聞き取った。ところが今回、この古文書も盗難にあっており、儀式が進められないという。現在の神主はこの祝詞の内容は分からず、もしこの祝詞を知っているとすると、就職のために東京に出た元神主の子どもである【吉備津】しかいないという。（次の日以降東京側での追加調査が可能）",
    detail: "小笠原神社の聞き取り調査。神社の倉庫に保管されていた隕石が組織的に盗み出されていたことが発覚（八丈島・三宅島でも同様の盗難）。また、神主からは神社に伝わる古文書【盟約の祝詞】が存在し、巨大な生き物や火山の噴火が見られる場合には「船で海へ出て海中に長い筒を差し入れて読み上げる」ことになっていると聞き取った。ところが今回、この古文書も盗難にあっており、儀式が進められないという。現在の神主はこの祝詞の内容は分からず、もしこの祝詞を知っているとすると、就職のために東京に出た元神主の子どもである【吉備津】しかいないという。（次の日以降東京側での追加調査が可能）",
  },
  {
    id: "F-3C",
    title: "F-3C: 不審なダイバーたちについての調査",
    organization: "小笠原海運 二見港貨物取扱所",
    evidenceId: "ev-diver-shipping-waybill",
    badge: "貨物台帳＆職員証言",
    summary: "港の貨物台帳と港の職員からの聞き取り。Day 1でダイバー達が海から引き揚げた大型冷凍ボックスは「静岡県・富士山麓の民家」宛てに発送されていた。輸送を担当した港の職員は、氷が入っていたにしても異様に重かったと証言。",
    detail: "港の貨物台帳と港の職員からの聞き取り。Day 1でダイバー達が海から引き揚げた大型冷凍ボックスは「静岡県・富士山麓の民家」宛てに発送されていた。輸送を担当した港の職員は、氷が入っていたにしても異様に重かったと証言。",
  },
  {
    id: "F-3D",
    title: "F-3D: 撮影した画像の分析",
    organization: "海洋科学大学 小笠原研究所 / 小笠原救難隊",
    evidenceId: "ev-photo-deep-analysis",
    badge: "画像解析",
    summary: "Day 3索敵作戦で得られた写真の画像解析。黒い影の輪郭を精査した結果、単一の巨大生物ではなく、無数の深海生物や触手が密集・結合した【超巨大群体（コロニー）】であると考えられる。",
    detail: "Day 3索敵作戦で得られた写真の画像解析。黒い影の輪郭を精査した結果、単一の巨大生物ではなく、無数の深海生物や触手が密集・結合した【超巨大群体（コロニー）】であると考えられる。",
  },
];

// ==========================================
// Day 4 合議制アクション（旧Day 5から前倒し新設）
// ※Day 3で未選択の項目も繰り越し調査可能
// ==========================================
export const DAY4_TOKYO_ACTIONS: Day2ActionOption[] = [
  {
    id: "T-4A",
    title: "T-4A: 富士山麓の発送先民家についての調査",
    organization: "警視庁公安部 / 静岡県警",
    evidenceId: "ev-cult-cargo",
    badge: "盗難隕石投棄＆富士山麓搬入",
    summary: "静岡県警と警視庁の合同捜査の報告。もともと小笠原・八丈島・三宅島の神社に保管・奉納されていた隕石が盗難にあっていた件についての捜査報告。盗難に前後してレジャーボートの貸し出し記録があり、青ヶ島沖・八丈島付近・三宅島付近でダイバー達が利用。個人情報が確認できる船長は船の利用を依頼されたのみで、乗り込んだ数名の人間は偽名を使っており、特定ができていない。ダイバー達が小笠原の海から引き揚げたクーラーボックスについても調査。輸送された先の、富士山麓の民家に普段から人は住んでいなかった。配達員によると、受け取りの際には地元では見かけない人がいて、荷物を車に乗せて富士山麓のほうへ向かったという。",
    detail: "静岡県警と警視庁の合同捜査の報告。もともと小笠原・八丈島・三宅島の神社に保管・奉納されていた隕石が盗難にあっていた件についての捜査報告。盗難に前後してレジャーボートの貸し出し記録があり、青ヶ島沖・八丈島付近・三宅島付近でダイバー達が利用。個人情報が確認できる船長は船の利用を依頼されたのみで、乗り込んだ数名の人間は偽名を使っており、特定ができていない。ダイバー達が小笠原の海から引き揚げたクーラーボックスについても調査。輸送された先の、富士山麓の民家に普段から人は住んでいなかった。配達員によると、受け取りの際には地元では見かけない人がいて、荷物を車に乗せて富士山麓のほうへ向かったという。",
  },
  {
    id: "T-4B",
    title: "T-4B: 都内にいる元神主の子どもの捜索",
    organization: "警視庁捜査共助課 / 小笠原神社関係者",
    evidenceId: "ev-shrine-lineage",
    badge: "元神主の子どもの口伝",
    summary: "数年前に東京へ出た元神主の子ども【吉備津】を探し出し聴取。生前の父から『祝詞は声高に日本語を読むのではなく、舌を弾いてクリック音を海中筒から放つ』と教わっていた。祝詞のクリック音は「（カッ・カッ）（ド・ドーン）（チ・トン・チ）（カ・カ・カカッ！）（チチチチチチッ！）（タン・タン・タン）」であり、日本語をあてはめたとき、その盟約の祝詞は「人（ひと）・勇魚（いさ）・契り（ちぎり）、集ひ来（つどひこ）、大獲物ぞ（おほえものぞ）、喰らへ（くらへ）」となる。",
    detail: "数年前に東京へ出た元神主の子ども【吉備津】を探し出し聴取。生前の父から『祝詞は声高に日本語を読むのではなく、舌を弾いてクリック音を海中筒から放つ』と教わっていた。祝詞のクリック音は「（カッ・カッ）（ド・ドーン）（チ・トン・チ）（カ・カ・カカッ！）（チチチチチチッ！）（タン・タン・タン）」であり、日本語をあてはめたとき、その盟約の祝詞は「人（ひと）・勇魚（いさ）・契り（ちぎり）、集ひ来（つどひこ）、大獲物ぞ（おほえものぞ）、喰らへ（くらへ）」となる。",
    hasAudio: true,
    audioCue: "kibitsu-click",
  },
];

export const DAY4_FIELD_ACTIONS: Day2ActionOption[] = [
  {
    id: "F-4A",
    title: "F-4A: 朝倉教授の研究ノートについての調査",
    organization: "海洋科学大学 小笠原研究所 朝倉研究室",
    evidenceId: "ev-asakura-notes-origin",
    badge: "学術起源＆盟約口伝ノート",
    summary: "名誉教授ロバート・ディーツ博士に師事した朝倉教授の学術原点と、紙ではなく口伝で伝えられてきた『座礁しかけた鯨の救出』『漂流者の救助』を通じて交わされた人と鯨の約束を記した未発表ノートを回収する。",
    detail: "名誉教授ロバート・ディーツ博士に師事した朝倉教授の学術原点と、紙ではなく口伝で伝えられてきた『座礁しかけた鯨の救出』『漂流者の救助』を通じて交わされた人と鯨の約束を記した未発表ノートを回収する。",
  },
  {
    id: "F-4D",
    title: "F-4D: 小笠原社記（抄）の調査",
    organization: "小笠原神社 倉庫",
    evidenceId: "ev-ancient-shrine-scroll",
    badge: "小笠原社記（抄）",
    summary: "小笠原神社に保管されていた古い年代記（過去の異変記録）の精査。倉庫から盗難された『盟約の祝詞』の本文そのものは記載されていないものの、江戸時代中期の記録に、過去の海底噴火と海鳴りに関する記述が確認された。",
    detail: "小笠原神社に保管されていた古い年代記（過去の異変記録）の精査。倉庫から盗難された『盟約の祝詞』の本文そのものは記載されていないものの、江戸時代中期の記録に、過去の海底噴火と海鳴りに関する記述が確認された。",
    hasDocument: true,
    documentUrl: "/images/day4_shrine_chronicle.svg",
  },
];

export const DAY5_NEW_FIELD_ACTIONS: Day2ActionOption[] = [
  {
    id: "F-5A",
    title: "F-5A: クジラの鳴音（コーダ）に関する論文草稿の調査",
    organization: "海洋科学大学 小笠原研究所 朝倉研究室",
    evidenceId: "ev-asakura-notes-syntax",
    badge: "コーダ構文規則ドラフト",
    summary: "クリック間隔（ICI）と連鎖規則によって構成される高度な言語体系。この構文規則と音響実録ログにより、人間側からクジラ言語でメッセージを組み立てる道筋が拓かれる。（マッコウクジラのコーダは「はい」のみ単独で機能し、他は2語以上、最大10語の連続で長文を構成するという動物言語学の先駆的構文規則と実録音響を発見）",
    detail: "クリック間隔（ICI）と連鎖規則によって構成される高度な言語体系。この構文規則と音響実録ログにより、人間側からクジラ言語でメッセージを組み立てる道筋が拓かれる。（マッコウクジラのコーダは「はい」のみ単独で機能し、他は2語以上、最大10語の連続で長文を構成するという動物言語学の先駆的構文規則と実録音響を発見）",
  },
];

// 後方互換性エイリアス
export const DAY5_TOKYO_ACTIONS = DAY4_TOKYO_ACTIONS;
export const DAY5_FIELD_ACTIONS = [...DAY4_FIELD_ACTIONS, ...DAY5_NEW_FIELD_ACTIONS];

interface GmDashboardProps {
  project: MMProject;
  onNavigateToChart?: () => void;
}

export const GmDashboard: React.FC<GmDashboardProps> = ({ project, onNavigateToChart }) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Day 2 合議制アクションの選択状態（東京: 1枠, 現地: 2枠）
  const [selectedTokyoAction, setSelectedTokyoAction] = useState<string>("T-3");
  const [selectedFieldActions, setSelectedFieldActions] = useState<string[]>(["F-1", "F-3"]);

  // Day 3 合議制アクションの選択状態（東京: 1枠, 現地: 2枠）
  const [selectedDay3TokyoAction, setSelectedDay3TokyoAction] = useState<string>("T-3A");
  const [selectedDay3FieldActions, setSelectedDay3FieldActions] = useState<string[]>(["F-3A", "F-3B"]);

  // Day 4 合議制アクションの選択状態（東京: 1枠, 現地: 2枠 / Day 3繰り越し含む）
  const [selectedDay4TokyoAction, setSelectedDay4TokyoAction] = useState<string>("T-4A");
  const [selectedDay4FieldActions, setSelectedDay4FieldActions] = useState<string[]>(["F-4A", "F-4D"]);

  // Day 5 総力調査アクションの選択状態（東京: 1枠, 現地: 2枠 / 未選択プールから選択）
  const [selectedDay5TokyoAction, setSelectedDay5TokyoAction] = useState<string>("T-3B");
  const [selectedDay5FieldActions, setSelectedDay5FieldActions] = useState<string[]>(["F-5A", "F-3C"]);

  // Day 3 巨大生物の呼称コードネーム（ワタツミ / クスルフ / 自由入力）
  const [creatureCodename, setCreatureCodename] = useState<string>("ワタツミ");
  // Day 6 作戦命名（オペレーション名）
  const [operationName, setOperationName] = useState<string>("オペレーション・ワタツミ");

  // Day 3 司令官決定の反映（防衛出動要請あり vs なし）
  const [day3GmHqDecision, setDay3GmHqDecision] = useState<"defense_dispatch" | "no_dispatch">("defense_dispatch");
  // Day 4 終盤意思決定：進路予測（東京ルート vs 富士山ルート）
  const [day4GmDestinationDecision, setDay4GmDestinationDecision] = useState<"tokyo" | "fuji">("fuji");

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [chartModalDay, setChartModalDay] = useState<3 | 4 | 5>(3);
  const [isTacticalModalOpen, setIsTacticalModalOpen] = useState(false);
  const [isDay1ModalOpen, setIsDay1ModalOpen] = useState(false);
  const [day1ViewMode, setDay1ViewMode] = useState<"investigation" | "tactical">("tactical");

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPhotoModalOpen(false);
        setIsChartModalOpen(false);
        setIsTacticalModalOpen(false);
        setIsDay1ModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleFieldAction = (id: string) => {
    setSelectedFieldActions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 2) {
          return [prev[1], id];
        }
        return [...prev, id];
      }
    });
  };

  const handleToggleDay3FieldAction = (id: string) => {
    setSelectedDay3FieldActions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 2) {
          return [prev[1], id];
        }
        return [...prev, id];
      }
    });
  };

  const handleToggleDay4FieldAction = (id: string) => {
    setSelectedDay4FieldActions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 2) {
          return [prev[1], id];
        }
        return [...prev, id];
      }
    });
  };

  const handleToggleDay5FieldAction = (id: string) => {
    setSelectedDay5FieldActions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 2) {
          return [prev[1], id];
        }
        return [...prev, id];
      }
    });
  };

  // 全アクション・繰り越しプールの計算
  const ALL_TOKYO_ACTIONS = [...DAY3_TOKYO_ACTIONS, ...DAY4_TOKYO_ACTIONS];
  const ALL_FIELD_ACTIONS = [...DAY3_FIELD_ACTIONS, ...DAY4_FIELD_ACTIONS];
  const ALL_ACTION_DEFS = [...ALL_TOKYO_ACTIONS, ...ALL_FIELD_ACTIONS];

  const day3TokyoChosen = selectedDay3TokyoAction ? [selectedDay3TokyoAction] : [];
  const day3FieldChosen = selectedDay3FieldActions;

  // Day 4で選べる候補（DAY4新規 ＋ Day 3で未選択のDAY3アクション）
  const day4AvailableTokyoActions = [
    ...DAY4_TOKYO_ACTIONS,
    ...DAY3_TOKYO_ACTIONS.filter((a) => !day3TokyoChosen.includes(a.id)),
  ];
  const day4AvailableFieldActions = [
    ...DAY4_FIELD_ACTIONS,
    ...DAY3_FIELD_ACTIONS.filter((a) => !day3FieldChosen.includes(a.id)),
  ];

  const day4TokyoChosen = selectedDay4TokyoAction ? [selectedDay4TokyoAction] : [];
  const day4FieldChosen = selectedDay4FieldActions;

  // Day 5で選べる候補（Day 3〜4で未選択の全アクション）
  const pastChosenTokyo = [...day3TokyoChosen, ...day4TokyoChosen];
  const pastChosenField = [...day3FieldChosen, ...day4FieldChosen];

  const day5AvailableTokyoActions = ALL_TOKYO_ACTIONS.filter((a) => !pastChosenTokyo.includes(a.id));
  const day5AvailableFieldActions = ALL_FIELD_ACTIONS.filter((a) => !pastChosenField.includes(a.id));

  // タイマー
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayAudioCue = (cue: string) => {
    if (cue === "coda-tape") {
      audioEngine?.playWordSound("word-gather", 1.0);
    } else if (cue === "tongue-click") {
      audioEngine?.playTongueClickSound(2400);
    } else if (cue === "kibitsu-click") {
      audioEngine?.playKibitsuOralClickDemo();
    } else if (cue === "sea-tube") {
      audioEngine?.playSeaTubeAcousticDemo();
    } else if (cue === "sonar-broadcast") {
      audioEngine?.playSonarBroadcastAndWhaleResponse();
    } else if (cue === "climax-call") {
      audioEngine?.playMessageSequence(
        [
          "word-human",
          "word-whale",
          "word-promise",
          "word-subsea-volcano",
          "word-go-north",
          "word-search",
          "word-giant-prey",
          "word-gather",
        ],
        1.0
      );
    }
  };

  const [copiedType, setCopiedType] = useState<"full" | "synopsis" | null>(null);

  const handleCopy = (type: "full" | "synopsis") => {
    const text = type === "full" ? generateFullScriptMarkdown(project) : generateSynopsisMarkdown(project);
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownload = (type: "full" | "synopsis") => {
    const text = type === "full" ? generateFullScriptMarkdown(project) : generateSynopsisMarkdown(project);
    const filename =
      type === "full"
        ? `${project.title}_完全台本.md`
        : `${project.title}_企画概要・プロット紹介.txt`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentTimelineStep = project.timeline.find((t) => t.dayNumber === currentDay);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 p-6 text-slate-100">
      {/* 上部：GMステータスバー＆タイマー */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="font-bold text-sm text-white">GM 進行コンソール</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-1.5 font-mono text-base font-bold text-indigo-400 border border-slate-800">
            <Clock className="h-4 w-4 text-slate-400" />
            {formatTime(timerSeconds)}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="rounded bg-indigo-600 p-1.5 text-white hover:bg-indigo-500 transition"
              title={isTimerRunning ? "一時停止" : "スタート"}
            >
              {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="rounded border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white transition"
              title="リセット"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* プレイ人数バッジ */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-bold text-white">{project.playerCount}名</span>
            <span className="text-[10px] text-slate-400">
              (東京2名 / 小笠原{project.playerCount === 5 ? "3名" : "4名"})
              {project.playerCount === 6 ? " 【本編・推奨】" : " 【調整用】"}
            </span>
          </div>
        </div>

        {/* テキストエクスポートボタン群 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => handleCopy("synopsis")}
              className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-slate-900 transition"
              title="企画書・プロット紹介をクリップボードにコピー"
            >
              {copiedType === "synopsis" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedType === "synopsis" ? "概要コピー完了！" : "企画・プロット概要をコピー"}
            </button>
            <button
              onClick={() => handleDownload("synopsis")}
              className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="企画・プロット概要をテキストファイル(.txt)保存"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1">
            <button
              onClick={() => handleCopy("full")}
              className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              title="全設定・HO・タイムライン・証拠を含む完全台本をコピー"
            >
              {copiedType === "full" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copiedType === "full" ? "完全台本コピー完了！" : "完全台本をコピー"}
            </button>
            <button
              onClick={() => handleDownload("full")}
              className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="完全台本をMarkdownファイル(.md)保存"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => printDocumentText(`${project.title} - 完全シナリオ台本`, generateFullScriptMarkdown(project))}
              className="flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition shadow"
              title="完全台本をA4白背景で印刷・PDF保存"
            >
              <Printer className="h-3.5 w-3.5" />
              🖨️ 印刷
            </button>
          </div>
        </div>

      </div>

      {/* メインGM作業エリア */}
      <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden">
        {/* 左側：Day切り替えと演出台詞スクリプト */}
        <div className="col-span-8 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
          {/* Dayタブ */}
          <div className="mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-3">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                onClick={() => setCurrentDay(d)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  currentDay === d
                    ? "bg-indigo-600 text-white shadow"
                    : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                Day {d}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <span className="text-[11px] font-bold text-indigo-400 uppercase">
                DAY {currentDay} 状況概要
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {currentTimelineStep?.situationTitle}
              </h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                {currentTimelineStep?.incidentOverview}
              </p>
            </div>

            {/* GM演出用NPCセリフ・ナレーションスクリプト */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-cyan-400" />
                  🎙️ GM演出用ナレーション（合同対策本部 首席オペレーター 長津）
                </h4>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-800">
                  CHIEF OPERATOR NAGATSU
                </span>
              </div>

              {currentDay === 1 && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="rounded border border-indigo-900/60 bg-indigo-950/30 p-3">
                    <span className="font-bold text-indigo-300">【フェーズ1：緊急回線接続 ＆ 各員自己紹介】</span>
                    <p className="text-slate-300 mt-1 italic">
                      （🎙️ 首席オペレーター 長津）:「――東京本部および小笠原現地チームへ緊急入信。当回線は海上保安庁・関係機関合同の緊急対策回線です。小笠原南西沖にて民間チャーター船（総トン数約40t）が突如全電源を喪失、AISも停波し、救難信号を発信した直後に通信が途絶いたしました。これより合同海難救助チームを開設します。朝潮危機管理官をはじめ各員、氏名・所属・現場で担える専門役割の点呼および自己紹介をお願いいたします」
                    </p>
                  </div>

                  <div className="rounded border border-amber-900/60 bg-amber-950/20 p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-amber-300">【フェーズ2：遭難海図展開 ＆ 漂流捜索方針の決定】</span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setDay1ViewMode("investigation");
                            setIsDay1ModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded bg-cyan-700 hover:bg-cyan-600 px-2.5 py-1 text-[11px] font-bold text-white transition shadow"
                        >
                          <EyeOff className="h-3 w-3" /> 白地図を開く
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDay1ViewMode("tactical");
                            setIsDay1ModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 text-[11px] font-bold text-white transition shadow"
                        >
                          <Eye className="h-3 w-3" /> GM解析図を開く
                        </button>
                        {onNavigateToChart && (
                          <button
                            type="button"
                            onClick={onNavigateToChart}
                            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] font-bold text-slate-300 transition border border-slate-700"
                          >
                            <Navigation className="h-3 w-3" /> 専用海図画面
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 italic">
                      （🎙️ 首席オペレーター 長津）:「――救難信号の発信から既に20分が経過しております。救難艇が現場海域へ到達するまでさらに40分――合計1時間、遭難船は漂流し続けます。大型スクリーンに【漂流海図】を展開いたしました。朝潮危機管理官（PC1）、坂凪救難担当官（PC3）、太刀魚観測員（PC4）をはじめ各員、暗礁群の配置と海流を考慮し、救難艇を急行させるべき捜索海域の決定をお願いいたします」
                    </p>
                  </div>

                  <div className="rounded border border-emerald-900/60 bg-emerald-950/20 p-3 space-y-2.5">
                    <span className="font-bold text-emerald-300">【フェーズ3：漂流予測パズル・情報共有（合議・推理枠）】</span>
                    <div className="rounded bg-slate-900/90 p-2.5 text-[11px] text-slate-300 border border-slate-800">
                      <span className="font-bold text-cyan-400">🛡️ 貝浜（PC2: 防衛省リエゾン）からの開示情報（なぜ衛星が使えないのか）:</span>
                      <p className="mt-0.5 leading-relaxed">
                        「気象衛星ひまわりは解像度不足で40tの小型船を捕捉不可。低軌道偵察衛星は軌道通過まで4時間＋現場の雨雲で光学視界ゼロ。全電源喪失でAISも途絶。衛星画像頼みの捜索は不可能です！現場の海流と風から計算するしかありません！」
                      </p>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <p className="font-bold text-slate-200">🔍 各員の開示情報と漂流ベクトル（GM用正解メモ）:</p>
                      <p>・<strong className="text-white">朝潮 / PC1 (風)</strong>: 南西の強風15m/s → 船は北東へ約1.5ノット押し流される</p>
                      <p>・<strong className="text-white">太刀魚 / PC4 (海流)</strong>: 黒潮支流の表層流は真東へ2.0ノット</p>
                      <p>・<strong className="text-white">浪寄 / PC5 (潮目)</strong>: 冷水塊境界に乗っており東向き海流は減衰なし</p>
                      <p>・<strong className="text-white">初瀬 / PC6 (無線・5名時は太刀魚)</strong>: 船長の悲鳴『真横から波を受けている』＝風と海流双方の横波</p>
                      <p>・<strong className="text-white">坂凪 / PC3 (海難救助)</strong>: 東側や南東側には危険な暗礁群。風浪の三角波で座礁沈没する前に、北東×真東の合成ベクトルである【東北東の漂流予測海域】へ急行して救出！</p>
                    </div>
                  </div>

                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3">
                    <span className="font-bold text-slate-300">【フェーズ4：救助成功アナウンス】</span>
                    <p className="text-slate-400 mt-1 italic">
                      （🎙️ 首席オペレーター 長津）:「――坂凪救難担当官率いる現場救難艇より入電！東北東の漂流予測海域へ全速到達、暗礁群をすり抜け激しく漂流する遭難船を捕捉・接舷！初瀬救護担当（PC6／5名時は太刀魚）も収容準備願います。荒波の中で間一髪、船長とダイバーたちの救出に成功いたしました！」
                    </p>
                  </div>

                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3 space-y-1.5">
                    <span className="font-bold text-amber-400">【NPC 船長（救助直後）】:</span>
                    <p className="text-slate-400 text-[11px] italic">
                      民間チャーター船「パパズドルフィン」の船長は、荒波で不安定な足場でもしっかりとした足取りで巡視船へと乗り込んできた。
                    </p>
                    <p className="text-slate-200 mt-1 leading-relaxed">
                      「お世話をかけますが、船は二見港まで曳航いただけますか。お客さんが怪我なくてよかった。船はスクリューが何かに巻き付かれたように故障して、計器類も電源が使えなくてお手上げになっちゃった。全電源喪失なんて初めてで焦りましたよ。今日乗せたダイバーたちはこの1ヶ月前ぐらいから頻繁にダイビングを繰り返していて、手慣れた様子だった。船の下に何かいるような感じだったけど、クジラとは思えなかったね。クジラなら潮吹きのブローや潜水の際の尾が見えたりという行動があるもんだけど、そんな様子はなかったんでね。海は怖いねぇ、あとで神社にお参りしてくるようにするよ」
                    </p>
                  </div>
                  <div className="rounded border border-slate-800 bg-slate-950/80 p-3 space-y-1.5">
                    <span className="font-bold text-blue-400">【NPC ダイバー2名（救助直後）】:</span>
                    <p className="text-slate-400 text-[11px] italic">
                      ダイバー達はほっとした顔を浮かべながら、酸素ボンベを含むダイビング装備は船に乗せたままと船長に断りを入れ、大型のクーラーボックスを抱えて巡視船に乗り込んできた。
                    </p>
                    <p className="text-slate-200 mt-1 leading-relaxed">
                      「助かりました。まさか漂流するとは思ってなくて。船の下に何かいたみたいですね、漂流が始まってから潜ってはいないので、はっきりとは言えないですけど、ただの大型クジラですよ。私たちですか、この近辺での魚の生態調査をしてまして、珍しい魚を標本採集していたんです。帰れるのか心肺でしたが、これで目的のものが無事に収集できましたので、これ以上皆様にご迷惑をおかけすることはありません。この便を逃すとしばらく戻れないですからね、もう帰れないかと思って冷や汗をかいていました」
                    </p>
                  </div>
                </div>
              )}

              {currentDay === 2 && (
                <div className="space-y-4 text-xs leading-relaxed">
                  {/* フェーズ1：状況通達 ＆ 緊急チーム維持命令（フェーズ2と統合） */}
                  <div className="rounded-lg border border-red-900/60 bg-red-950/25 p-3.5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-400 animate-ping" />
                      <span className="font-bold text-red-300">
                        【フェーズ1：状況通達 ＆ 緊急チーム維持命令】
                      </span>
                    </div>
                    <div className="rounded border border-red-900/40 bg-slate-950/80 p-2.5 text-[11px] text-red-200">
                      <p className="font-semibold text-white">
                        🚨 緊急速報：西之島周辺海底火山が突発的大規模噴火
                      </p>
                      <p className="mt-0.5 text-slate-300">
                        西之島周辺の海底火山が突発的に大噴火。噴煙高度は上空数千メートルに到達。周辺海域に航行警報および緊急退避命令が発令。
                      </p>
                    </div>
                    <div className="rounded bg-slate-950/90 border border-slate-800 p-3 space-y-2">
                      <p className="text-slate-200 text-xs italic leading-relaxed">
                        （🎙️ 首席オペレーター 長津）:「長津です。皆様、お疲れ様です。気象庁および上層部より緊急アラートを受信いたしました。西之島沖にて海底火山の突発噴火が発生。周辺船舶の避難誘導および火山活動の厳重監視を行う必要があるため、当合同対策チームは当面の間【即応体制を維持】せよとの通達です。現場海域の船舶の避難は完了していますが、新しい指示がでています。西之島周辺海域を中心として『火山性の地殻振動』が観測されており、同時に海中を移動する巨大な生物の目撃情報が相次いで寄せられています。すべての調査に手を回す余裕はありませんので、各自の専門知識を持ち寄りどの調査を優先して実行すべきか合議をお願いいたします」
                      </p>
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-cyan-300/95 leading-relaxed font-medium">
                        🗣️ <strong>GMからの案内</strong>: 「今回の調査では、東京本部側では3つの調査項目から1つ、小笠原現地では4つの調査項目から2つを選ぶことができます。このタイミング以降では選択されなかった情報の調査をすることはできませんので十分検討の上で判断をお願いします」
                      </div>
                    </div>
                    <div className="text-[11px] text-amber-300/90 bg-amber-950/30 rounded p-2 border border-amber-900/40">
                      💡 <strong>GMメモ</strong>: Day 1で招集された急造チームの解散が撤回され、このチームが当面維持される必然性を提示し、直ちに下記の合議制アクション（東京1枠／現地2枠）の選択へと案内します。
                    </div>
                  </div>

                  {/* インタラクティブ操作：合議制アクション選択コンソール */}
                  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-cyan-400" />
                        <span className="font-bold text-white text-xs">
                          合議制アクション選択コンソール（GM操作盤）
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="rounded bg-indigo-950 px-2 py-0.5 font-bold text-indigo-300 border border-indigo-800">
                          東京: 1枠
                        </span>
                        <span className="rounded bg-teal-950 px-2 py-0.5 font-bold text-teal-300 border border-teal-800">
                          現地: {selectedFieldActions.length}/2枠
                        </span>
                      </div>
                    </div>

                    {/* 海上保安庁東京本部側（1択） */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="font-bold text-indigo-300 text-[11px]">
                          海上保安庁東京本部アクション（全3枠中 1つ選択）
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {TOKYO_ACTIONS.map((action) => {
                          const isSelected = selectedTokyoAction === action.id;
                          return (
                            <button
                              key={action.id}
                              onClick={() => setSelectedTokyoAction(action.id)}
                              className={`flex items-start justify-between rounded-lg p-2.5 text-left transition border ${
                                isSelected
                                  ? "border-indigo-500 bg-indigo-950/60 shadow-sm"
                                  : "border-slate-800 bg-slate-950/60 hover:bg-slate-800/60"
                              }`}
                            >
                              <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-block h-3.5 w-3.5 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                                      isSelected
                                        ? "border-indigo-400 bg-indigo-500 text-white"
                                        : "border-slate-600 bg-slate-800 text-transparent"
                                    }`}
                                  >
                                    ✓
                                  </span>
                                  <span className="font-bold text-xs text-white">
                                    {action.title}
                                  </span>
                                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300 font-mono">
                                    {action.badge}
                                  </span>
                                  {action.hasPhoto && (
                                    <span className="flex items-center gap-0.5 rounded bg-amber-900/60 border border-amber-700/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">
                                      <ImageIcon className="h-2.5 w-2.5" /> 写真有
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                {action.organization}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 小笠原現地側（2択） */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Anchor className="h-3.5 w-3.5 text-teal-400" />
                        <span className="font-bold text-teal-300 text-[11px]">
                          小笠原現地アクション（全4枠中 2つ選択）
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {FIELD_ACTIONS.map((action) => {
                          const isSelected = selectedFieldActions.includes(action.id);
                          return (
                            <button
                              key={action.id}
                              onClick={() => handleToggleFieldAction(action.id)}
                              className={`flex items-start justify-between rounded-lg p-2.5 text-left transition border ${
                                isSelected
                                  ? "border-teal-500 bg-teal-950/60 shadow-sm"
                                  : "border-slate-800 bg-slate-950/60 hover:bg-slate-800/60"
                              }`}
                            >
                              <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-block h-3.5 w-3.5 rounded border flex items-center justify-center text-[9px] font-bold ${
                                      isSelected
                                        ? "border-teal-400 bg-teal-500 text-white"
                                        : "border-slate-600 bg-slate-800 text-transparent"
                                    }`}
                                  >
                                    ✓
                                  </span>
                                  <span className="font-bold text-xs text-white">
                                    {action.title}
                                  </span>
                                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300 font-mono">
                                    {action.badge}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                {action.organization}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 選択されたアクションの調査結果 ＆ 開示内容 */}
                  <div className="space-y-3 rounded-lg border border-cyan-900/60 bg-cyan-950/20 p-3.5">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5" />
                      【開示された調査結果 ＆ 証拠レポート】
                    </span>

                    {/* 東京側結果 */}
                    {(() => {
                      const action = TOKYO_ACTIONS.find((a) => a.id === selectedTokyoAction);
                      if (!action) return null;
                      return (
                        <div className="rounded-lg border border-indigo-900/80 bg-slate-950 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-indigo-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                東京結果
                              </span>
                              <span className="font-bold text-white text-xs">{action.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              証拠ID: {action.evidenceId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {action.detail}
                          </p>

                          {/* T-3 空撮写真プレビュー */}
                          {action.hasPhoto && (
                            <div className="mt-3 rounded border border-slate-700 bg-slate-900 p-2.5">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                                  <ImageIcon className="h-3.5 w-3.5" />
                                  海上保安庁 MA722撮影 広角空撮写真（急浮上時）
                                </span>
                                <button
                                  onClick={() => setIsPhotoModalOpen(true)}
                                  className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-indigo-500 transition"
                                >
                                  <Eye className="h-3 w-3" /> 拡大表示
                                </button>
                              </div>
                              <div
                                onClick={() => setIsPhotoModalOpen(true)}
                                className="group relative cursor-pointer overflow-hidden rounded border border-slate-700 bg-black aspect-video max-h-48 flex items-center justify-center"
                              >
                                <img
                                  src="/images/aerial_recon_wide.jpg"
                                  alt="西之島北西海域 空撮写真"
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                                  <span className="text-[10px] text-slate-200">
                                    噴煙を背景に海面直下（水深10〜20m）に生じたケルビン波と巨大な影（数分後、深海800mへ急速潜航）
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 小笠原側結果 */}
                    {selectedFieldActions.map((fieldId) => {
                      const action = FIELD_ACTIONS.find((a) => a.id === fieldId);
                      if (!action) return null;
                      return (
                        <div
                          key={action.id}
                          className="rounded-lg border border-teal-900/80 bg-slate-950 p-3"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-teal-700 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                現地結果
                              </span>
                              <span className="font-bold text-white text-xs">{action.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              証拠ID: {action.evidenceId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {action.detail}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* フェーズ3：合議・因果関係の結論（GM用正解メモ） */}
                  <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-3.5">
                    <span className="font-bold text-emerald-300 text-xs">
                      【フェーズ3：合議・因果関係の結論（GM用正解メモ）】
                    </span>
                    <div className="mt-2 space-y-1.5 text-[11px] text-slate-300">
                      <p>
                        ・<strong className="text-white">① Day 1の元凶</strong>: スクリューの付着物から、遭難船を襲ったのは深海600m以深の「ダイオウイカ」と特定（F-1）。
                      </p>
                      <p>
                        ・<strong className="text-white">② 巨大なサイズ矛盾</strong>: しかし観測された影は「全長300〜400m（数百メートル）」（T-1 / T-3 / F-2）。通常のダイオウイカ（十数m）とは桁違いであり、単体生物では説明がつかない！
                      </p>
                      <p>
                        ・<strong className="text-white">③ 噴火の因果関係</strong>: 影の北上移動（時速約6km）が西之島直下を通過した直後に噴火が誘発された（T-2 / F-3 / F-4）。噴火のせいで怪異が現れたのではなく、怪異の通過が海底火山を刺激して噴火させている！
                      </p>
                    </div>

                    <div className="mt-2.5 rounded bg-red-950/50 p-2.5 border border-red-900/50 text-[11px] text-red-200">
                      ⚠️ <strong>GM演出上の最重要注意（ネタバレ防止）</strong>:
                      <p className="mt-0.5 text-slate-300">
                        このDay 2の段階では、<strong>「ダイオウイカの超群体である」という正体は絶対に明かさないでください</strong>。プレイヤーたちには「ダイオウイカの触手のはずなのに、なぜ数百mもの超巨大な影なのか？」「海底火山を噴火させながら北上しているものは一体何なのか？」という強烈なサイズ矛盾とサスペンスを抱かせ、議論を深めてもらいます。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentDay === 3 && (
                <div className="space-y-4 text-xs leading-relaxed">
                  {/* フェーズ1：鳥島沖海底大噴火 GMアナウンス */}
                  <div className="rounded-lg border border-amber-900/60 bg-amber-950/25 p-3.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-amber-400 animate-pulse" />
                      <span className="font-bold text-amber-300">
                        【フェーズ1：鳥島沖海底大噴火 ＆ 緊急洋上捜索命令】
                      </span>
                    </div>
                    <div className="mt-2 rounded border border-amber-900/40 bg-slate-950/80 p-2.5 text-[11px] text-amber-200">
                      <p className="font-semibold text-white">
                        🚨 緊急速報：鳥島沖海底カルデラが連動大爆発（Day 2未明）
                      </p>
                      <p className="mt-0.5 text-slate-300">
                        西之島から北へ約380km。時速約6km（日速約150km）のペースで北上する巨大物体が海底火山を次々と刺激して連動噴火を誘発していることが確定。
                      </p>
                    </div>
                    <p className="text-slate-300 mt-2.5 italic">
                      （🎙️ 首席オペレーター 長津）:「――小笠原航空基地より大型捜索ヘリが緊急発進いたしました。洋上に展開する巡視船PLH-31『あきつしま』での洋上給油を中継し、鳥島沖の噴火海域へ投入されます。各員への任務目標：『海図上の怪物の潜航位置を推測し、ソノブイを投下して三辺測量で距離を割り出し、その姿を捉えよ！』」
                    </p>
                  </div>

                  {/* フェーズ2：西之島と鳥島沖 火山フロント全体像（監視状況図） */}
                  <div className="rounded-xl border border-rose-900/60 bg-slate-900 p-4 shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-rose-400" />
                        <div>
                          <span className="font-bold text-white text-xs">
                            【火山フロント全体像】海上保安庁 火山活動監視状況図（伊豆・小笠原海嶺）
                          </span>
                          <span className="ml-2 text-[10px] text-slate-400 font-mono">
                            西之島(Day 1) ➔ 鳥島沖(Day 2) 北上軌跡
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="/images/eruption_monitoring_chart.svg"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 transition border border-slate-700"
                        >
                          <ExternalLink className="h-3 w-3" /> 別タブで開く
                        </a>
                        <button
                          onClick={() => {
                            setChartModalDay(3);
                            setIsChartModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded bg-rose-700 hover:bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white transition shadow"
                        >
                          <Maximize2 className="h-3 w-3" /> 大画面で開く
                        </button>
                      </div>
                    </div>

                    {/* 海図プレビューカード */}
                    <div
                      onClick={() => {
                        setChartModalDay(3);
                        setIsChartModalOpen(true);
                      }}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 bg-[#081325] aspect-video max-h-64 flex items-center justify-center shadow-inner"
                    >
                      <EruptionMonitoringChart day={3} className="h-full w-full object-contain transition duration-300 group-hover:scale-102 select-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                        <span className="text-[11px] font-semibold text-slate-200">
                          🔴 西之島 ➔ 鳥島沖 連動噴火軸 ｜ 北上速度: 時速約6km (日速約150km)
                        </span>
                        <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-rose-300 backdrop-blur">
                          クリックで拡大
                        </span>
                      </div>
                    </div>

                    {/* GM用 火山フロント観測解説ノート */}
                    <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center justify-between font-semibold text-rose-300">
                        <span>【GM用 火山フロント観測解説ノート】</span>
                        <span className="font-mono text-cyan-400">タイムリミット: 残り4日（Day 7駿河湾到達）</span>
                      </div>
                      <p>
                        ・<strong>連動噴火のドミノ倒し</strong>：Day 1（西之島）➔ Day 2（鳥島沖海底カルデラ）。距離約380kmを24時間で正確に到達しており、深海800mを時速約6kmで北上する物体が、通過した先々のマグマ溜まりを刺激して噴火させている動かぬ証拠。
                      </p>
                      <p>
                        ・<strong>未噴火海域（北方）</strong>：須美寿島、青ヶ島、八丈島、三宅島、伊豆諸島、駿河湾・富士山直下は現時点で未噴火。このペースで直進すると4日後に本土直下へ到達。
                      </p>
                      <p>
                        ・<strong>熱水プルーム警戒域（音響障害）</strong>：鳥島北東カルデラおよび須美寿島東熱水噴出孔の周辺（半径25km圏内）は、気泡と熱水により激しい音響散乱（クラッター）が発生する危険海域。
                      </p>
                    </div>
                  </div>

                  {/* フェーズ2.5：【GM専用作戦海図 W-3100】洋上ソナー索敵 ＆ 巨大生物潜航マップ */}
                  <div className="rounded-xl border border-rose-900/60 bg-slate-900 p-4 shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-cyan-400" />
                        <div>
                          <span className="font-bold text-white text-xs">
                            【GM専用 作戦海図 W-3100】全36セクター索敵盤 ＆ 巨大生物潜航マップ
                          </span>
                          <span className="ml-2 text-[10px] text-rose-300 font-mono">
                            GM真相表示: 深度400m潜航座標・三辺測量反響円
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsTacticalModalOpen(true)}
                          className="flex items-center gap-1 rounded bg-rose-700 hover:bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white transition shadow"
                        >
                          <Maximize2 className="h-3 w-3" /> 大画面で開く（GM全画面）
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-slate-800 shadow-xl aspect-[16/10] max-h-96">
                      <Day3TacticalMap defaultMode="gm" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-950/80 border border-slate-800 px-3 py-2 text-[11px] text-slate-300">
                      <span>
                        🚨 <strong>怪物の潜航現在位置</strong>: セクターB-3（水深400m） ｜ 北上速度: 時速約6km ｜ 1セクター: 約20km四方
                      </span>
                      <span className="text-cyan-400 font-mono">
                        給油拠点: 海図左下 PLH-31「あきつしま」(セクターF-1)
                      </span>
                    </div>
                  </div>

                  {/* フェーズ3：アクティブ・ソノブイ投下作戦（GM判定早見ガイド） */}
                  <div className="rounded-lg border border-cyan-900/60 bg-cyan-950/20 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <Radar className="h-4 w-4 text-cyan-400" />
                        【フェーズ3：アクティブソナー投下作戦（GM判定早見ガイド）】
                      </span>
                      <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        1セクター ＝ 約20km四方
                      </span>
                    </div>

                    {/* ソナー判定早見グリッド */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded bg-rose-950/40 border border-rose-900/60 p-2.5 text-rose-200">
                        <strong className="text-rose-300 block mb-1">🎯 直上捕捉 ＆ 隣接反響判定:</strong>
                        ・<strong>セクター B-3（直上）に投下</strong>: <br />
                        　「同セクター直下に超巨大な反響音！目標を直上捕捉！」<br />
                        ・<strong>怪物の隣接セクター（B-2, B-4, A-3, C-3, 斜め）に投下</strong>: <br />
                        　「隣接セクター方向から強い反響音（約20km先）をキャッチ！」
                      </div>
                      <div className="rounded bg-amber-950/40 border border-amber-900/60 p-2.5 text-amber-200">
                        <strong className="text-amber-300 block mb-1">⚠️ 熱水クラッター影響 ＆ 限界判定:</strong>
                        ・<strong>熱水の直上（E-2 または E-5カルデラ）に投下</strong>: <br />
                        　「直下から吹き上がる気泡で音波が散乱！探知不能（NO RETURN）」<br />
                        ・<strong>熱水の隣接セクター（D-2, F-2, E-1, E-3等）に投下</strong>: <br />
                        　「<strong className="text-emerald-300">投下地点直下には怪物は不在！</strong>ただし隣接海域の熱水散乱ノイズが干渉し、周囲セクターは探知不能！」<br />
                        ・<strong>上記以外の離れたセクターに投下</strong>: <br />
                        　「直下に怪物は不在。周囲（約20km）にも反響なし（索敵限界外）」
                      </div>
                    </div>

                    <div className="rounded bg-slate-900 p-2.5 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                      <p>
                        🎯 <strong className="text-cyan-300">怪物の現在潜航位置</strong>：
                        セクターB-3（水深約400m）。
                      </p>
                      <p>
                        📋 <strong className="text-white">位置特定・浮上撮影成功時</strong>：
                        プレイヤーがB-3または隣接セクターにソノブイを展開して位置を絞り込んだ場合、潜航していた巨大生物が海面近く（水深10〜20m）へ浮上。急行した捜索ヘリが上空後方から目視確認し、海面下にうごめく巨大な触手と胴体を捉えた写真の撮影に成功します（特定失敗時は約20km彼方に波紋のみを確認）。
                      </p>
                    </div>
                  </div>

                  {/* フェーズ4：初瀬 / PC6（救護・神職血統）個別ハンドアウト GMガイド */}
                  <div className="rounded-lg border border-indigo-900/60 bg-indigo-950/30 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-xs">
                      <Scroll className="h-4 w-4 text-indigo-400" />
                      【フェーズ4：初瀬 / PC6（救護・神職血統／5名時は太刀魚）個別ハンドアウト GMガイド】
                    </div>
                    <blockquote className="border-l-2 border-indigo-500 pl-3 py-0.5 text-slate-300 text-[11px] italic">
                      「南の海にて火の山が連なりて火を吹き、海の中を巨大なる何ものかが北へと泳ぎ去るとき……島人は沖へ舟を漕ぎ出し、海に向かいて毎日、祝詞を唱えねばならぬ」
                    </blockquote>
                    <div className="rounded bg-indigo-950 border border-indigo-800 p-2 text-[10px] text-amber-200">
                      ⚠️ <strong>【重要制約】</strong>:
                      初瀬（PC6／5名時は太刀魚PC4）に分かっていいのは<strong>「海に出て毎日祝詞を唱える特別な儀式が存在する」ということだけ</strong>です。祝詞の具体的な文言や方法はDay 6まで絶対に明かさないよう誘導してください。
                    </div>
                  </div>

                  {/* フェーズ5：Day 3 合議制アクション操作パネル（東京1枠 ＋ 現地2枠） */}
                  <div className="rounded-xl border border-indigo-900/60 bg-slate-900 p-3.5 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-indigo-400" />
                        【フェーズ5：Day 3 合議制アクション（東京1枠 ＋ 現地2枠）】
                      </span>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="rounded bg-indigo-950 px-2 py-0.5 font-bold text-indigo-300 border border-indigo-800">
                          東京: 1枠
                        </span>
                        <span className="rounded bg-teal-950 px-2 py-0.5 font-bold text-teal-300 border border-teal-800">
                          現地: {selectedDay3FieldActions.length}/2枠
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      💡 <strong>繰り越し蓄積システム</strong>: ここで選ばれなかった項目は消滅せず、翌日（Day 4）やDay 5でも選択・確認可能です。
                    </p>

                    {/* 海上保安庁東京本部アクション */}
                    <div>
                      <span className="font-bold text-indigo-300 text-[11px] block mb-1">
                        🏢 海上保安庁東京本部アクション（3枠中1枠選択：隕石片分析 ｜ 八丈島火山性微動 ｜ 神社隕石盗難・海域投棄）:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {DAY3_TOKYO_ACTIONS.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setSelectedDay3TokyoAction(a.id)}
                            className={`rounded-lg p-2 text-left border transition ${
                              selectedDay3TokyoAction === a.id
                                ? "border-indigo-400 bg-indigo-950/70 shadow ring-1 ring-indigo-400"
                                : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-[11px]">{a.id} {a.badge}</span>
                              <span className={`text-[9px] px-1 rounded ${selectedDay3TokyoAction === a.id ? "bg-indigo-600 text-white font-bold" : "text-slate-500"}`}>
                                {selectedDay3TokyoAction === a.id ? "選択中" : "未選択"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 小笠原現地アクション */}
                    <div>
                      <span className="font-bold text-teal-300 text-[11px] block mb-1">
                        🏝️ 小笠原現地アクション（4枠中2枠選択：隕石分析 ｜ 神社宝物殿 ｜ ダイバー貨物伝票 ｜ 写真画像深層解析）:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {DAY3_FIELD_ACTIONS.map((a) => {
                          const isSelected = selectedDay3FieldActions.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => handleToggleDay3FieldAction(a.id)}
                              className={`rounded-lg p-2 text-left border transition ${
                                isSelected
                                  ? "border-teal-400 bg-teal-950/70 shadow ring-1 ring-teal-400"
                                  : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-[11px]">{a.id} {a.badge}</span>
                                <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-teal-600 text-white" : "text-slate-500"}`}>
                                  {isSelected ? "選択中" : "未選択"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* フェーズ6：写真鑑定相談・防衛判断 ＆ 合議制司令官最終意思決定（Day 3 クロージング） */}
                  <div className="rounded-lg border border-amber-800/70 bg-amber-950/25 p-3.5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-amber-900/60 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-amber-400" />
                        <span className="font-bold text-amber-300 text-xs">
                          【フェーズ6：写真鑑定相談・防衛判断 ＆ 合議制司令官最終意思決定】（Day 3 クロージング）
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        Day 3 終盤合議
                      </span>
                    </div>

                    <div className="space-y-2 text-slate-300 text-[11px]">
                      <div className="rounded bg-slate-950/80 p-2.5 border border-slate-800 space-y-1">
                        <strong className="text-amber-400 block font-bold">
                          📢 GM進行ナレーション:
                        </strong>
                        <p className="italic text-slate-200">
                          （🎙️ 首席オペレーター 長津）:「――洋上捜索ヘリより至急電！撮影した深海写真データをメインスクリーンへ展開します……海面下に潜む漆黒の巨大質量、そして20本以上の無数の触手群を確認！ 現場の海上保安庁警備救難部より、当合同対策チームへ緊急の諮問が下されております」
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* PC5への相談 */}
                        <div className="rounded border border-teal-900/80 bg-teal-950/30 p-2.5 space-y-1">
                          <span className="font-bold text-teal-300 text-xs flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> ① 海上保安庁 ➔ 浪寄准教授（PC5: 海洋生物学者）への相談:
                          </span>
                          <p className="italic text-slate-200">
                            「浪寄准教授、この写真に写る物体の生物学的特徴をどう分析されますか？通常のダイオウイカ（10本）と明らかに異なる無数の触手、そして数百mの巨大質量。専門家としての所見を提示してください」
                          </p>
                          <div className="mt-1 text-[10px] text-teal-200/90 bg-teal-950/60 rounded p-1.5 border border-teal-800/60">
                            💡 <strong>GMメモ</strong>: 浪寄准教授（PC5）から「超群体（コロニー）仮説」「変異体仮説」「火山熱源誘引説」のいずれか（特に群体の疑い）を提示させます。
                          </div>
                        </div>

                        {/* PC2への要請 */}
                        <div className="rounded border border-indigo-900/80 bg-indigo-950/30 p-2.5 space-y-1">
                          <span className="font-bold text-indigo-300 text-xs flex items-center gap-1">
                            <ShieldAlert className="h-3.5 w-3.5" /> ② 海上保安庁 ➔ 貝浜リエゾン（PC2: 防衛省リエゾン）への要請:
                          </span>
                          <p className="italic text-slate-200">
                            「貝浜リエゾン、海上保安庁法20条に基づく警察比例の原則では、この規模の潜航目標に対する排除・対処は不可能です。法的に自衛隊の防衛出動、あるいは海上警備行動を要請すべきか、防衛省としての判断を求めます」
                          </p>
                          <div className="mt-1 text-[10px] text-indigo-200/90 bg-indigo-950/60 rounded p-1.5 border border-indigo-800/60">
                            💡 <strong>GMメモ</strong>: 貝浜リエゾン（PC2）から「防衛出動即時迎撃」「海上警備行動先行」「慎重・隠蔽懸念」の防衛判断を提示させます。
                          </div>
                        </div>
                      </div>

                      {/* ③ 防衛庁・官邸からの呼称選定諮問 */}
                      <div className="rounded border border-amber-800/80 bg-amber-950/40 p-2.5 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-amber-300 text-xs flex items-center gap-1">
                            <Radio className="h-3.5 w-3.5 text-amber-400" /> ③ 防衛庁・官邸 ➔ 合同対策チームへの諮問：未確認巨大生物の呼称（コードネーム）決定:
                          </span>
                          <div className="flex items-center gap-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setCreatureCodename("ワタツミ")}
                              className={`px-2 py-0.5 rounded transition ${
                                creatureCodename === "ワタツミ"
                                  ? "bg-amber-600 text-white font-bold"
                                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                              }`}
                            >
                              ワタツミ
                            </button>
                            <button
                              type="button"
                              onClick={() => setCreatureCodename("クスルフ")}
                              className={`px-2 py-0.5 rounded transition ${
                                creatureCodename === "クスルフ"
                                  ? "bg-amber-600 text-white font-bold"
                                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                              }`}
                            >
                              クスルフ
                            </button>
                          </div>
                        </div>
                        <p className="italic text-slate-200 text-[11px] leading-relaxed">
                          （🎙️ 首席オペレーター 長津）:「防衛庁および内閣官房より至急諮問です！『今後の公式対処記録および部隊動員にあたり、この未確認巨大生物の呼称（コードネーム）を当対策チームで決めてほしい』とのことです。現在、上層部からは日本神話の古き海神に由来する【ワタツミ】、もしくは海洋古伝承の異形神に由来する【クスルフ】の2案が有力候補として挙がっていますが、当チームとしてどちらを公式コードネームとして答申しますか？（※もちろん、チーム独自の命名でも構いません）」
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] text-slate-400">呼称決定入力:</span>
                          <input
                            type="text"
                            value={creatureCodename}
                            onChange={(e) => setCreatureCodename(e.target.value)}
                            placeholder="ワタツミ / クスルフ / 自由入力"
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-300 w-44 font-bold focus:border-amber-400 outline-none"
                          />
                          <span className="text-[10px] text-emerald-400 font-mono">
                            確定呼称: 【{creatureCodename || "未決定"}】
                          </span>
                        </div>
                      </div>

                      {/* 合議制と危機管理官最終意思決定 */}
                      <div className="rounded bg-rose-950/30 border border-rose-900/50 p-2.5 space-y-1.5">
                        <span className="font-bold text-rose-300 text-xs">
                          ⚖️ 全員合議 ＆ 朝潮危機管理官（PC1）最終意思決定の進行ガイド:
                        </span>
                        <p>
                          ・<strong>合議制の回し方</strong>: 全員（朝潮・貝浜・坂凪・太刀魚・浪寄・初瀬）で写真の生物学的脅威と防衛出動の是非、そして巨大生物の公式呼称（ワタツミ vs クスルフ）について5〜10分程度自由に意見を交わさせます（島民避難、火山の残り時間、兵器の有効性など）。
                        </p>
                        <p>
                          ・<strong>危機管理官の決断</strong>: 議論が煮詰まったところで、GM（長津）から<strong>「各員の意見が出揃いました。朝潮危機管理官（PC1）、指揮官としてこの事態にどう対処するか、最終意思決定をお願いいたします」</strong>と促します。
                        </p>
                        <p className="text-amber-200">
                          ・<strong>Day 3 終了 ➔ Day 4 へのブリッジ</strong>: 朝潮危機管理官が方針（防衛出動正式要請、または海上警備行動発令）を決定した時点で<strong>「ここまでがDay 3に起こること」としてDay 3を完結</strong>させます。この決定がDay 4の「防衛出動の決定と隠蔽圧力・迎撃陣形の展開」へと直結します。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentDay === 4 && (
                <div className="space-y-3 text-xs leading-relaxed">
                  {/* フェーズ1：明神礁海底噴火 ＆ 火山活動監視図 */}
                  <div className="rounded-xl border border-rose-900/60 bg-slate-900 p-4 shadow-md space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-rose-400" />
                        <div>
                          <span className="font-bold text-white text-xs">
                            【Day 4 火山フロント最新状況】明神礁海底噴火 ＆ 火山活動監視図
                          </span>
                          <span className="ml-2 text-[10px] text-rose-300 font-mono">
                            明神礁 連動大噴火 ＆ 八丈島・青ヶ島 微動観測
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="/images/eruption_monitoring_chart_day4.svg"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 transition border border-slate-700"
                        >
                          <ExternalLink className="h-3 w-3" /> 別タブで開く
                        </a>
                        <button
                          onClick={() => {
                            setChartModalDay(4);
                            setIsChartModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded bg-rose-700 hover:bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white transition shadow"
                        >
                          <Maximize2 className="h-3 w-3" /> 大画面で開く
                        </button>
                      </div>
                    </div>

                    {/* 海図プレビューカード */}
                    <div
                      onClick={() => {
                        setChartModalDay(4);
                        setIsChartModalOpen(true);
                      }}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 bg-[#081325] aspect-video max-h-60 flex items-center justify-center shadow-inner"
                    >
                      <EruptionMonitoringChart day={4} className="h-full w-full object-contain transition duration-300 group-hover:scale-102 select-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                        <span className="text-[11px] font-semibold text-slate-200">
                          🔴 Day 3 明神礁 連動大噴火 ｜ ⚡ 青ヶ島・八丈島 火山性軽度地震（震度1〜2）
                        </span>
                        <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-rose-300 backdrop-blur">
                          クリックで拡大
                        </span>
                      </div>
                    </div>

                    {/* 📢 【GM読み上げ台本：Day 4 開幕状況報告】 */}
                    <div className="rounded-lg bg-slate-950/90 border border-slate-800 p-3 space-y-2">
                      <strong className="text-amber-300 block font-bold text-xs flex items-center gap-1.5">
                        <Radio className="h-4 w-4 text-amber-400" />
                        📢 【GM読み上げ台本：Day 4 開幕状況報告（客観的事実のみ伝達）】
                      </strong>
                      <p className="text-slate-200 text-xs italic leading-relaxed font-mono">
                        （🎙️ 首席オペレーター 長津）:「――各員へ緊急報告です。未明、鳥島沖の北方に位置する【明神礁】周辺にて新たな海底噴火が発生。さらに八丈島および青ヶ島の地震計が、火山性微動を断続的に探知しています。防衛庁のパッシブソナーによる潜航物体の位置と、この火山性微動の発生源は完全に一致しており、物体は【日速約150km】のペースで正確に北上を続けています」
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-3 text-[11px] text-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-rose-300">
                        <span>【GM用 Day 4 観測要綱 ＆ 推理検討の焦点】</span>
                        <span className="font-mono text-cyan-400">移動速度: 時速約6km（日速約150km）</span>
                      </div>
                      <p>
                        ・<strong>明神礁の海底噴火</strong>：鳥島沖を通過した物体が北上を続け、明神礁の海底カルデラで連動爆発が発生（Day 3海底噴火）。他の島名や地形と被らないよう海図西側に明瞭にプロット。
                      </p>
                      <p>
                        ・<strong>八丈島・青ヶ島の地震 ＆ 特別な振動による火山刺激（プレイヤーの推理ポイント）</strong>：巨大生物が海底付近で<strong>『海底地震を起こすような特別な振動』</strong>を発生させ、それが海底火山を次々と刺激・噴火させているメカニズムが浮上。公的機関（海保・自衛隊）からは客観的観測データのみを伝え、「このまま北上すればどこへ向かい何が起きるか」はプレイヤーたち（専門家チーム）自身に海図を見て推理させます（駿河湾・富士山直撃の危機）。
                      </p>
                      <p>
                        ・<strong>生物が北上できる2つの理由（地磁気 ＋ 隕石が放つ特殊な物質）と複数隕石の投棄・神社盗難</strong>：巨大生物は①<strong>地磁気</strong>と、②<strong>隕石が放つ特殊な物質</strong>の2つを感知して隕石を追うように北上している可能性。さらに、もともと<strong>小笠原・八丈島・三宅島の神社に保管・奉納されていた複数の隕石が盗難にあっていた事実と、ダイバー達による各海域への投棄疑惑</strong>、そして小笠原で引き揚げられたクーラーボックス（荷物）が富士山麓の民家を経由して山麓の方へ運ばれたという足取りを東京・小笠原双方の捜査から解き明かします。
                      </p>
                    </div>
                  </div>

                  {/* フェーズ2：Day 3の意思決定に基づく内閣・防衛省の反応分岐 */}
                  <div className="rounded-xl border border-amber-900/60 bg-slate-900 p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                        <Scale className="h-4 w-4 text-amber-400" />
                        【フェーズ2：Day 3意思決定に基づく政府・防衛省の反応分岐】
                      </div>
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px]">
                        <span className="text-slate-400">Day 3の決定:</span>
                        <button
                          type="button"
                          onClick={() => setDay3GmHqDecision("defense_dispatch")}
                          className={`px-2 py-0.5 rounded transition ${
                            day3GmHqDecision === "defense_dispatch"
                              ? "bg-rose-700 text-white font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          防衛出動要請あり（自衛隊攻撃依頼）
                        </button>
                        <button
                          type="button"
                          onClick={() => setDay3GmHqDecision("no_dispatch")}
                          className={`px-2 py-0.5 rounded transition ${
                            day3GmHqDecision === "no_dispatch"
                              ? "bg-indigo-700 text-white font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          要請なし（依頼見送り）
                        </button>
                      </div>
                    </div>

                    {day3GmHqDecision === "defense_dispatch" ? (
                      <div className="rounded-lg border border-rose-800/80 bg-rose-950/30 p-3 text-[11px] text-rose-200 space-y-2">
                        <div>
                          <strong className="text-rose-300 block font-bold text-xs flex items-center gap-1.5">
                            🏛️ 【自衛隊に攻撃（防衛出動）を依頼した場合：内閣見送り通達 ＆ 防衛省からの再説得打診】
                          </strong>
                          <p className="italic text-slate-200 mt-1 leading-relaxed font-mono">
                            （🎙️ 首席オペレーター 長津）:「――昨日、朝潮危機管理官より上申された防衛出動要請について、官邸危機管理センターおよび内閣総理大臣より公式通達が入電しました。『海底噴火と未確認潜航物体との因果関係が科学的に立証されておらず、外国からの武力攻撃事態にも該当しないため、現段階での自衛隊部隊の出動は見送る。海上保安庁は引き続き警戒および情報収集にあたれ』……内閣による防衛出動は見送りと決定されました。しかし、防衛庁・海上幕僚監部からは『内閣を再説得するためにも、この生物が一体どこへ向かい、何を引き起こす見立てなのか、対策本部の専門的予測を至急提出してほしい』との緊急打診が入っております」
                          </p>
                        </div>
                        <div className="rounded border border-amber-800/60 bg-amber-950/30 p-2 text-amber-200">
                          <strong className="text-amber-300 block font-bold text-[11px] flex items-center gap-1">
                            🛡️ 防衛省リエゾン 貝浜（PC2）への追加通達
                          </strong>
                          <p className="italic text-slate-200 mt-0.5 leading-relaxed font-mono">
                            「内閣は因果関係不明を理由に出動を保留したが、防衛省としては深刻な脅威と捉えている。貝浜リエゾン、朝潮危機管理官、内閣を説得し再上申を通すには、より確固たる論拠が必要だ。【この生物は一体どこへ向かっている見立てなのか？】対策本部の進路予測・分析を至急提示してほしい」
                          </p>
                        </div>
                        <p className="text-slate-400">
                          💡 <strong>GM進行メモ</strong>: 朝潮危機管理官が必死に出動要請したにもかかわらず内閣は動かない一方、防衛省から『どこへ向かっているのか』の意見聴取が行われます。対策本部が提示する見立てや根拠（火山連動の北上軸・駿河湾や富士山直撃など）の論理性によって、<strong>防衛省側が内閣を再説得できるかどうかの説得力・今後の部隊動員が大きく変わる</strong>ことをプレイヤーに示唆してください。
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-indigo-800/80 bg-indigo-950/30 p-3 text-[11px] text-indigo-200 space-y-2">
                        <div>
                          <strong className="text-indigo-300 block font-bold text-xs flex items-center gap-1.5">
                            🛡️ 【自衛隊に攻撃を依頼しなかった場合：防衛省・統合幕僚監部からの緊急照会】
                          </strong>
                          <p className="italic text-slate-200 mt-1 leading-relaxed font-mono">
                            （🎙️ 首席オペレーター 長津）:「――防衛庁運用企画局および海上幕僚監部より、合同対策本部へ緊急照会が入電いたしました。『対策本部が防衛出動の要請を見送った判断は了解した。しかし、自衛隊としても伊豆諸島の連続噴火と潜航物体を国家安全保障上の重大な懸念と捉えている。この生物は一体どこへ向かっている見立てなのか？ 最終到達予測地点に関する対策本部の専門的意見を至急提出されたし』との照会です」
                          </p>
                        </div>
                        <p className="text-slate-400">
                          💡 <strong>GM進行メモ</strong>: 防衛出動を求めなかった場合も、防衛省から生物の進路と目的についての意見を強く求められます。どのような進路予測を回答するかによって、今後の防衛省の警戒レベルや協力関係、内閣への働きかけが変わることを示唆してください。
                        </p>
                      </div>
                    )}
                  </div>

                  {/* フェーズ3：部隊再配置と八丈島・近海前線情報の緊急収集 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="rounded-lg border border-teal-900/60 bg-teal-950/20 p-3 text-[11px] space-y-1">
                      <span className="font-bold text-teal-300 block text-xs flex items-center gap-1.5">
                        <Anchor className="h-3.5 w-3.5" /> ⚓ 小笠原現地組（坂凪・太刀魚・浪寄・初瀬）：父島本島へ帰還
                      </span>
                      <p className="text-slate-300">
                        洋上展開（巡視船あきつしま洋上補給・長距離ヘリ索敵）を完遂した現地部隊は、父島・二見港の本拠地へ無事帰還。島民避難の受け入れ体制を整えつつ、小笠原に残る謎の解明に着手。
                      </p>
                    </div>

                    <div className="rounded-lg border border-indigo-900/60 bg-indigo-950/20 p-3 text-[11px] space-y-1">
                      <span className="font-bold text-indigo-300 block text-xs flex items-center gap-1.5">
                        <Radio className="h-3.5 w-3.5" /> 📡 海上保安庁東京本部（朝潮・貝浜）：八丈島前線情報の緊急収集
                      </span>
                      <p className="text-slate-300">
                        八丈島総合開発センターおよび近海漁協との通信ホットラインを確立。火山性微動に怯える島民の肉声や、八丈島沖で操業する漁船の魚探（アクティブソナー）が捉えた海中物体の最新情報の照会・分析に着手。
                      </p>
                    </div>
                  </div>

                  {/* フェーズ4：Day 4 合議制アクション操作パネル（繰り越し蓄積対応） */}
                  <div className="rounded-xl border border-indigo-900/60 bg-slate-900 p-3.5 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-indigo-400" />
                        【フェーズ4：Day 4 合議制アクション（東京1枠 ＋ 現地2枠 / Day 3繰り越し対応）】
                      </span>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="rounded bg-indigo-950 px-2 py-0.5 font-bold text-indigo-300 border border-indigo-800">
                          東京: 1枠
                        </span>
                        <span className="rounded bg-teal-950 px-2 py-0.5 font-bold text-teal-300 border border-teal-800">
                          現地: {selectedDay4FieldActions.length}/2枠
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      💡 <strong>繰り越し蓄積システム</strong>: Day 4の新設項目に加え、Day 3で未選択だった項目も選択可能です。ここで選ばれなかった項目も消滅せず、Day 5で総力調査できます。
                    </p>

                    {/* 海上保安庁東京本部アクション */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-indigo-300 text-[11px]">
                          🏢 海上保安庁東京本部アクション（候補{day4AvailableTokyoActions.length}枠中1枠選択）:
                        </span>
                        {selectedDay3TokyoAction && (
                          <span className="text-[10px] text-emerald-400 font-mono">
                            ✅ Day 3調査済: {selectedDay3TokyoAction}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {day4AvailableTokyoActions.map((a) => {
                          const isFromDay3 = DAY3_TOKYO_ACTIONS.some((d3) => d3.id === a.id);
                          const isSelected = selectedDay4TokyoAction === a.id;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => setSelectedDay4TokyoAction(a.id)}
                              className={`rounded-lg p-2 text-left border transition ${
                                isSelected
                                  ? "border-indigo-400 bg-indigo-950/70 shadow ring-1 ring-indigo-400"
                                  : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-white text-[11px]">{a.id} {a.badge}</span>
                                  <span className={`text-[9px] px-1 rounded font-semibold ${isFromDay3 ? "bg-amber-950 text-amber-300 border border-amber-800/80" : "bg-indigo-900 text-indigo-200"}`}>
                                    {isFromDay3 ? "Day 3繰越" : "Day 4新設"}
                                  </span>
                                </div>
                                <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-indigo-600 text-white font-bold" : "text-slate-500"}`}>
                                  {isSelected ? "選択中" : "未選択"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 小笠原現地アクション */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-teal-300 text-[11px]">
                          🏝️ 小笠原現地アクション（候補{day4AvailableFieldActions.length}枠中2枠選択）:
                        </span>
                        {selectedDay3FieldActions.length > 0 && (
                          <span className="text-[10px] text-emerald-400 font-mono">
                            ✅ Day 3調査済: {selectedDay3FieldActions.join(", ")}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {day4AvailableFieldActions.map((a) => {
                          const isFromDay3 = DAY3_FIELD_ACTIONS.some((d3) => d3.id === a.id);
                          const isSelected = selectedDay4FieldActions.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => handleToggleDay4FieldAction(a.id)}
                              className={`rounded-lg p-2 text-left border transition ${
                                isSelected
                                  ? "border-teal-400 bg-teal-950/70 shadow ring-1 ring-teal-400"
                                  : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-white text-[11px]">{a.id} {a.badge}</span>
                                  <span className={`text-[9px] px-1 rounded font-semibold ${isFromDay3 ? "bg-amber-950 text-amber-300 border border-amber-800/80" : "bg-teal-900 text-teal-200"}`}>
                                    {isFromDay3 ? "Day 3繰越" : "Day 4新設"}
                                  </span>
                                </div>
                                <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-teal-600 text-white font-bold" : "text-slate-500"}`}>
                                  {isSelected ? "選択中" : "未選択"}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* フェーズ5：防衛庁への最終進路・生態報告 ＆ 「害獣駆除」方針通達 */}
                  <div className="rounded-xl border border-amber-900/70 bg-[#16121a] p-3.5 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-amber-400" />
                        【フェーズ5：防衛庁への最終進路・生態報告 ＆ 「害獣駆除」方針通達】
                      </span>
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px]">
                        <span className="text-slate-400">見立て:</span>
                        <button
                          type="button"
                          onClick={() => setDay4GmDestinationDecision("tokyo")}
                          className={`px-2 py-0.5 rounded transition ${
                            day4GmDestinationDecision === "tokyo"
                              ? "bg-amber-600 text-white font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          東京直撃
                        </button>
                        <button
                          type="button"
                          onClick={() => setDay4GmDestinationDecision("fuji")}
                          className={`px-2 py-0.5 rounded transition ${
                            day4GmDestinationDecision === "fuji"
                              ? "bg-amber-600 text-white font-bold"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          富士山直撃
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-red-800/80 bg-red-950/30 p-3 text-[11px] text-red-200 space-y-1.5">
                      <strong className="text-red-300 block font-bold text-xs flex items-center gap-1.5">
                        🛡️ 【防衛省・統合幕僚監部通達：「害獣駆除」名目での部隊動員と駆除作戦決定】
                      </strong>
                      <p className="italic text-slate-200 leading-relaxed">
                        （🎙️ 首席オペレーター 長津）:「――防衛省より至急通達が入電！ 内閣法制局の見解により武力侵略に対する『防衛出動』は見送られましたが、国民への重大危機を看過できない防衛省は内閣の合意を取り付け、<strong>【害獣駆除（有害鳥獣等駆除・災害派遣）】という方針に基づき、海上自衛隊全部隊の動員を正式決定</strong>いたしました！ 八丈島〜御蔵島沖にて通常兵器（最新鋭魚雷・爆雷）による一斉駆除作戦を敢行します！」
                      </p>
                      <p className="text-slate-400">
                        💡 <strong>GM進行メモ・解説ガイダンス</strong>: 一般のプレイヤーは「なぜ自衛隊をすぐ出動できないのか」「害獣駆除とは何か」を知らないのが自然です。内閣法制局は『武力攻撃事態ではないため防衛出動は法律上不可』と突っぱねる一方、防衛省は国民保護のため『害獣駆除（災害排除）』という法解釈のウルトラCで大臣決裁・緊急出動させた、という背景を噛み砕いて説明してあげてください。プレイヤーが東京・富士山のどちらを選んでも自衛隊は『害獣駆除』としてDay 5の通常兵器一斉迎撃に突入します。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentDay === 5 && (
                <div className="space-y-4 text-xs leading-relaxed">
                  {/* フェーズ1：御蔵島沖噴火・八丈島地震 ＆ 富士山地下微動開始 */}
                  <div className="rounded-xl border border-rose-900/60 bg-[#140f1a] p-3.5 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-rose-900/40 pb-1.5">
                      <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-rose-400" />
                        【フェーズ1：御蔵島沖海底噴火 ＆ 富士山地下火山性微動開始】
                      </span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href="/images/eruption_monitoring_chart_day5.svg"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 transition border border-slate-700"
                        >
                          <ExternalLink className="h-3 w-3" /> 別タブ
                        </a>
                        <button
                          onClick={() => {
                            setChartModalDay(5);
                            setIsChartModalOpen(true);
                          }}
                          className="flex items-center gap-1 rounded bg-rose-700 hover:bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white transition shadow"
                        >
                          <Maximize2 className="h-3 w-3" /> 大画面
                        </button>
                      </div>
                    </div>

                    {/* 海図サムネイル */}
                    <div
                      onClick={() => {
                        setChartModalDay(5);
                        setIsChartModalOpen(true);
                      }}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 bg-[#081325] aspect-video max-h-56 flex items-center justify-center shadow-inner"
                    >
                      <EruptionMonitoringChart day={5} className="h-full w-full object-contain transition duration-300 group-hover:scale-102 select-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2.5 pointer-events-none">
                        <span className="text-[11px] font-semibold text-rose-200">
                          🔴 御蔵島沖海底噴火 ｜ ⚡ 八丈島 M4/震度3 ｜ ⚠️ 富士山地下 微動観測
                        </span>
                        <span className="text-[10px] text-rose-300 bg-black/60 px-2 py-0.5 rounded">
                          拡大表示
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-black/50 border border-rose-900/50 p-2.5 text-[11px] text-rose-100 space-y-1">
                      <strong className="text-rose-300 block font-bold">📢 【GMナレーション：民間放送局の臨時ニュース（富士山地下微動 ＆ 伊豆七島避難準備指示）】</strong>
                      <p className="italic text-slate-200 leading-relaxed">
                        （🎙️ 首席オペレーター 長津）:「――民間放送局の臨時ニュースをお伝えします。『伊豆諸島を北上する連続海底噴火と群発地震を受け、気象庁は富士山地下深部において微弱な火山性微動が観測されたと発表しました。政府は万一に備えて災害対策本部を設置しており、速報として「伊豆七島の活火山について噴火警戒レベルを【レベル3（入山規制）】に引き上げ、さらに【レベル4（避難準備）】に上がった場合に備えて島民へ避難準備を指示したこと、また富士山については突然の噴火が起きたとしてもただちに避難が必要となることはない」という声明を発表しています。この後、9時からは専門家を呼んでこの連鎖噴火の影響について議論を深めていきます』」
                      </p>
                    </div>
                  </div>

                  {/* フェーズ1.5：防衛庁・火山噴火予知連絡会からの緊急指令「富士山噴火猶予時間の計算」 */}
                  <div className="rounded-xl border border-rose-800/80 bg-[#1f1018] p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-rose-900/40 pb-1.5">
                      <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-rose-400 animate-pulse" />
                        【フェーズ1.5：防衛庁・火山噴火予知連絡会からの緊急指令「富士山噴火猶予時間の計算」】
                      </span>
                      <span className="text-[10px] text-rose-300 font-mono bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                        タイムリミット手計算パズル
                      </span>
                    </div>
                    <div className="rounded-lg bg-black/60 border border-rose-900/60 p-2.5 text-[11px] text-slate-200 space-y-1.5">
                      <strong className="text-rose-300 block font-bold">
                        📢 【長津の至急指令アナウンス（GM読み上げ用）】:
                      </strong>
                      <p className="italic leading-relaxed font-mono text-slate-100">
                        （🎙️ 首席オペレーター 長津）:「――防衛庁および火山噴火予知連絡会より至急指令が入電！『駿河湾奥・富士山地下マグマ溜まり直下までの残距離は【約240km】。巨大生物の現在の深海巡航速度は【時速5km】。もしこのまま直進した場合、富士山噴火の危機に至るまであとどのぐらいの猶予があるのか、おおよその時間を直ちに計算して報告せよ！』とのことです！ 各員、至急計算をお願いします！」
                      </p>
                    </div>
                    <div className="rounded bg-rose-950/40 border border-rose-800/60 p-2 text-[11px] text-rose-200 space-y-1">
                      💡 <strong>GM進行メモ・手計算パズルの回し方</strong>:
                      <p className="text-slate-300 leading-relaxed">
                        ・<strong>計算式</strong>: 残距離 240km ÷ 巡航速度 時速5km ＝ <strong>【48時間】（残り丸2日 ➔ Day 7未明に到達！）</strong><br />
                        ・<strong>演出の狙い</strong>: 答えをそのまま証拠資料（グラフ）で配るのではなく、プレイヤー自身に割り算を計算させることで、「えっ……あと48時間しかない！？ Day 7の未明に到達してしまうぞ！」と自分たちの手で絶望的なタイムリミットを突き止めさせます（※証拠資料「破局噴火タイムリミット算出グラフ」は提示しません）。
                      </p>
                    </div>
                  </div>

                  {/* フェーズ2：防衛省からの「機密指定」通達とプレイヤー独自行動 */}
                  <div className="rounded-xl border border-blue-900/60 bg-[#0d1527] p-3.5 space-y-2.5 shadow-md">
                    <span className="font-bold text-blue-300 text-xs flex items-center gap-1.5 border-b border-blue-900/40 pb-1.5">
                      <Shield className="h-4 w-4 text-blue-400" />
                      【フェーズ2：防衛省通達「軍事機密指定」による情報遮断 ＆ 自由行動】
                    </span>
                    <div className="rounded-lg bg-blue-950/40 border border-blue-800/60 p-2.5 text-[11px] text-blue-200 space-y-1.5">
                      <strong className="text-blue-300 block font-bold">🛡️ 【防衛省通達セリフ（GM読み上げ用）】</strong>
                      <p className="italic text-slate-200 leading-relaxed">
                        （🎙️ 首席オペレーター 長津）:「――防衛省より緊急回線で入電。『これより自衛隊が実施する実弾迎撃作戦は【最高軍事機密】に移行する。交戦状況に関する情報提供はここを以て遮断する。対策本部は作戦干渉を解かれ、独自の調査任務に戻られたし』との通達です」
                      </p>
                      <p className="text-slate-400 text-[10px] pt-1 border-t border-blue-900/50">
                        💡 <strong>GM進行のコツ</strong>: 自衛隊が部隊を展開してくれたことで、プレイヤーは自衛隊を信じて一息つきつつ、「自分たちにしかできない調査（富士山麓の荷物の真相、神主の子どもの捜索、音響遺品等）」に自由に動ける時間となります。
                      </p>
                    </div>
                  </div>

                  {/* フェーズ2.5：Day 5 総力調査アクション操作パネル（未選択プール全開放） */}
                  <div className="rounded-xl border border-indigo-900/60 bg-slate-900 p-3.5 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-indigo-400" />
                        【フェーズ2.5：Day 5 総力調査アクション（東京1枠 ＋ 現地2枠 / 未選択プール全開放）】
                      </span>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="rounded bg-indigo-950 px-2 py-0.5 font-bold text-indigo-300 border border-indigo-800">
                          東京: 1枠
                        </span>
                        <span className="rounded bg-teal-950 px-2 py-0.5 font-bold text-teal-300 border border-teal-800">
                          現地: {selectedDay5FieldActions.length}/2枠
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      💡 <strong>総ざらい総力調査</strong>: 自衛隊迎撃の間、プレイヤー陣営は残された未確認情報の総力調査を実施します。Day 3・Day 4で未調査の全プールから、東京1枠・現地2枠を選択して開示してください（残りはDay 6冒頭で完全回収されます）。
                    </p>

                    {/* 海上保安庁東京本部アクション */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-indigo-300 text-[11px]">
                          🏢 海上保安庁東京本部アクション（未調査{day5AvailableTokyoActions.length}枠中1枠選択）:
                        </span>
                        {pastChosenTokyo.length > 0 && (
                          <span className="text-[10px] text-emerald-400 font-mono">
                            ✅ 過去調査済: {pastChosenTokyo.join(", ")}
                          </span>
                        )}
                      </div>
                      {day5AvailableTokyoActions.length === 0 ? (
                        <div className="rounded border border-slate-800 bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-400">
                          東京側の未調査項目はすべて調査完了しています。
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {day5AvailableTokyoActions.map((a) => {
                            const isSelected = selectedDay5TokyoAction === a.id;
                            const isFromDay3 = DAY3_TOKYO_ACTIONS.some((d3) => d3.id === a.id);
                            return (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => setSelectedDay5TokyoAction(a.id)}
                                className={`rounded-lg p-2 text-left border transition ${
                                  isSelected
                                    ? "border-indigo-400 bg-indigo-950/70 shadow ring-1 ring-indigo-400"
                                    : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-white text-[11px]">{a.id} {a.badge}</span>
                                    <span className={`text-[9px] px-1 rounded font-semibold ${isFromDay3 ? "bg-amber-950 text-amber-300 border border-amber-800/80" : "bg-indigo-900 text-indigo-200"}`}>
                                      {isFromDay3 ? "Day 3繰越" : "Day 4繰越"}
                                    </span>
                                  </div>
                                  <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-indigo-600 text-white font-bold" : "text-slate-500"}`}>
                                    {isSelected ? "選択中" : "未選択"}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 小笠原現地アクション */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-teal-300 text-[11px]">
                          🏝️ 小笠原現地アクション（未調査{day5AvailableFieldActions.length}枠中2枠選択）:
                        </span>
                        {pastChosenField.length > 0 && (
                          <span className="text-[10px] text-emerald-400 font-mono">
                            ✅ 過去調査済: {pastChosenField.join(", ")}
                          </span>
                        )}
                      </div>
                      {day5AvailableFieldActions.length === 0 ? (
                        <div className="rounded border border-slate-800 bg-slate-950/60 p-2.5 text-center text-[11px] text-slate-400">
                          現地側の未調査項目はすべて調査完了しています。
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {day5AvailableFieldActions.map((a) => {
                            const isSelected = selectedDay5FieldActions.includes(a.id);
                            const isFromDay3 = DAY3_FIELD_ACTIONS.some((d3) => d3.id === a.id);
                            return (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => handleToggleDay5FieldAction(a.id)}
                                className={`rounded-lg p-2 text-left border transition ${
                                  isSelected
                                    ? "border-teal-400 bg-teal-950/70 shadow ring-1 ring-teal-400"
                                    : "border-slate-800 bg-slate-950/60 hover:bg-slate-800"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-white text-[11px]">{a.id} {a.badge}</span>
                                    <span className={`text-[9px] px-1 rounded font-semibold ${isFromDay3 ? "bg-amber-950 text-amber-300 border border-amber-800/80" : "bg-teal-900 text-teal-200"}`}>
                                      {isFromDay3 ? "Day 3繰越" : "Day 4繰越"}
                                    </span>
                                  </div>
                                  <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-teal-600 text-white font-bold" : "text-slate-500"}`}>
                                    {isSelected ? "選択中" : "未選択"}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{a.summary}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* フェーズ3：Day 5 結末（防衛省から貝浜への緊急打診：魚雷集中攻撃の是非と浪寄への諮問） */}
                  <div className="rounded-xl border border-red-800 bg-[#1e0d14] p-3.5 space-y-2.5 shadow-lg">
                    <span className="font-bold text-red-400 text-xs flex items-center gap-1.5 border-b border-red-900/50 pb-1.5">
                      <ShieldAlert className="h-4 w-4 text-red-400 animate-pulse" />
                      【フェーズ3（Day 5 結末）：防衛省からの緊急入電「魚雷直撃・浪寄准教授への統率＆火山刺激メカニズム照会」】
                    </span>
                    <div className="rounded-lg bg-black/60 border border-red-700/80 p-3 text-[11px] text-red-200 space-y-2">
                      <strong className="text-red-300 block font-bold">💥 【防衛省より貝浜（PC2）への無線（GM読み上げ用台本）】</strong>
                      <p className="italic text-slate-300 text-[10px]">
                        （🎙️ 首席オペレーター 長津）:「――暗号ホットラインに着信！ 貝浜リエゾン（PC2）へ、防衛省作戦本部より直通無線が接続されました！」
                      </p>
                      <p className="italic text-slate-100 leading-relaxed font-mono">
                        【防衛省作戦本部】:「――貝浜、防衛省作戦本部だ！ 魚雷群は全弾直撃・命中した！ しかし……爆砕された影は泥のように瞬時に再結合した。上層部は『命中している以上、さらに大量の魚雷を集中投入・飽和攻撃すれば殲滅できる』と主張している。だが、力押しだけで本当に通用するのか？！ 貝浜、直ちにあの生物の写真解析を行った浪寄准教授（PC5）の意見を確認してくれ！」
                      </p>
                      <div className="rounded bg-red-950/70 border border-red-800/80 p-2 text-[10px] text-amber-200 space-y-1">
                        <strong>🎯 GM聞き出しポイント（貝浜 / PC2 ➔ 浪寄 / PC5へ確認させる問い）:</strong>
                        <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-200">
                          <li>「通常兵器で倒せないなら、あいつらは一体どうやって一つの個体として統率（情報伝達）されているのか？」</li>
                          <li>「そして、どうやって海底火山や富士山を刺激し、なぜ一直線に北上できているのか？」</li>
                        </ul>
                        <p className="text-slate-300 pt-0.5">
                          💡 <strong>解明されるメカニズム</strong>: ①巨大生物は<strong>海底付近で海底地震を起こすような特別な振動</strong>を発生させ、それが海底火山を次々と刺激している。②生物が北上できる理由は<strong>「地磁気」と「隕石が放つ特殊な物質」</strong>の2つであり、小笠原・八丈島・三宅島の神社から組織的に盗まれた複数の隕石が<strong>青ヶ島沖・八丈島付近・三宅島付近の海に落とされていた</strong>ため、その痕跡を辿って富士山麓へ迫っている！ そして個体の統率は「音響・クジラ言語（コーダ）」へと繋がります。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentDay === 6 && (
                <div className="space-y-3.5 text-xs leading-relaxed">
                  {/* 状況推移：一時的沈静化（潜航）から終盤の再浮上・微動復活へ */}
                  <div className="rounded-xl border border-rose-900/60 bg-[#19101c] p-3.5 space-y-2 shadow-md">
                    <div className="flex items-center justify-between border-b border-rose-900/40 pb-1.5">
                      <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-amber-400" />
                        【Day 6 戦況推移：一時的沈静化（潜航） ➔ 終盤の急激な再浮上・微動復活】
                      </span>
                      <span className="text-[10px] font-mono text-red-400 font-bold bg-red-950/80 px-2 py-0.5 rounded border border-red-800/80">
                        破局噴火まで残り 24時間
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                      <div className="rounded bg-black/40 border border-slate-800 p-2.5 space-y-1">
                        <strong className="text-cyan-300 block">昼の演出（一時的沈静化と迎撃完了見込み）:</strong>
                        <p className="italic text-slate-300 leading-relaxed font-mono">
                          （🎙️ 首席オペレーター 長津）:「（昼）――各員へ報告。海上自衛隊の迎撃行動により、巨大生物は活動を停止しました。御蔵島沖噴火は小康状態となり、富士山地下の微動も一時的に沈静化しています。富士山の噴火についてもまだ予断を許さないものの、この巨大生物と噴火が関係あるとする意見が多く、撃退したことにより事態が沈静化するだろうという意見が多く見られます。直接の因果関係が認められないことからメディアには引き続き巨大生物の情報は出せません。これでこの一連の作戦は完了となる見込みです」
                        </p>
                      </div>
                      <div className="rounded bg-rose-950/50 border border-rose-900/60 p-2.5 space-y-1">
                        <strong className="text-rose-300 block">夕〜夜の演出（急激な再浮上と微動継続！）:</strong>
                        <p className="italic text-rose-100 leading-relaxed font-mono">
                          （🎙️ 首席オペレーター 長津）:「（夕〜夜）――警報！海上自衛隊の深海ソナーが駿河トラフ境界へ向けて高速で再浮上する巨大影を探知！ 同時に富士山地下の火山性微動は継続！巨大生物はまだ生存している可能性が高く、同時に火山活動に直接影響を及ぼしていると考えられます」
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 東京側未選択情報の完全回収ガイダンス */}
                  <div className="rounded-xl border border-indigo-700/60 bg-[#0d1028] p-3 space-y-1.5 shadow-md">
                    <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                      <span>🗼 【Day 6 開始時：東京班（朝潮・貝浜）未選択アクションの100%完全回収】</span>
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Day 5で選ばれなかった東京アクション（謎のダイバーグループによる富士山麓への荷物搬入＆小笠原・八丈島・三宅島の神社から盗まれた複数隕石の海域投棄の特定、または元神主子どもの口伝）は、東京班の夜間捜査によってDay 6朝までに<strong>自動的に100%手元に揃います</strong>。
                      GMは「東京の朝潮・貝浜から徹夜の捜査完了報告が入った」と宣言し、両方の情報を開示して手詰まりを防いでください。
                    </p>
                  </div>

                  {/* フェーズ1：舌クリック音の秘密判明 ＆ 祝詞の日本語自体は無意味 */}
                  <div className="rounded-xl border border-indigo-900/60 bg-[#101026] p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-indigo-900/40 pb-1.5">
                      <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <span>👅 【フェーズ1：祝詞の「舌クリック音」判明 ＆ 日本語自体は無意味】</span>
                      </span>
                      <button
                        onClick={() => handlePlayAudioCue("tongue-click")}
                        className="flex items-center gap-1.5 rounded bg-amber-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-amber-500 transition shadow"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> 舌クリック音
                      </button>
                    </div>
                    <p className="italic text-slate-200 font-mono leading-relaxed bg-black/40 p-2.5 rounded border border-indigo-950">
                      「――古文書の神代文字の注釈にあった『吸音・弾舌』という奇妙な記号。坂凪（PC3）と浪寄（PC5）が照合した瞬間、戦慄が走ります。古代の祝詞は人間の喉の歌声ではなかった……舌を上顎・歯茎に強く打ち鳴らす鋭い『舌クリック音（吸着破裂音）』だったのだ！」
                    </p>
                    <div className="rounded bg-amber-950/40 border border-amber-800/60 p-2 text-[11px] text-amber-200 space-y-1">
                      <strong>⚠️ GM進行ヒント（プレイヤーが「祝詞を読めばいいのか？」と誤解した時の誘導）:</strong>
                      <p className="text-slate-200 leading-relaxed">
                        「祝詞を普通に日本語として読んでも、空気と水面の境界面で99.9%が跳ね返り反射して深海には届きません。祝詞の言の葉（言葉）そのものに力があるのではなく、祝詞を唱える口と舌の動きによって『舌クリック音』を発生させることが本体です。太古の島人は、音響物理を知らない後世の人間にこのクリック音を誤りなく継承させるため、『祝詞の型』として口伝に残したのです。」
                      </p>
                    </div>
                  </div>

                  {/* フェーズ2：古代の海中筒作法 ＆ 4段階の開示ロジック */}
                  <div className="rounded-xl border border-cyan-900/60 bg-[#0d1829] p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-cyan-900/40 pb-1.5">
                      <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <span>🎋 【フェーズ2：海中筒作法 ＆ 朝倉ノートへ繋がる4段階の証拠ロジック】</span>
                      </span>
                      <button
                        onClick={() => handlePlayAudioCue("sea-tube")}
                        className="flex items-center gap-1.5 rounded bg-cyan-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-cyan-500 transition shadow"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> 海中筒の音響
                      </button>
                    </div>
                    <p className="italic text-slate-200 font-mono leading-relaxed bg-black/40 p-2.5 rounded border border-cyan-950">
                      「小笠原の古文書に驚くべき歴史的記録が記されています。『太古、海より触手うごめく巨大な烏賊（イカ）の如き魔物の塊り現れしとき、島人は海中筒より鯨の神音を響かせ、鯨の群れを召喚せり。鯨どもはその巨大なるイカの塊りを片っ端から貪り喰らい尽くし、海は平穏を取り戻せり』……！」
                    </p>
                    <div className="text-[11px] text-slate-300 bg-cyan-950/30 p-2.5 rounded border border-cyan-900/40 space-y-1.5">
                      <strong className="text-cyan-200 font-bold block">
                        🪜 【朝倉ノートの存在価値を最大化する4段階開示ロジック（GM演出の梯子）】
                      </strong>
                      <p className="text-slate-200 leading-relaxed">
                        以下の4つの証拠を順番に確認させることで、プレイヤー全員に「なぜ朝倉教授のクジラ音響ノートが必要なのか」を完璧に理解させます：
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 pl-1 text-[10px] text-slate-300">
                        <li><strong>① 儀礼の存在</strong>: 噴火や巨大生物出現時、神社では海へ出て水底へ祝詞を読む儀礼があった</li>
                        <li><strong>② 祝詞の現存</strong>: 神社奥殿に祝詞が現存（ただし日本語ではなく舌打ちの記号）</li>
                        <li><strong>③ 怪異の動機と火山刺激</strong>: 古文書に『巨大生物は地磁気と星の石（隕石）が放つ特殊な物質を追って集め、海底付近で特別な振動を起こして海底火山を目覚めさせる』と明記</li>
                        <li><strong>④ 太古の解決史</strong>: 古文書に『太古に祝詞でマッコウクジラを呼び、巨大なイカの塊りを捕食させた』前例がある</li>
                      </ul>
                      <p className="text-amber-300 text-[10px] pt-1 border-t border-cyan-900/60 font-semibold">
                        ➔ 「相手は巨大なイカの塊り、先人はクジラに食べさせて解決した。ならば現代の我々もクジラに呼びかけねばならない！ しかし太古の祝詞だけでは太平洋全域のクジラは統率できない。そこで必要になるのが――朝倉教授のクジラ言語ノートだ！」
                      </p>
                    </div>
                  </div>

                  {/* フェーズ3：朝倉教授ノート3段階開示 ＆ 5大コーダ実録 */}
                  <div className="rounded-xl border border-indigo-900/60 bg-[#120f26] p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-indigo-900/40 pb-1.5">
                      <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                        <span>🐋 【フェーズ3：故・朝倉教授ノート 3段階開示 ＆ 5大コーダ実録テープ】</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePlayAudioCue("coda-tape")}
                          className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] font-semibold text-slate-200 transition"
                        >
                          <Volume2 className="h-3 w-3" /> テープ音
                        </button>
                        <button
                          onClick={() => handlePlayAudioCue("climax-call")}
                          className="flex items-center gap-1 rounded bg-indigo-600 hover:bg-indigo-500 px-2 py-1 text-[10px] font-bold text-white transition shadow"
                        >
                          <Volume2 className="h-3 w-3" /> 構文テスト再生
                        </button>
                      </div>
                    </div>
                    <p className="italic text-slate-200 font-mono leading-relaxed bg-black/40 p-2.5 rounded border border-indigo-950">
                      「スピーカーから、深海の冷たい水音とともに乾いたクリック音が鳴り響きます。朝倉教授の遺品テープと研究ノート。マッコウクジラは深海で独自のクリック言語体系（コーダ）を操り、仲間同士で高度な会話を交わしていたのです！」
                    </p>
                    <div className="text-[11px] text-slate-300 bg-indigo-950/30 p-2.5 rounded border border-indigo-900/40 space-y-1.5">
                      <strong className="text-amber-200 font-bold block">
                        📚 朝倉教授ノートの3段階構成 ＆ 5大コーダ実録:
                      </strong>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div className="rounded bg-slate-900 p-2 border border-slate-800">
                          <strong className="text-cyan-300 block mb-0.5">第1段階：基礎生態事実</strong>
                          <span>マッコウクジラだけが深海1,000〜2,000mに潜水し、ダイオウイカを主食とする。</span>
                        </div>
                        <div className="rounded bg-slate-900 p-2 border border-slate-800">
                          <strong className="text-indigo-300 block mb-0.5">第2段階：クジラ言語仮説</strong>
                          <span>クリック音列（コーダ）の周波数・打数・間隔（ICI）による文法体系モデル。</span>
                        </div>
                        <div className="rounded bg-slate-900 p-2 border border-slate-800">
                          <strong className="text-amber-300 block mb-0.5">第3段階：5大コーダ実録</strong>
                          <span>①捕食、②危機、③位置指示、④到達距離（SOFAR）、⑤YES（肯定応答）。</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-[10px] pt-1 border-t border-indigo-900/60">
                        🎯 <strong>Day 5 防衛庁の問いへの完全回答</strong>: 「通常兵器で倒せない怪異の群体統率の正体は、音響による細胞間ネットワーク同調。そしてその音波帯域を完全に制圧・捕食できる自然界唯一の天敵こそが、マッコウクジラなのです！」
                      </p>
                    </div>
                  </div>

                  {/* フェーズ4：祝詞完成 ＆ 防衛庁運用企画局長との直接電話交渉（潜水艦SOFAR層放流・攻撃抑制） */}
                  <div className="rounded-xl border border-cyan-800/80 bg-[#091e24] p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-cyan-800/40 pb-1.5">
                      <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <Radio className="h-4 w-4 text-cyan-400" />
                        <span>📡 【フェーズ4：祝詞完成 ＆ 防衛庁運用企画局長との直接電話交渉（潜水艦SOFAR層放流）】</span>
                      </span>
                      <button
                        onClick={() => handlePlayAudioCue("climax-call")}
                        className="flex items-center gap-1.5 rounded bg-gradient-to-r from-cyan-600 to-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:from-cyan-500 hover:to-indigo-500 transition shadow"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> 祝詞メッセージ信号を試聴
                      </button>
                    </div>

                    {/* 長津の仲介アナウンス */}
                    <div className="bg-black/50 p-2.5 rounded border border-cyan-950 text-slate-200 font-mono text-[11px] space-y-1">
                      <strong className="text-cyan-300 block font-bold">📢 【長津の電話交渉前アナウンス（GM読み上げ用）】:</strong>
                      <p className="italic text-cyan-100 leading-relaxed">
                        （🎙️ 首席オペレーター 長津）:「――防衛庁の上層部への連絡先があります。この音声を使うには海上自衛隊の協力が必要だと思います。しかし、こんな作戦を許可してくれるかどうか……。みなさん、私にできることは連絡することだけです。頼みますね」
                      </p>
                    </div>

                    {/* 防衛庁 運用企画局長との直接電話交渉パネル */}
                    <div className="rounded bg-blue-950/40 border border-blue-800/60 p-3 text-[11px] text-blue-100 space-y-2.5 font-mono">
                      <div className="flex items-center justify-between border-b border-blue-900/40 pb-1">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                          <PhoneCall className="h-3.5 w-3.5 text-amber-400" />
                          <span>📞 【ホットライン：防衛庁 運用企画局長との直接電話交渉】</span>
                        </span>
                        <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800 font-bold">
                          極秘暗号回線
                        </span>
                      </div>

                      <div className="space-y-1.5 text-slate-200 leading-relaxed">
                        <p className="text-slate-400 text-[10px] italic">
                          （ツーツーツー……ガチャッ。受話器の向こうから、重苦しく威圧感のある声が響く）
                        </p>
                        <p className="italic text-blue-200">
                          （🎙️ 防衛庁 運用企画局長）:「――防衛庁運用企画局長だ。合同対策本部だな。こんな深夜に緊急回線を繋いでくるとは、一体何の用件だね？」
                        </p>
                      </div>

                      {/* 局長の2大疑問と論破ロジック */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                        <div className="rounded bg-slate-900/90 p-2 border border-slate-700 space-y-1">
                          <strong className="text-rose-400 block font-bold border-b border-rose-900/50 pb-0.5">
                            ❓ 局長の疑念①：【信ぴょう性はあるのか？】
                          </strong>
                          <p className="text-slate-300 italic">
                            「クジラを呼ぶ祝詞音声だと？ 国家存亡の危機にオカルトや神話を信じて自衛隊を動かせというのか？ なぜ通常兵器ではなくクジラなのだ？」
                          </p>
                          <div className="text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-900/60 space-y-0.5">
                            <strong>🎯 論破ポイント:</strong>
                            <p>・Day 5で魚雷が直撃しても瞬時に再結合した事実（通常兵器は無効）。</p>
                            <p>・実弾爆発は海底火山を刺激し、富士山破局噴火を早める自殺行為。</p>
                            <p>・怪異の細胞ネットワークを音響制圧・完全捕食できる自然界唯一の天敵がマッコウクジラ（浪寄・朝倉ノートの科学的知見）。</p>
                          </div>
                        </div>

                        <div className="rounded bg-slate-900/90 p-2 border border-slate-700 space-y-1">
                          <strong className="text-amber-400 block font-bold border-b border-amber-900/50 pb-0.5">
                            ❓ 局長の疑念②：【時間的猶予はあるのか？】
                          </strong>
                          <p className="text-slate-300 italic">
                            「仮に正しくとも明朝には駿河湾奥へ突入する。なぜ今夜、深夜のうちに潜水艦を動かさねばならんのだ？ 明日の朝、現場を見てからでは遅いのか？」
                          </p>
                          <div className="text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-900/60 space-y-0.5">
                            <strong>🎯 論破ポイント:</strong>
                            <p>・太平洋沖のクジラが駿河湾まで泳ぎ着くには最低6〜8時間必要。</p>
                            <p>・怪異は時速6kmで正確に北上中（残り24時間で直撃）。</p>
                            <p>・今夜潜水艦が水深1,000mのSOFAR層（低周波音が地球規模で届く深海チャンネル）から放流しなければ、明朝の到達に物理的に絶対間に合わない！</p>
                          </div>
                        </div>
                      </div>

                      {/* 局長の折れるシーン */}
                      <div className="rounded bg-black/60 border border-blue-900 p-2 text-slate-200 space-y-1">
                        <strong className="text-cyan-300 block font-bold">
                          🤝 【局長の屈服・承認（GM読み上げ用）】:
                        </strong>
                        <p className="italic text-cyan-100 leading-relaxed text-[10.5px]">
                          （🎙️ 防衛庁 運用企画局長）:「――……なるほど。通常兵器の無力化と火山刺激の破滅リスク、そしてクジラの遊泳速度の逆算か。机上の空論ではなく、極めて冷徹な計算に基づいているな。……いいだろう。防衛庁運用企画局長として、私が全責任を背負おう。直ちに第1潜水隊群へ緊急出動を下令する。潜水艦を深海1,000mのSOFAR層へ急速潜航させ、貴官らの祝詞音源を大出力放流させる。また、明朝の現場部隊へは『実弾魚雷の即時発射を抑制し、クジラの捕食を見届けて待機せよ』と通達しよう。――明朝の運命、君たちに託すぞ」
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* フェーズ4.5：深夜の潜水艦SOFAR層事前放流開始 ＆ 作戦命名 */}
                  <div className="rounded-xl border border-cyan-700/80 bg-[#081a20] p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-cyan-800/40 pb-1.5">
                      <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                        【フェーズ4.5：深夜の潜水艦SOFAR層事前放流開始 ＆ 合同チーム作戦名の命名】
                      </span>
                      <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                        潜水艦SOFAR放流 ＆ 作戦命名
                      </span>
                    </div>
                    <div className="rounded-lg bg-black/60 border border-cyan-900/60 p-2.5 text-[11px] text-slate-200 space-y-1.5">
                      <strong className="text-cyan-300 block font-bold">
                        📢 【長津の深夜潜水艦放流 ＆ 作戦命名アナウンス（GM読み上げ用）】:
                      </strong>
                      <p className="italic leading-relaxed font-mono text-cyan-100">
                        （🎙️ 首席オペレーター 長津）:「――海上自衛隊の潜水艦が水深1,000mの深海SOFAR層へ到達！ 大出力深海ハイドロスピーカーより、新言語祝詞『人・勇魚・契り……』の放流を開始いたしました！ 音波は海中音響チャンネルに乗って、太平洋全域へと急速に拡散しています！ ……そして各員、この歴史の闇で決行される前代未聞の迎撃作戦に、当合同対策チームとしての【作戦名（オペレーション名）】をつけませんか？ 全員が心を一つにして夜明けの決戦を迎えるための名前です！」
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="text-slate-300 font-bold">作戦名入力:</span>
                      <input
                        type="text"
                        value={operationName}
                        onChange={(e) => setOperationName(e.target.value)}
                        placeholder="例: オペレーション・ワタツミ / 大捕食作戦"
                        className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-cyan-300 w-64 font-bold focus:border-cyan-400 outline-none"
                      />
                      <span className="text-[10px] text-emerald-400 font-mono">
                        発動予定: 【{operationName || "未命名作戦"}】
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentDay === 7 && (
                <div className="space-y-4 text-xs leading-relaxed">
                  {/* 作戦発動ヘッダーバナー */}
                  <div className="rounded-xl border border-cyan-500/80 bg-gradient-to-r from-[#07242c] via-[#093539] to-[#07242c] p-3 text-cyan-200 shadow-lg flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-300 animate-spin-slow" />
                      <span className="font-bold text-white text-xs">
                        🚀 【{operationName || "合同迎撃作戦"} 最終結果】
                      </span>
                      <span className="rounded bg-black/50 px-2 py-0.5 text-[10px] text-amber-300 font-mono border border-amber-900/60">
                        迎撃標的: 【{creatureCodename || "ワタツミ"}】
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono">
                      海自潜水艦SOFAR層事前放流 × マッコウクジラ深海大捕食
                    </span>
                  </div>

                  {/* フェーズ1：運命の夜明け・クジラ群の到達と生体ソナー大捕食 */}
                  <div className="rounded-xl border border-rose-900/60 bg-[#160f1c] p-3.5 space-y-2 shadow-md">
                    <div className="flex items-center justify-between border-b border-rose-900/40 pb-1.5">
                      <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-rose-400" />
                        【フェーズ1：運命の夜明け・駿河湾口突入 ＆ 夜通し泳いだクジラ群の到達・大捕食】
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                        微動完全停止・作戦成功
                      </span>
                    </div>
                    <div className="rounded bg-black/50 border border-rose-950 p-2.5 text-[11px] text-slate-200 space-y-1.5">
                      <strong className="text-cyan-300 block font-bold">🌊 深海での決着ナレーション（GM読み上げ用）:</strong>
                      <p className="italic leading-relaxed font-mono">
                        「怪異が水深600〜1,000mを維持して駿河湾奥へ突入。湾奥に陣取る海自潜水艦部隊は、昨夜の約束通り魚雷発射管を開きながらも『攻撃抑制』を死守し、固唾を呑んで待機します。直後――深海ソナーに無数のクリック音反響！ 昨夜から放流を続けた祝詞に応え、夜を徹して太平洋を泳いできたマッコウクジラ群が駿河湾深海へ到達！ クジラたちは自らの頭部から放つ生体ソナー（エコーロケーション）で怪異を探知し、本能のまま深海へ一斉潜航・大捕食を敢行！ 怪異の超群体は完全に呑み込まれ、富士山地下深部の火山性微動は完全停止！ 自衛隊の実弾は一発も撃たれず発射中止（スタンドダウン）となりました！」
                      </p>
                    </div>
                  </div>

                  {/* フェーズ2：長津オペレーターの感涙アナウンス */}
                  <div className="rounded-xl border border-cyan-800/80 bg-[#091e24] p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-cyan-800/40 pb-1.5">
                      <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                        <span>📢 【フェーズ2：首席オペレーター 長津 感涙の作戦成功アナウンス】</span>
                      </span>
                    </div>
                    <div className="space-y-2 bg-black/50 p-3 rounded border border-cyan-950 text-slate-100 font-mono text-[11px] leading-relaxed">
                      <p className="italic">
                        （🎙️ 首席オペレーター 長津）:「――各員へ緊急報告！ 海自潜水艦の深海音響探知により、前代未聞の巨大な生体音響反応を探知！ ……クジラです！ 昨夜から放流を続けた祝詞に応え、太平洋沖から夜を徹して泳いできたマッコウクジラの大群が……駿河湾口深海へ到達いたしました！」
                      </p>
                      <p className="italic text-cyan-200">
                        「クジラたちの頭部から放たれた強力な生体ソナーが、水深800mの暗黒に潜む怪異を完全に捉えました！ 群れが一斉に深海へ突入……捕食行動を開始！ ――信じられません、怪異の細胞間ネットワーク同調音が、クジラたちの音波に呑み込まれ、急速に崩壊・分断されていきます！ クジラたちが……太古の盟約通り、大獲物を喰らい尽くしています！」
                      </p>
                      <p className="italic text-emerald-200">
                        「――気象庁火山監視課より緊急電！ 富士山地下深部における火山性微動、急激に減衰……完全に停止いたしました！ 海底噴火の連鎖も完全に沈静化！ 富士山の破局噴火危機は……完全に回避されました！」
                      </p>
                      <p className="italic text-amber-200">
                        「防衛省・自衛艦隊司令部より全潜水艦へ通達入電！ 『目標の完全消滅を確認。魚雷発射管閉鎖、全部隊攻撃中止（スタンドダウン）』！ 自衛隊の実弾は一発も撃たれることなく、海底火山を刺激するリスクも完全に消滅いたしました！」
                      </p>
                      <p className="italic text-white font-bold border-t border-cyan-900/60 pt-1.5">
                        「……勝ったのです。朝潮危機管理官、貝浜リエゾン、坂凪隊長、太刀魚観測員、浪寄准教授、初瀬さん……！ 太古から受け継がれた海の約束と、みなさんが結集した科学と勇気が……この国を、日本を救いました……っ！！」
                      </p>
                    </div>
                  </div>

                  {/* フェーズ3：海上自衛隊幹部からの直通電話（大人の本音と政治的思惑） */}
                  <div className="rounded-xl border border-blue-900/80 bg-[#0d162b] p-3.5 space-y-2.5 shadow-md">
                    <span className="font-bold text-blue-300 text-xs flex items-center gap-1.5 border-b border-blue-900/40 pb-1.5">
                      <Shield className="h-4 w-4 text-blue-400" />
                      【フェーズ3：海上自衛隊幹部からの直通電話（政治的思惑と大人の本音）】
                    </span>
                    <div className="rounded bg-black/60 border border-blue-800/60 p-3 text-[11px] text-blue-100 space-y-2 font-mono">
                      <p className="text-slate-400 text-[10px] italic">
                        （長津の歓声が響く司令室。突如、防衛省直通のホットライン赤電話が鳴り響く）
                      </p>
                      <p className="italic leading-relaxed">
                        （🎙️ 防衛省・自衛艦隊幹部）:「――朝潮君、貝浜君、聞こえるかね。<br />
                        ……まずは、事態をここまで抑え込んだ君たちの尽力には感謝する。<br /><br />
                        だがね……自衛隊の出動まで閣議決定しておいて、自衛隊側は何の活動もしなかったというのは、世間にも国会にも説明ができないんでね。ここは、海上自衛隊の出動を決めた総理が国民に説明するために、少し稼働したいと言っている。<br /><br />
                        このあと、駿河湾沖合に向けて、自衛隊側から『害獣駆除の掃討攻撃（爆雷・魚雷投下）』を一斉に行わせる。そもそも、クジラの攻撃で相手が完全に消滅したという確固たる証拠があるわけでもないだろう？<br /><br />
                        世間には『海上自衛隊が役に立った』という証明にもなるし、総理も自分の決断に自信が持てる。……君たちの功績は、一切表には出せない。国家防衛機密として処理される。<br /><br />
                        すまんが、分かってくれ。<br /><br />
                        このあと、政府からの発表がある。<br /><br />
                        <strong className="text-amber-300 text-xs font-bold">……だが、君たちが正しかった。感謝する</strong>」
                      </p>
                      <p className="text-slate-400 text-[10px] italic">
                        （ツーツーツー……と静かに終話音が響く）
                      </p>
                    </div>
                  </div>

                  {/* フェーズ4：テレビ臨時ニュース（政府公式発表の全国報道） */}
                  <div className="rounded-xl border border-red-900/80 bg-[#1a0f12] p-3.5 space-y-2.5 shadow-md">
                    <span className="font-bold text-red-300 text-xs flex items-center gap-1.5 border-b border-red-900/40 pb-1.5">
                      <Flame className="h-4 w-4 text-red-400" />
                      【フェーズ4：テレビ臨時ニュース（政府公式発表の全国報道）】
                    </span>
                    <div className="rounded bg-black/60 border border-red-800/60 p-3 text-[11px] text-red-100 space-y-2 font-mono">
                      <p className="text-slate-400 text-[10px] italic">
                        （画面が切り替わり、ニューススタジオの引き締まったアナウンサーの声が流れる）
                      </p>
                      <p className="italic leading-relaxed">
                        （🎙️ ニュースアナウンサー）:「――ここで、政府・非常災害対策本部からの臨時記者会見の模様をお伝えします。<br /><br />
                        伊豆諸島から駿河湾にかけて続いていた連続海底噴火と、富士山地下深部で観測されていた火山性微動について、内閣官房長官は先ほど、<strong>一連の危機事態が完全に沈静化した</strong>と発表しました。<br /><br />
                        政府の発表によりますと、西之島沖から駿河トラフにかけて北上していた『未確認の超巨大海洋生物』が、海底のマグマ網を刺激し、富士山の火山活動を誘発していた可能性が高いことが判明しました。<br /><br />
                        これに対し、政府の『有害鳥獣駆除』方針に基づき緊急出動していた海上自衛隊が、今朝未明、駿河湾口沖合の深海においてこの巨大生物を捕捉。潜水艦部隊および護衛艦による一斉射撃と実弾掃討作戦を敢行し、<strong>海上自衛隊の迅速な武力行使によって、この巨大生物を完全に撃滅・駆除した</strong>とのことです。<br /><br />
                        巨大生物の駆除に伴い、気象庁は本日午前、富士山地下深部における火山性微動が完全に停止したことを確認。これを受け、政府および気象庁は、富士山の噴火警戒レベルを【レベル1（活火山であることに留意）】へと引き下げました。また、伊豆諸島各島に出されていた避難準備指示もすべて解除されました。<br /><br />
                        会見の最後で総理大臣は、『自衛隊の果敢な決断と迅速な行動が、国土と国民の生命を守り抜いた』と、部隊の功績を高く評価する声明を発表しています――」
                      </p>
                    </div>
                  </div>

                  {/* フェーズ5：アンサング・ヒーロー（名もなき英雄たち）のエピローグ */}
                  <div className="rounded-xl border border-indigo-800/70 bg-[#0f1226] p-3.5 space-y-2 shadow-md">
                    <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5 border-b border-indigo-900/40 pb-1.5">
                      <span>🕊️ 【フェーズ5：エピローグ・アンサング・ヒーロー（名もなき英雄たち）】</span>
                    </span>
                    <div className="rounded bg-indigo-950/50 border border-indigo-800/60 p-3 space-y-1.5 text-[11px] text-slate-200 font-mono">
                      <strong className="text-amber-300 block text-xs">⭐ 6人の英雄たちの結び:</strong>
                      <p className="italic leading-relaxed">
                        「『俺たちの手柄は歴史のどこにも載らないな』<br />
                        『ええ。ですが、駿河湾の底でクジラたちと交わしたあの約束だけは本物でした』<br /><br />
                        テレビ画面に映る総理の誇らしげな笑顔と、国民の安堵の歓声を背に、6人（朝潮・貝浜・坂凪・太刀魚・浪寄・初瀬／5名時は5人）は静かにデスクを片付け、日常へと戻っていく。<br />
                        誰からも讃えられず、歴史に記録されることもない――だが、自分たちがこの国と海を守り抜いたという確かな誇りを胸に」
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側：このフェーズで公開すべき証拠とプレイヤー管理 */}
        <div className="col-span-4 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Day {currentDay} 配布・開示証拠チェック
            </h4>
            {[2, 3, 4, 5].includes(currentDay) && (
              <span className="text-[10px] text-indigo-400 font-semibold">
                合議選択連動中
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {(() => {
              // Dayごとに表示する証拠を計算
              let displayedEvidences = project.evidences.filter((e) => e.foundPhase === currentDay);

              if (currentDay === 4) {
                // Day 4で選択されたアクション（Day 3繰り越し含む）の証拠を追加
                const day4ChosenActionIds = [selectedDay4TokyoAction, ...selectedDay4FieldActions];
                const day4ChosenEvIds = ALL_ACTION_DEFS
                  .filter((a) => day4ChosenActionIds.includes(a.id))
                  .map((a) => a.evidenceId);
                const extraEvidences = project.evidences.filter(
                  (e) => day4ChosenEvIds.includes(e.id) && !displayedEvidences.some((de) => de.id === e.id)
                );
                displayedEvidences = [...displayedEvidences, ...extraEvidences];
              } else if (currentDay === 5) {
                // Day 5で選択された総力調査アクションの証拠を追加
                const day5ChosenActionIds = [selectedDay5TokyoAction, ...selectedDay5FieldActions];
                const day5ChosenEvIds = ALL_ACTION_DEFS
                  .filter((a) => day5ChosenActionIds.includes(a.id))
                  .map((a) => a.evidenceId);
                const extraEvidences = project.evidences.filter(
                  (e) => day5ChosenEvIds.includes(e.id) && !displayedEvidences.some((de) => de.id === e.id)
                );
                displayedEvidences = [...displayedEvidences, ...extraEvidences];
              }

              if (displayedEvidences.length === 0) {
                return (
                  <div className="rounded border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                    このDayに新たに配る直接カードはありません
                  </div>
                );
              }

              return displayedEvidences.map((ev) => {
                const owner = project.characters.find((c) => c.id === ev.ownerId);

                // アクション連動チェック
                let isActionSelected = false;
                let linkedActionName = "";

                if (currentDay === 2) {
                  const tokyoMatch = TOKYO_ACTIONS.find((a) => a.evidenceId === ev.id);
                  const fieldMatch = FIELD_ACTIONS.find((a) => a.evidenceId === ev.id);
                  if (tokyoMatch) {
                    linkedActionName = tokyoMatch.id;
                    isActionSelected = selectedTokyoAction === tokyoMatch.id;
                  } else if (fieldMatch) {
                    linkedActionName = fieldMatch.id;
                    isActionSelected = selectedFieldActions.includes(fieldMatch.id);
                  }
                } else if (currentDay === 3) {
                  const tokyoMatch = DAY3_TOKYO_ACTIONS.find((a) => a.evidenceId === ev.id);
                  const fieldMatch = DAY3_FIELD_ACTIONS.find((a) => a.evidenceId === ev.id);
                  if (tokyoMatch) {
                    linkedActionName = tokyoMatch.id;
                    isActionSelected = selectedDay3TokyoAction === tokyoMatch.id;
                  } else if (fieldMatch) {
                    linkedActionName = fieldMatch.id;
                    isActionSelected = selectedDay3FieldActions.includes(fieldMatch.id);
                  }
                } else if (currentDay === 4) {
                  const tokyoMatch = ALL_TOKYO_ACTIONS.find((a) => a.evidenceId === ev.id);
                  const fieldMatch = ALL_FIELD_ACTIONS.find((a) => a.evidenceId === ev.id);
                  if (tokyoMatch) {
                    linkedActionName = tokyoMatch.id;
                    isActionSelected = selectedDay4TokyoAction === tokyoMatch.id;
                  } else if (fieldMatch) {
                    linkedActionName = fieldMatch.id;
                    isActionSelected = selectedDay4FieldActions.includes(fieldMatch.id);
                  }
                } else if (currentDay === 5) {
                  const tokyoMatch = ALL_TOKYO_ACTIONS.find((a) => a.evidenceId === ev.id);
                  const fieldMatch = ALL_FIELD_ACTIONS.find((a) => a.evidenceId === ev.id);
                  if (tokyoMatch) {
                    linkedActionName = tokyoMatch.id;
                    isActionSelected = selectedDay5TokyoAction === tokyoMatch.id;
                  } else if (fieldMatch) {
                    linkedActionName = fieldMatch.id;
                    isActionSelected = selectedDay5FieldActions.includes(fieldMatch.id);
                  }
                }

                const isLinkedDay = [2, 3, 4, 5].includes(currentDay);
                const isLinkedAndActive = isLinkedDay && isActionSelected;

                return (
                  <div
                    key={ev.id}
                    className={`rounded-lg border p-3 text-xs transition ${
                      isLinkedAndActive
                        ? "border-emerald-600/70 bg-emerald-950/25 shadow-sm"
                        : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isLinkedDay && linkedActionName && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              isActionSelected
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {linkedActionName} {isActionSelected ? "開示中" : "未選択"}
                          </span>
                        )}
                        <span
                          className={`font-bold ${
                            isLinkedAndActive
                              ? "text-emerald-300"
                              : "text-indigo-300"
                          }`}
                        >
                          {ev.title}
                        </span>
                      </div>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 whitespace-nowrap">
                        {owner ? owner.name.split(":")[0] : "全体"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{ev.description}</p>
                    {ev.id === "ev-aerial-recon-report" && isActionSelected && (
                      <button
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-300 hover:text-amber-200 transition"
                      >
                        <ImageIcon className="h-3 w-3" /> 空撮写真をモーダルで確認
                      </button>
                    )}
                  </div>
                );
              });
            })()}

            {project.evidences.filter((e) => e.foundPhase === currentDay).length === 0 && (
              <div className="rounded border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                このDayに新たに配る直接カードはありません
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 空撮写真拡大モーダル */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    海上保安庁 羽田航空基地 MA722撮影 緊急偵察写真
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    撮影日時: Day 2 08:42 | 撮影高度: 3,000ft | 撮影位置: 西之島北西約25海里
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 relative rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-[60vh]">
              <img
                src="/images/aerial_recon_wide.jpg"
                alt="西之島北西海域 空撮写真"
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            <div className="mt-4 rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-amber-300">
                【画像解析所見（海上保安庁 警備救難部 航空分析班）】
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ・背景（写真上方）に西之島海底火山の噴煙が明瞭に確認できる。<br />
                ・中央部海面に、時速約6km（約3.3ノット）で北上する水面下物体が形成した明瞭なV字型の<strong>ケルビン波（航跡波）</strong>を観測。<br />
                ・ケルビン波が海面に現れていることから、撮影当時、対象は何らかの理由により一時的に<strong>水深10〜20mの海面直下スレスレまで急浮上</strong>していたと推定される。<br />
                ・水面下に透けて見える影の推定全長は<strong>300〜400メートル</strong>。<br />
                ・なお、撮影から数分後、影は急速に水深800m以深の深海へ潜航し、光学視界から消失した。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 火山活動監視状況図 大画面モーダル */}
      {isChartModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsChartModalOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {chartModalDay === 4
                      ? "海上保安庁 火山活動監視状況図（Day 4：明神礁海底噴火 ＆ 地震観測）"
                      : "海上保安庁 火山活動監視状況図（伊豆・小笠原海嶺 全域）"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {chartModalDay === 5
                      ? "JAPAN COAST GUARD VOLCANIC MONITORING CHART (CHART NO. V-2024 / WGS84) | 富士山連動危機"
                      : chartModalDay === 4
                      ? "JAPAN COAST GUARD VOLCANIC MONITORING CHART (CHART NO. V-2024 / WGS84)"
                      : "JAPAN COAST GUARD - VOLCANIC ACTIVITY MONITORING REPORT (WGS84) | 観測記録海図"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={chartModalDay === 5 ? "/images/eruption_monitoring_chart_day5.svg" : chartModalDay === 4 ? "/images/eruption_monitoring_chart_day4.svg" : "/images/eruption_monitoring_chart.svg"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition border border-slate-700"
                  title="原寸ベクターSVGを別タブで表示"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> 別タブで開く
                </a>
                <button
                  onClick={() => setIsChartModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#081325] flex items-center justify-center p-2 min-h-[420px]">
              <EruptionMonitoringChart day={chartModalDay} className="w-full h-full max-h-[68vh] object-contain select-none" />
            </div>

            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300 space-y-1">
              {chartModalDay === 5 ? (
                <>
                  <div className="flex items-center justify-between font-semibold text-rose-300">
                    <span>【Day 5 観測要綱および富士山連動危機所見】</span>
                    <span className="font-mono text-rose-400 font-bold">駿河トラフ到達まで残り48時間</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    ・<strong>御蔵島沖の噴火（Day 4海底噴火）</strong>：明神礁沖を通過した物体が北上し、御蔵島沖海底カルデラで連動爆発。<br />
                    ・<strong>八丈島への地震波及</strong>：御蔵島沖噴火を震源とするM4.0・震度3の地震を八丈島で観測。<br />
                    ・<strong>富士山直下・深部火山性微動観測</strong>：富士山地下のマグマ網が連動刺激され、深部低周波微動が観測開始。破局噴火までのカウントダウン宣告。
                  </p>
                </>
              ) : chartModalDay === 4 ? (
                <>
                  <div className="flex items-center justify-between font-semibold text-rose-300">
                    <span>【Day 4 観測要綱および噴火連動所見】</span>
                    <span className="font-mono text-cyan-400">連動速度: 時速約6km 北上</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    ・<strong>明神礁の海底噴火（Day 3海底噴火）</strong>：鳥島沖を通過した深海物体が北上を継続し、明神礁の海底カルデラで第3の連動大爆発が発生。他島名と重ならない海図西側に明瞭に記録。<br />
                    ・<strong>青ヶ島・八丈島の火山性地震</strong>：海底噴火に伴い、両島にて有感を含む火山性群発微動（震度1〜2）が観測。島民に不穏な空気が広がる。<br />
                    ・<strong>小笠原救難隊</strong>：現地捜索組は母船とともに父島本島（二見港）へ無事帰還・集結。
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between font-semibold text-rose-300">
                    <span>【噴火日程および連動性観測所見】</span>
                    <span className="font-mono text-cyan-400">移動速度: 時速約6km (日速約150km)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    ・<strong>西之島（Day 1 噴火）</strong>：突発的大規模噴火発生。周辺船舶へ緊急退避命令。<br />
                    ・<strong>鳥島沖（Day 2 噴火）</strong>：鳥島海底カルデラが連動大爆発。噴煙高度数千メートル。<br />
                    ・<strong>北上ベクトル</strong>：西之島から鳥島までの距離は約380km。24時間で正確に到達しており、時速約6km（日速約150km）のペースで深海を北上する物体が、通過した先々の火山を順次爆発させている動かぬ証拠。<br />
                    ・<strong>未噴火警戒域</strong>：北方の青ヶ島、八丈島、三宅島、伊豆大島、富士山方面は現時点で未噴火（残り4日で富士山直下に到達）。
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day 3 作戦海図 W-3100 GM用大画面モーダル */}
      {isTacticalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsTacticalModalOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-950 border border-rose-700 text-rose-400">
                  <ShieldAlert className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    【GM専用 大画面作戦海図 W-3100】全36セクター索敵盤 ＆ 巨大生物潜航マップ（真相）
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    縮尺 1:200,000 / WGS84 ｜ 深度400m潜航座標・三辺測量反響円表示
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/images/day3_sonar_tactical_chart.svg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition border border-slate-700"
                  title="原寸ベクターSVGを別タブで表示"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> 別タブで開く
                </a>
                <button
                  type="button"
                  onClick={() => setIsTacticalModalOpen(false)}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition border border-slate-700"
                  title="閉じる (Escキーでも閉じられます)"
                >
                  <X className="h-4 w-4" /> 閉じる
                </button>
              </div>
            </div>

            <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#07111e] flex items-center justify-center min-h-[460px]">
              <Day3TacticalMap defaultMode="gm" />
            </div>

            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between text-[11px] leading-relaxed">
                <div>
                  <span className="font-bold text-rose-300">【GM真相情報】</span>
                  怪物はセクターB-3（水深400m）。判定: B-3直上=直下捕捉 ｜ B-3隣接=約20km先反響 ｜ 熱水直上(E-2/カルデラ)=探知不能 ｜ 熱水隣接=直下不在確定＆周囲妨害
                </div>
                <div className="font-mono text-cyan-400">
                  1セクター: 約20km四方
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day 1 航海用海図 大画面モーダル（GM・白地図両対応） */}
      {isDay1ModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
          onClick={() => setIsDay1ModalOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    小笠原南西海域 航海用海図（CHART NO. W-2704）
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                      {day1ViewMode === "investigation" ? "白地図（プレイヤー提示用）" : "対策本部解析図（GM用）"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    縮尺 1:50,000 / 緯度1分 = 1海里 (NM) | 中心: 27°04.0&apos;N, 142°06.0&apos;E (SOS地点)
                  </p>
                </div>
              </div>

              {/* モード切り替えタブ ＆ アクション */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setDay1ViewMode("investigation")}
                    className={`flex items-center gap-1 px-3 py-1 rounded font-semibold transition ${
                      day1ViewMode === "investigation"
                        ? "bg-cyan-700 text-white shadow ring-1 ring-cyan-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <EyeOff className="h-3 w-3" /> 白地図（プレイヤー用）
                  </button>
                  <button
                    type="button"
                    onClick={() => setDay1ViewMode("tactical")}
                    className={`flex items-center gap-1 px-3 py-1 rounded font-semibold transition ${
                      day1ViewMode === "tactical"
                        ? "bg-indigo-600 text-white shadow ring-1 ring-indigo-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Eye className="h-3 w-3" /> GM解析図
                  </button>
                </div>

                <a
                  href={
                    day1ViewMode === "investigation"
                      ? "/images/day1_nautical_chart_white.svg"
                      : "/images/day1_nautical_chart_gm.svg"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 transition border border-slate-700"
                  title="別タブで原寸SVGを表示"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> 別タブで開く
                </a>

                <button
                  type="button"
                  onClick={() => setIsDay1ModalOpen(false)}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition border border-slate-700"
                  title="閉じる"
                >
                  <X className="h-4 w-4" /> 閉じる
                </button>
              </div>
            </div>

            {/* モーダルメイン表示部 */}
            <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-[#0f172a] p-2 flex items-center justify-center min-h-[460px]">
              <div className="w-full h-full max-h-[72vh] flex items-center justify-center">
                <Day1NauticalMap
                  mode={day1ViewMode === "investigation" ? "player" : "gm"}
                  className="w-full h-full object-contain select-none"
                />
              </div>
            </div>

            {/* モーダル下部解説 */}
            <div className="mt-3 rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300">
              {day1ViewMode === "investigation" ? (
                <div>
                  <strong className="text-cyan-300 block mb-1">
                    【プレイヤー提示用 白地図】漂流予測パズル作図要領:
                  </strong>
                  <p className="text-[11px] text-slate-300">
                    救難信号発信位置を中心に、北東に父島・南島、東側および南東側に危険な暗礁群が点在。各PCの専門知識（風・海流・潮目・船の姿勢）を合成して自力で作図計算させます（解答非表示）。
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between font-semibold text-amber-300 mb-1">
                    <span>【対策本部解析図（GM用）】漂流予測の正解とベクトル合成:</span>
                    <span className="text-emerald-400 font-bold">⭐ 救助海域: 東北東へ約2.5海里</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    南西強風15m/sによる風圧流（北東へ約1.5kt）＋ 黒潮支流（真東へ2.0kt）＝【東北東へ約2.5kt】。東側・南東側の暗礁群を北側にすり抜け、発信から1時間後の遭難船を救助成功！
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
