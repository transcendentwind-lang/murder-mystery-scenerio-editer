/**
 * MM-Workbench - 初期プロジェクトデータ
 * 汎用的なインシデント対策・非対称情報型ミステリー構造
 */

import { MMProject } from "@/types/schema";

export const initialProject: MMProject = {
  id: "project-deep-sea",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-08T03:00:00.000Z",
  title: "深海からの呼び声",
  subtitle: "合同海難対策本部、7日間の記録",
  concept:
    "現代日本の公的機関・海難救助対策本部を舞台に、日常の海難事故から始まり、海底火山の連続噴火と深海を北上する未確認巨大群体による日本破局噴火の危機へと段階的に侵食されていく、完全協力型インシデント・ミステリー。東京司令部と小笠原現地の非対称な情報（大局的・制度的データ vs 生々しい現場感覚）を融合させて極限の事態に挑むパニックサスペンス。",
  targetExperience:
    "・リモート通信で結ばれた東京司令部（海保・防衛省・気象庁）と小笠原現地（救難艇長・潜水士・海洋生物学者）が、それぞれの専門知見を持ち寄り緊迫した危機を乗り越えるリアルタイム対策本部体験。\n・4段階の開示ロジック（祝詞儀礼の存在 ➔ 海中筒の音響物理 ➔ 古代のイカ塊捕食伝承 ➔ 朝倉ノートのクジラ言語）により、プレイヤー自身の手で謎が必然的に解き明かされていく知的興奮。\n・通常兵器（自衛隊魚雷）単独では再結合を許してしまう絶望に対し、「重魚雷による一口サイズへの粉砕アシスト」×「全海域ソナー網放流とクジラたちのメッセージリレー」×「数百頭のマッコウクジラによる深海大捕食」を組み合わせた前代未聞の深海ハイブリッド作戦で日本を救うカタルシス。\n・6人全員の知見（音響波形、祝詞口伝、古文書、海図、軍事ソナー、生物解剖）が揃わなければ絶対に完成しない完全協力型の情報トランプ構造。",
  plotSummary:
    "【発端】1ヶ月前、小笠原諸島で見られた大規模な流星雨。登場人物全員が現地でその光景を目撃し、東京司令部の司令官（PC1）のみが海岸で小さな隕石の欠片を拾って東京へ持ち帰っていた。同時に小笠原近海の深海熱水噴出孔付近には、海から引き揚げて箱に入れられる程度（重さ約30kg規模）ながら、隕石としては十分に大きな塊が沈んでいた。\n\n【事件（Day 1）】民間チャーター船（40t）が全電源喪失。AIS停波・衛星死角の中、海流（東へ2kt）と南西強風による風圧流（北東へ1.5kt）の合成計算から漂流地点を割り出し、暗礁手前で救助成功。船長『巨大生物を見た』vs 謎のダイバーグループ『魚の調査サンプルだ』と証言が食い違い、ダイバーたちは約30kgのずっしり重いプラスチック製大型冷凍ボックスを持ち去る。\n\n【展開（Day 2〜Day 4）】西之島海底火山の突発的連動噴火。水深800m以深を時速約6km（日速約150km / 3.3ノット）で北上する全長数百mの巨大な影を捕捉。Day 3洋上ソナー索敵作戦（鳥島沖）とヘリ航空偵察により、単一生物ではなく無数の触手が融合した【超巨大群体（コロニー）】と判明。Day 4須美寿島〜青ヶ島沖噴火と八丈島群発微動。日速150kmで北上する火山フロントが数日後に【富士山直下】へ到達し破局的大噴火を誘発する絶対的危機が発覚。謎のダイバーグループの冷凍ボックス（約30kg）の送り先が『静岡県・富士山麓の民家』と特定。小笠原大神宮古文書から、かつて怪異を鎮めた『盟約の祝詞』が存在し、海上で海中筒を用いて海中へ直接唱える作法であることが判明。防衛庁は内閣法制局の壁を突破し、『害獣駆除名目』での自衛隊緊急動員を決定。\n\n【転換と絶望（Day 5）】御蔵島沖噴火に伴い、富士山地下深部で火山性微動が開始。防衛庁は作戦を最高機密指定し情報遮断。八丈島〜御蔵島沖で海自潜水艦の魚雷攻撃が敢行されるも、直撃した群体は泥のように瞬時に再結合し通常兵器が敗北。防衛庁より『通常兵器で倒せないなら、あいつらは一体どうやって一つの個体として統率しているのか』という緊急意見照会が寄せられる。小笠原側では朝倉教授のクジラ音響ノートを発見、ダイオウイカ解剖から視覚退化と側線・音響感覚依存を特定。\n\n【解明と前夜スタンバイ（Day 6）】富士山麓民家への立ち入り捜査で、謎のダイバーグループが深海から引き揚げて箱に入れた【約30kgの海底隕石（隕石としては十分に大きな塊）】の山林極秘搬入が確定。物体は持ち出された隕石を追って直進していた。元神主子どもの口伝から、祝詞の神髄は喉の声ではなく『舌を弾く吸着破裂音（クリック音）』であると判明。朝倉教授のノートから5大コーダ（捕食・危機・位置指示・SOFAR到達距離・YES了解）を解読。6人全員の知見が結集し、『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』の8語合成新言語祝詞が完成。海自全ソナー網（SOSUS）へ信号パケットを装填し、発信系統同期テストを完了して翌朝決戦スタンバイ。\n\n【決戦と解決（Day 7）】怪異が水深600〜1,000m（魚雷有効限界スレスレ）を維持して駿河トラフ境界へ突入、富士山破局噴火まで残り数時間。海自潜水艦部隊が重魚雷一斉飽和攻撃を敢行し、ソナーPing照射アシストとともに巨大群体を一口サイズに粉砕・分断。同時に全海域大出力ソナー網より『人とクジラの約束…』を放流！ 至近海域の1頭のマッコウクジラが【了解】を返して自ら同じ歌を歌いながら北上し、沖合・太平洋全域のクジラたちが次々に了解と歌をリレー（歌のバトン）。太平洋全域から駿河トラフ水深1,000mへ突入した数百頭のマッコウクジラ群が、散り散りになった怪異を片っ端から噛み砕き貪り喰らい尽くし、完全消滅させた！",
  gimmickOverview:
    "① 生態系の天敵（マッコウクジラ vs ダイオウイカ）を怪異撃退に転用する生物学的逆転の発想。\n② 海自重魚雷による一口サイズへの粉砕アシスト × クジラ大群による深海完全捕食のハイブリッド殲滅作戦。\n③ 動物言語学（単語連結モデル）に基づき、祝詞の吸着破裂音（舌クリック音）とマッコウクジラのコーダを融合させた8語シーケンス暗号パズル（『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』）。\n④ 竹の海中筒による音響インピーダンス整合の歴史的伝承を、現代の海上自衛隊メガワット級大出力アクティブソナー網（SOSUS）へと昇華させる科学的スケール感。\n⑤ クジラたちのメッセージリレー（歌のバトン）：海自放流 ➔ 至近のクジラ了解 ➔ 自ら歌い北上 ➔ 沖合のクジラへリレー ➔ 太平洋全域合唱エコー ➔ 駿河トラフ大集結の空間音響ドラマ。\n⑥ 6人全員の非対称情報（東京の制度・持ち帰られた隕石片・軍事ソナー網 vs 現地の海図・古文書・生物標本・音響ノート・古謡）が不可欠な完全協力型の情報トランプ構造。",
  playerCount: 6,
  durationHours: 3.5,
  hasGm: true,

  characters: [
    {
      id: "pc-1",
      name: "PC1: 危機管理官",
      profession: "海上保安庁 危機管理官（東京本庁・対策本部司令官）",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "headquarters",
      introduction:
        "あなたは東京本庁の危機管理官であり、合同対策本部の司令官である。突如小笠原南方で発生した民間船の全電源喪失事故を受け、現地との合同対策本部を開設した。1ヶ月前の小笠原出張中、現地メンバーとともに流星雨を目撃し、メンバーの中で唯一、海岸で拾った黒い小さな隕石の欠片を東京へ持ち帰り、執務室の机の奥に大切にしまっている。",
      initialItems: [
        "黒い小さな隕石の欠片（1ヶ月前に小笠原で唯一拾得・東京へ持ち帰り）",
        "公用暗号通信端末",
        "遭難船登録スペック表（40tプレジャー調査船型 / 風圧流リーウェイ率3〜4%）",
      ],
      capabilities: [
        {
          id: "cap-1-0",
          name: "船型スペック・風圧流（リーウェイ）特性の提示",
          description: "キャビンが高く風を受けやすい船型であり、風速の約3〜4%（約1.5ノット）で風下へ吹き流される計算を提示する。",
          targetPhase: 1,
        },
        {
          id: "cap-1-1",
          name: "防衛省・関係省庁への緊急要請",
          description: "上層部および防衛省へ働きかけ、護衛艦・潜水艦の派遣要請手続きを実行する。",
          targetPhase: 4,
        },
        {
          id: "cap-1-2",
          name: "情報統制・極秘公安照会",
          description: "救助された謎のダイバーグループの身元および国内移送先の貨物追跡を極秘裏に行う。",
          targetPhase: 4,
          unlockedEvidenceIds: ["ev-cult-cargo"],
        },
        {
          id: "cap-1-3",
          name: "最高機密ソナー網の開放決断",
          description: "上層部の隠蔽命令に抗い、全責任を負って大出力海底ソナー網の軍事機密開放を承認する。",
          targetPhase: 6,
        },
      ],
      handout: {
        publicProfile: "東京司令部の総指揮官。冷静沈着で公的機関の連携を統制する。",
        secretObjective: "国民のパニックを防ぎつつ、現場の命を最優先に事態を完全終息させる。",
        internalDrama: {
          pride: "国家と市民の安全を守る危機管理の最高責任者としての誇り",
          guilt: "政府上層部から下された『事実の完全隠蔽命令』を現場に課すことへの激しい葛藤",
          loss: "過去の災害対応で救えなかった現場職員への悔恨",
        },
        backgroundTimeline: "Day 1 遭難警報受信。現地との緊急回線を開設し、漂流位置の特定を指揮……",
        handoutBody:
          "国民をパニックに陥れるわけにはいかない。だが、現場を見捨てることも絶対にできない。あなたの手元には、遭難船の船型スペックがある。キャビンが高く風を強く受ける構造のため、風速の約3〜4%（約1.5ノット）で風下へ押し流される特性（リーウェイ）がある。現場の風と海流を合成しなければ現在地は分からない……",
      },
    },
    {
      id: "pc-2",
      name: "PC2: 情報通信・音響分析官",
      profession: "情報通信・音響分析官（防衛省リエゾン）",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "headquarters",
      introduction:
        "あなたは海保と防衛省を繋ぐリエゾンであり、衛星通信・深海ソナー解析のスペシャリストである。1ヶ月前の小笠原出張時に全メンバーとともに流星雨を目撃し、その際に司令官（PC1）が拾って東京へ持ち帰った小さな隕石片から微弱な磁気・周波数ノイズが発せられているのを測定した記憶がある。冒頭で衛星画像やAISが使えない現実的な理由を説明する。",
      initialItems: [
        "周波数スペクトログラム解析端末",
        "気象衛星ひまわり海上風速データ（南西風15m/s）",
        "衛星捜索制約レポート",
      ],
      capabilities: [
        {
          id: "cap-2-0",
          name: "衛星・AIS使用不能の論理的説明と強風データの提示",
          description: "ひまわりの解像度限界、低軌道衛星の通過時間、全電源喪失によるAIS停波を説明し、南西風15m/s（約30ノット）による北東への吹き流しデータを提示する。",
          targetPhase: 1,
        },
        {
          id: "cap-2-1",
          name: "広域深海ソナー走査",
          description: "深海を時速約6kmで北上する未確認巨大物体の低周波シグネチャーを捕捉する。",
          targetPhase: 2,
          unlockedEvidenceIds: ["ev-sonar-shadow"],
        },
        {
          id: "cap-2-2",
          name: "音声パルス波形解析",
          description: "持ち込まれた深海音声からクリック音（コーダ）の周波数とミリ秒単位の間隔を抽出する。",
          targetPhase: 6,
          unlockedEvidenceIds: ["ev-coda-spectrogram"],
        },
        {
          id: "cap-2-3",
          name: "大出力海底ソナー網一斉放流",
          description: "合成されたメッセージを全太平洋海域へ向け最大出力で送信する。",
          targetPhase: 7,
        },
      ],
      handout: {
        publicProfile: "通信・音響データの分析責任者。あらゆる計器の異常を数値化する。",
        secretObjective: "深海の巨大物体の物理的実態を暴き、音響による唯一の対抗策を成功させる。",
        internalDrama: {
          pride: "音響データは嘘をつかないという技術者としての絶対的自負",
          guilt: "防衛省の最高機密ソナー網に裏口アクセスを持っていることへの罪悪感",
          loss: "かつて自らが設計した音響探知の遅れで失われた潜水艇の記憶",
        },
        backgroundTimeline: "Day 1 衛星・AISが使えない理由を説明し、衛星風速計から強風データを割り出す……",
        handoutBody:
          "「司令、気象衛星ひまわりでは解像度不足で20mの船は映りません。低軌道偵察衛星が上空を通過するのは4時間後、しかも雨雲で海面は見通せません。遭難船のAIS（位置発信機）も全電源喪失で停波中です！」あなたの衛星風速計によると、現場海域には秒速15m（約30ノット）の強い南西風が吹いており、船を北東方向へ時速約1.5ノットで吹き飛ばしている……",
      },
    },

    {
      id: "pc-3",
      name: "PC3: 救難艇船長",
      profession: "小笠原救難艇船長（民間海洋ガイド）",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "field",
      introduction:
        "あなたは小笠原の海を知り尽くしたベテラン漁師・ガイドであり、民間救難隊の現場リーダーである。1ヶ月前、島で他のメンバーとともに夜空を焦がすような流星雨を目撃した。現地の海のクセと暗礁位置を熟知している。",
      initialItems: ["救難艇の操舵キー", "航海安全の木札", "小笠原南西海域・暗礁分布海図"],
      capabilities: [
        {
          id: "cap-3-1",
          name: "荒天緊急出航・漂流海域への急行接舷",
          description: "海流と風向から導き出した東北東の漂流予測海域へ急行し、暗礁手前で遭難船に接舷して救出する。",
          targetPhase: 1,
          unlockedEvidenceIds: ["ev-diver-box-photo"],
        },
        {
          id: "cap-3-2",
          name: "島民避難・民間船動員",
          description: "海底火山の活発化に伴い、島民避難船の確保と海域警備を主導する。",
          targetPhase: 3,
        },
        {
          id: "cap-3-3",
          name: "小笠原古謡（捕鯨唄）の想起",
          description: "祖父から教わった古い唄のリズムから、獲物を示す拍子を思い出す。",
          targetPhase: 6,
          unlockedEvidenceIds: ["ev-folk-song-rhythm"],
        },
      ],
      handout: {
        publicProfile: "現地の海を誰よりも熟知する海の男。現場の救助活動を一手に担う。",
        secretObjective: "島民と海に出た仲間を誰一人死なせず、全員を生きて本土へ帰す。",
        internalDrama: {
          pride: "どんな荒波からも人命を救い出してきた現場の海の男としての誇り",
          guilt: "Day 1で救助時、怪しいダイバーたちと大型冷凍ボックスの島外離脱を止められなかった悔恨",
          loss: "かつての海難事故で海に沈んだ幼馴染への弔い",
        },
        backgroundTimeline: "Day 1 メーデーを受信し救難艇を出航。海流と風の計算から東北東の漂流海域へ急行し救助成功……",
        handoutBody:
          "「風だけ見て北東に行くと見失うぞ！水面下の潮に引っ張られてるはずだ。東側や南東側には危険な暗礁群があり、風浪の三角波でそこへ突っ込んだら船は座礁沈没する。風と海流が合わさる東北東の海域で、暗礁の手前に回り込んで抑えなきゃならねぇ！」",
      },
    },
    // PC4: 純粋な海洋・気象観測員（6人プレイ本編用）
    {
      id: "pc-4",
      name: "PC4: 海洋・気象観測員",
      profession: "気象庁 小笠原観測所 職員",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "field",
      introduction:
        "あなたは気象・海洋・火山観測の専門員である。1ヶ月前、小笠原の夜空を焦がした流星雨を観測所で目撃し、近海に落下した隕石の衝撃波・地質観測ログを記録している。海洋ブイからリアルタイムの表層海流データを取得・分析する。",
      initialItems: [
        "地質・気象観測コンソール端末",
        "1ヶ月前の流星雨・落下地質観測ログ",
        "海洋ブイ表層流速データ（黒潮支流：真東へ2.0ノット）",
      ],
      capabilities: [
        {
          id: "cap-4-0",
          name: "海洋ブイ表層海流（真東2.0ノット）の提示",
          description: "現場海域の黒潮支流が真東へ2.0ノットで流れている実測値を全員に共有する。",
          targetPhase: 1,
        },
        {
          id: "cap-4-1",
          name: "海底火山連動シミュレーション",
          description: "海底火山の噴火データから、物体の時速約6kmでの北上ペースを割り出す。",
          targetPhase: 2,
          unlockedEvidenceIds: ["ev-volcano-chain-log"],
        },
        {
          id: "cap-4-2",
          name: "破局噴火タイムリミット算出",
          description: "本土直下のマグマ溜まりへの到達時間（残り48時間）を確定させる。",
          targetPhase: 5,
          unlockedEvidenceIds: ["ev-eruption-countdown"],
        },
        {
          id: "cap-4-3",
          name: "深海水温・音速伝播補正",
          description: "水温・塩分データからソナー音速を補正し、触手群体のノイズ周波数を同定する。",
          targetPhase: 6,
        },
      ],
      handout: {
        publicProfile: "科学的データと数値を冷静に分析する観測員。感情に流されない判断を下す。",
        secretObjective: "正確なデータを提示し続け、破局噴火の発生時刻までに回避策を実行させる。",
        internalDrama: {
          pride: "正確な気象・地質予報で人命を守る科学者としての矜持",
          guilt: "最悪のカウントダウンを告げることで仲間を絶望に突き落とす苦悩",
          loss: "過去の火山噴火予報の遅れで故郷を失った記憶",
        },
        backgroundTimeline: "Day 1 局地的な表層海流データを分析。遭難船の漂流先特定に貢献……",
        handoutBody:
          "「小笠原観測所のリアルタイム海洋ブイデータです。現場海域の黒潮支流は、風とは異なり【真東へ流速2.0ノット】で流れています！つまり、海流の力だけで1時間に真東へ2.0海里押し流されている計算になります！」",
      },
    },
    {
      id: "pc-5",
      name: "PC5: 海洋生物学者",
      profession: "海洋生物研究所 准教授",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "field",
      introduction:
        "あなたは現地研究所の准教授であり、かつて『クジラ言語』を提唱して学会を追われた故・朝倉名誉教授の唯一の直弟子である。1ヶ月前、小笠原の海に降り注いだ異様な流星雨を目撃している。恩師の遺品である解析ノートと未発表録音テープを保管し、水温データから潮目の位置を正確に把握する。",
      initialItems: [
        "故・朝倉教授の研究ノート",
        "未発表海中録音テープ",
        "潮目（冷水塊境界）水温解析図",
      ],
      capabilities: [
        {
          id: "cap-5-0",
          name: "潮目境界の同定と海流減衰なしの証明",
          description: "現場海域に走る潮目により、船が本流に乗って東向きの海流2.0ノットを減衰なく受け続けていることを証明する。",
          targetPhase: 1,
        },
        {
          id: "cap-5-1",
          name: "ダイオウイカ異常生態鑑定",
          description: "船長の目撃した触手の特徴から、通常種を超える異常成長の可能性を考察する。",
          targetPhase: 1,
          unlockedEvidenceIds: ["ev-captain-testimony"],
        },
        {
          id: "cap-5-2",
          name: "超群体（コロニー）構造の看破",
          description: "通常兵器が効かない理由が『無数の個体が結合した群体』であることを看破する。",
          targetPhase: 5,
        },
        {
          id: "cap-5-3",
          name: "クジラ言語・単語波形の提供",
          description: "恩師のノートから『自分』『集まれ』のクリック音パターンを提示する。",
          targetPhase: 6,
          unlockedEvidenceIds: ["ev-asakura-notes"],
        },
      ],
      handout: {
        publicProfile: "深海生物のスペシャリスト。学会の異端児とされた恩師の研究を継ぐ。",
        secretObjective: "恩師のクジラ言語仮説の正しさを証明し、怪異を生物学的捕食で鎮める。",
        internalDrama: {
          pride: "真の海洋生態系を理解しているという研究者としてのプライド",
          guilt: "生前の恩師を世間の冷笑から庇い切れなかった後悔",
          loss: "孤独のうちに客死した恩師の存在そのもの",
        },
        backgroundTimeline: "Day 1 潮目の水温解析を行い、遭難船にかかる海流の減衰がないことを証明……",
        handoutBody:
          "「水温データから潮目の位置を割り出しました。現場海域には冷水塊との明瞭な潮目が通っており、船はその本流に乗っています。真東への海流の力（2.0ノット）は途切れることなくそのまま働いています！」",
      },
    },
    {
      id: "pc-6",
      name: "PC6: 救護班チーフ",
      profession: "現地救護ボランティア（島の旧家・神職）",
      roleType: "investigator",
      isCulpritCandidate: false,
      location: "field",
      introduction:
        "あなたは島の神社の家系であり、海難救助隊の救護チーフである。1ヶ月前、島の夜空を引き裂いて海に落ちた不吉な流星雨を境内から目撃し、古い伝承との符合に胸騒ぎを覚えている。救難信号途絶直前の最後の微弱な無線ログを管理している。",
      initialItems: [
        "神社の古い木札",
        "救護医療キット",
        "途絶直前のアナログ無線音声ログ",
      ],
      capabilities: [
        {
          id: "cap-6-0",
          name: "救難無線断片ログの共有",
          description: "途絶直前の船長の声『風で舵が効かない！真横から波を受けている！』を共有し、風と海流の双方を受けている事実を提示する。",
          targetPhase: 1,
          unlockedEvidenceIds: ["ev-radio-fragment"],
        },
        {
          id: "cap-6-1",
          name: "救護所での事情聴取",
          description: "救護した船長から『クジラとは異なる異常な挙動とスクリューの巻き付き故障』の証言を引き出す。",
          targetPhase: 1,
        },
        {
          id: "cap-6-2",
          name: "土蔵の古文書捜索",
          description: "先祖が遺した太古の魔物退治の古文書（祝詞）を発見する。",
          targetPhase: 6,
          unlockedEvidenceIds: ["ev-ancient-shrine-scroll"],
        },
        {
          id: "cap-6-3",
          name: "祝詞の拍子（文法ルール）詠唱",
          description: "古文書に記された点刻記号が『単語を並べる語順』であることを解き明かす。",
          targetPhase: 6,
        },
      ],
      handout: {
        publicProfile: "温和で献身的な救護担当。島の伝統や神事にも詳しい。",
        secretObjective: "島の信仰と祖先の知恵を信じ、現代科学と手を取り合って災厄を鎮める。",
        internalDrama: {
          pride: "何百年も島を守り祈り続けてきた社家としての責任感",
          guilt: "怪異の出現を単なる自然現象や錯覚として見過ごしかけた自責",
          loss: "近代化の中で失われていった島の神話や古い記憶",
        },
        backgroundTimeline: "Day 1 途絶直前の無線音声を解析し、救助後は船長の応急処置を担当……",
        handoutBody:
          "「救護本部で受信した、途絶直前の最後の微弱な無線記録です！『風で舵が効かない！真横から波（海流）を受けている！』という船長の悲鳴が残っています。船は風に煽られながら、真横から海流をまともに受けて漂流を始めた証拠です！」",
      },
    },
  ],

  evidences: [
    {
      id: "ev-drift-map",
      title: "小笠原南西海域 海図（漂流予測マップ）",
      description: "救難信号発信地点を中心とし、北東に父島・南島、東側および南東側に暗礁群が記載された航海用海図。白地図には父島・南島と遭難位置、暗礁記号のみが示されており、漂流予測位置はプレイヤーたちが各自の情報を持ち寄って白地図上で作図・計算する必要がある（計1時間の漂流）。",
      ownerId: "all",
      foundPhase: 1,
      visibility: "public",
      category: "document",
      acquisitionCondition: "Day 1: 合同救難ミーティング開始時に全体提示",
    },
    {
      id: "ev-satellite-blindspot",
      title: "気象・軌道衛星 状況報告書",
      description: "静止気象衛星『ひまわり』は広域用のため解像度不足で小型船（40t）は視認不可。低軌道偵察衛星は軌道通過まで4時間＋濃密な雨雲で光学視界ゼロ。全電源喪失でAISも停波しており、衛星頼みの捜索は不可能と断定。",
      ownerId: "pc-2",
      foundPhase: 1,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 1: PC2による衛星・探査システム照会時",
    },
    {
      id: "ev-radio-fragment",
      title: "途絶直前のアナログ無線音声ログ",
      description: "救難信号途絶直前に救護班が受信したノイズ混じりの微弱音声。『メーデー！メーデー！風で舵が効かない！真横から波（海流）を受けている！計器が全部――（激しいノイズで途絶）』。風と海流の双方を強く受けている事実を示す。",
      ownerId: "pc-6",
      foundPhase: 1,
      visibility: "shareable",
      category: "audio",
      acquisitionCondition: "Day 1: PC6による救難無線ログ共有時",
    },
    {
      id: "ev-diver-box-photo",
      title: "謎のダイバーグループが抱えていた大型冷凍ボックス",
      description: "救助された謎のダイバーグループが船から持ち出した、魚釣り用の少し大型のプラスチック製冷凍ボックス（クーラーボックス）。『近辺での魚の生態調査で採集した魚が入っている。大変だったがこれで目的のものが収集できたので、これ以上は迷惑をかけない』と言い残し、直後に定期便で島外へ搬出された。海から引き揚げて箱に入れられるサイズだが、重さ約30kgほどのずっしりとした異常な重量感があった。",
      ownerId: "pc-3",
      foundPhase: 1,
      visibility: "shareable",
      category: "sample",
      acquisitionCondition: "Day 1: 遭難船救助オペレーション成功時",
    },
    {
      id: "ev-captain-testimony",
      title: "遭難船船長の証言記録",
      description: "『あれはクジラなんかじゃないと思うねぇ。クジラなら潮吹きや潜水の際の尾が見えたりという行動があるもんだけど、そんな様子はなかった。船はスクリューが何かに巻き付かれたように故障して、計器類も壊れてしまったんだ。とにかく助かってよかった。ダイバーたちはこの1ヶ月前ぐらいから頻繁にダイブを繰り返していて、だいぶ慣れた様子だった。あのあとすぐに帰ると言っていたよ。ちょっと神社にお参りしてくるようにするよ』という船長の証言記録。",
      ownerId: "pc-6",
      foundPhase: 1,
      visibility: "shareable",
      category: "testimony",
      acquisitionCondition: "Day 1: 救護所での事情聴取時",
    },
    {
      id: "ev-sonar-shadow",
      title: "防衛省・低周波ソナー探知記録（深海巨大影）",
      description: "水深800m以深を、時速約6km（日速約150km / 約3.3ノット）の一定ペースで北上する全長数百メートルの巨大な音響シグネチャー。通常潜水艦の数倍の規模。",
      ownerId: "pc-2",
      foundPhase: 2,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 2: 東京側アクション【T-1】実行時",
    },
    {
      id: "ev-evacuation-radio-log",
      title: "西之島避難船舶の遭難・通信傍受ログ",
      description: "西之島周辺から退避中の全船舶の交信ログ。『噴火の数分前、船底を巨大な黒い影が通過した。直後に計器異常が起き、海底が大爆発した』と複数船舶が報告しており、影の通過が噴火より先だった時系列を示す。",
      ownerId: "pc-1",
      foundPhase: 2,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 2: 東京側アクション【T-2】実行時",
    },
    {
      id: "ev-aerial-recon-report",
      title: "海上保安庁 航空機捜索報告書（空撮写真付き）",
      description: "羽田航空基地の固定翼機MA722による西之島周辺の緊急偵察レポート。海底火山の熱水を避けるため一時的に海面直下スレスレ（水深10〜20m）に急浮上した全長300〜400mの巨大な影とケルビン波を撮影。撮影数分後に深海（水深800m以深）へ急速潜航した。",
      ownerId: "pc-1",
      foundPhase: 2,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 2: 東京側アクション【T-3】実行時",
    },
    {
      id: "ev-propeller-tissue",
      title: "遭難船スクリュー付着組織の鑑定報告書",
      description: "Day 1の遭難船スクリューに巻きついていた肉片の生体組織鑑定結果。巨大な吸盤と筋肉組織から、水深600m以深の『ダイオウイカの触手』と特定。Day 1で船を襲いスクリューを止めた元凶が判明した。",
      ownerId: "pc-5",
      foundPhase: 2,
      visibility: "shareable",
      category: "sample",
      acquisitionCondition: "Day 2: 小笠原側アクション【F-1】実行時",
    },
    {
      id: "ev-fisherman-guide-testimony",
      title: "避難漁船・ホエールウォッチング船長の目撃調書",
      description: "『大きさはクジラよりも明らかに巨大だが、クジラ特有の潮吹き（ブロー）やスパイホップを一切しない。海面直下をぬめるように這って北上していった』というベテラン漁師・ガイドの証言調書。",
      ownerId: "pc-3",
      foundPhase: 2,
      visibility: "shareable",
      category: "testimony",
      acquisitionCondition: "Day 2: 小笠原側アクション【F-2】実行時",
    },
    {
      id: "ev-diver-trauma-record",
      title: "緊急浮上ダイバーの救護聴取カルテ",
      description: "『海中でクジラではありえない異形を目撃した。直後、海底の奥底から奇妙な振動が響いてきて恐怖で急速浮上した。船に引き上げられた数分後に、海底火山の大噴火が起きた』という潜水士の生々しい時系列証言。",
      ownerId: "pc-6",
      foundPhase: 2,
      visibility: "shareable",
      category: "testimony",
      acquisitionCondition: "Day 2: 小笠原側アクション【F-3】実行時",
    },
    {
      id: "ev-moving-epicenter",
      title: "海底地震計・移動震源解析シート",
      description: "西之島周辺の海底微動データ。通常の火山性微動の前に、『海底800mを時速約6kmで移動する局所的な震源（移動震源）』が西之島直下を通過した波形を特定。通過直後にマグマ溜まりが刺激され噴火した事実を裏付ける。",
      ownerId: "pc-4",
      foundPhase: 2,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 2: 小笠原側アクション【F-4】実行時",
    },
    {
      id: "ev-volcano-chain-log",
      title: "海底火山連動噴火データシート",
      description: "物体の北上ルートに沿って、西之島〜鳥島周辺の海底火山の地殻活動が連動して急激に活性化している記録。",
      ownerId: "pc-4",
      foundPhase: 2,
      visibility: "public",
      category: "data",
    },
    {
      id: "ev-tokyo-meteorite-analysis",
      title: "司令官持ち帰り隕石片『特異結晶構造 ＆ 残留磁気分析調書』",
      description: "1ヶ月前の流星雨の際、司令官（PC1）が唯一小笠原の海岸で拾い、東京へ持ち帰っていた小さな隕石片の精密スペクトル分析。地球外由来の特異な結晶構造と微弱な残留磁気が確認され、小笠原近海に落下した流星群と同根であることが判明。500km以上離れた距離からこの小片が直接生物を遠隔誘引することは物理的に考えにくいものの、怪物の北上ルートと隕石の移動方向が符合しており、『怪異が何らかの理由で隕石の痕跡や本体を追っているのではないか』という可能性が浮上する。",
      ownerId: "pc-1",
      foundPhase: 4,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 4: 東京側アクション【T-4A】実行時",
    },
    {
      id: "ev-hachijo-tremor-analysis",
      title: "八丈島測候所『火山性群発微動の波形解析調書（富士山到達リスク）』",
      description: "八丈島および青ヶ島で観測された震度1〜2の群発微動データ。通常の断層破壊とは異なり、深度10kmのマグマ溜まりを刺激しながら時速約6km（日速約150km）で正確に北上する熱源の軌道を特定。このまま進めば伊豆諸島を経て【富士山直下】に到達し、連動大噴火を誘発する壊滅的危機を裏付ける。",
      ownerId: "pc-2",
      foundPhase: 4,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 4: 東京側アクション【T-4B】実行時",
    },
    {
      id: "ev-hachijo-resident-and-sonar",
      title: "八丈島住民証言調書 ＆ 近海漁船アクティブソナー（魚探）捕捉記録",
      description: "八丈島底土港の避難住民による『南の海が白波立ち、沖合から地響きが止まらない』という証言調書。さらに八丈島南方沖で操業していた一本釣り漁船のアクティブソナー（魚探）が、水深500mを時速約6kmで北上する全長数百mの巨大反射体を捉えた民間観測データ。",
      ownerId: "pc-2",
      foundPhase: 4,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 4: 東京側アクション【T-4C】実行時",
    },
    {
      id: "ev-ogasawara-meteorite-analysis",
      title: "小笠原観測所『1ヶ月前流星雨の落下地質記録 ＆ 深海熱水鉱床親和性分析』",
      description: "1ヶ月前に全員が目撃した流星雨の際、小笠原気象観測所に記録された落下衝撃データと採取微粒子のスペクトル解析。深海熱水噴出孔のレアメタル鉱物と極めて類似した特異な元素組成を持ち、司令官（PC1）が東京へ持ち帰った破片と同根であることが判明。さらに衝撃波の解析から、父島南西沖の海底に【重さ約30kg規模のまとまった隕石塊（海から引き揚げ可能なサイズだが隕石としては十分に大きな塊）】が沈んでいた計算結果が導き出される。",
      ownerId: "pc-4",
      foundPhase: 4,
      visibility: "shareable",
      category: "sample",
      acquisitionCondition: "Day 4: 小笠原側アクション【F-4A】実行時",
    },
    {
      id: "ev-shrine-curse-stone",
      title: "神社宝物殿 古記録『海鳴りの神石と盟約祝詞の記録』",
      description: "小笠原大神宮の宝物殿で発掘された古記録。太古に海鳴りの怪異を鎮めた『盟約の祝詞』が存在したことが判明。しかし祝詞の文面は秘伝のため記録になく、数年前に元神主が死去。その内容を知る子ども達は【東京に出てしまっている】ため、東京側との協力が不可欠となる。また、祝詞を唱える作法は『船で海へ漕ぎ出し、海中に長い筒を差し入れて読み上げる』という海中音波伝達の儀礼であることが記されている。",
      ownerId: "pc-6",
      foundPhase: 4,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 4: 小笠原側アクション【F-4B】実行時",
    },
    {
      id: "ev-diver-shipping-waybill",
      title: "二見港定期船『謎のダイバーグループの大型冷凍ボックス貨物輸送伝票』",
      description: "Day 1で救助された謎のダイバーグループが船から持ち出し、島外へ送った大型冷凍ボックス（重量約30kg）の貨物輸送伝票の控え。送り先は『静岡県・富士山麓の民家』宛てとなっており、彼らが深海から引き揚げて箱に入れた約30kgの物体が本土・富士山麓の個人宅へ送られていた動かぬ証拠。研究所ではなく普通の民家に何故送られたのかという謎が深まる。",
      ownerId: "pc-3",
      foundPhase: 4,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 4: 小笠原側アクション【F-4C】実行時",
    },
    {
      id: "ev-photo-deep-analysis",
      title: "Day 3洋上ソナー写真『深層デジタル画像解析報告書』",
      description: "Day 3索敵作戦で得られた写真の深層デジタル画像解析。撮影された黒い巨影は単一体ではなく、無数の深海生物や触手が絡み合い結合した【超巨大群体（コロニー）】である事実を突き止めた報告書。洋上写真の外形からはその詳細な体内構造や感覚機能までは窺い知れないものの、単一の通常生物の枠を超えた異形の群体構造が浮き彫りになる。",
      ownerId: "pc-5",
      foundPhase: 4,
      visibility: "shareable",
      category: "data",
      acquisitionCondition: "Day 4: 小笠原側アクション【F-4D】実行時",
    },
    {
      id: "ev-cult-cargo",
      title: "富士山麓・民家極秘貨物追跡レポート（約30kgの海底隕石の山林搬入）",
      description: "Day 1で謎のダイバーグループが運んだ大型冷凍ボックスは、静岡県・富士山麓の民家を経由して富士山樹海・山林深くへ極秘搬入されていた。中身は彼らが深海から引き揚げて箱に収めた【重さ約30kgの海底隕石（人間が引き揚げて箱に入れられるサイズだが、隕石としては十分に大きな塊）】。怪異が富士山を目指す真の動機（海底から持ち出された約30kgの隕石塊への追跡・接近）が確定する。",
      ownerId: "pc-1",
      foundPhase: 5,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 5〜Day 6: 東京側アクション【T-5A】実行時",
    },
    {
      id: "ev-shrine-lineage",
      title: "都内在住・元神主の子どもの口伝証言録（祝詞の作法と点刻記号）",
      description: "都内で特定された元神主の子どもの証言録。『亡き父は生前、祝詞は日本語を声高く読むのではなく、口蓋を鳴らしてクリック音を海中筒へ通すことこそが真の祈りだと語っていた』という決定的な口伝の記憶。宝物殿の古文書にある点刻記号と完全に一致する。",
      ownerId: "pc-2",
      foundPhase: 5,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 5〜Day 6: 東京側アクション【T-5B】実行時",
    },
    {
      id: "ev-eruption-countdown",
      title: "破局噴火タイムリミット算出グラフ",
      description: "物体が駿河トラフ直下のマグマ溜まりに到達するまでの猶予時間はあと48時間。到達すれば連動して富士山が破局噴火を起こす。",
      ownerId: "pc-4",
      foundPhase: 5,
      visibility: "public",
      category: "data",
    },
    {
      id: "ev-asakura-notes-bio",
      title: "故・朝倉教授の研究ノート【第1部：マッコウクジラの潜水と深海捕食生態】",
      description: "『マッコウクジラは深海1,000〜2,000m以深へ潜水できる唯一の大型鯨類である。筋肉中の高濃度ミオグロビンに大量の酸素を貯蔵でき、深海でダイオウイカなどの大型頭足類を好んで捕食する』という生態学的事実が記された研究ノート。クジラが深海でイカを主食とすることを証明する基礎資料。",
      ownerId: "pc-5",
      foundPhase: 4,
      visibility: "shareable",
      category: "document",
      acquisitionCondition: "Day 3〜Day 5: 小笠原側アクション【F-5A】等で調査可能",
    },
    {
      id: "ev-ancient-shrine-scroll",
      title: "神社の古文書（太古の盟約祝詞と海底火山・巨大イカ捕食の記録）",
      description: "太古の記録が記された古文書：①海底火山の噴火や海の魔物が現れしとき、神職は小舟で海へ出て祝詞を水底へ奏上する儀礼、②神社に残る祝詞と海中筒の作法、③『海より出でし触手の魔物は、天より落ちたる星の石（隕石）を貪り集め、その熱気をもて水底の火の山（海底火山）を目覚めさせんとする』という怪異の目的、④『島人は祝詞をもって鯨の群れを呼び寄せ、巨大なる烏賊（イカ）の如き魔物の塊りを貪り喰らわせ海を鎮めた』という過去の解決史、⑤『祝詞の日本語そのものに験があるにあらず、舌を弾く神音（クリック音）を海中筒から放つことこそが本体』という真実が網羅されている。",
      ownerId: "pc-6",
      foundPhase: 6,
      visibility: "shareable",
      category: "document",
    },
    {
      id: "ev-asakura-notes",
      title: "故・朝倉教授の研究ノート【第2部：クジラ言語の文法構造仮説】",
      description: "マッコウクジラが深海で用いるクリック音列（コーダ）は単なるエコーロケーションではなく、クリック間隔（ICI）と打数を組み合わせた文法構造を持つ言語体系であるという未発表論文ドラフト。『自分（均等3連打）』『集まれ（加速4連打）』の解析モデルと、人間の舌クリック音との親和性。",
      ownerId: "pc-5",
      foundPhase: 5,
      visibility: "shareable",
      category: "document",
    },
    {
      id: "ev-asakura-notes-records",
      title: "故・朝倉教授の海洋音響調査実録テープ ＆ 行動対応ログ（5大コーダ）",
      description: "朝倉教授が小笠原海溝で録音した実音響テープと行動ログ：①仲間で捕食する時のクリック音（高速バースト）、②マッコウクジラにとっての危機がある場合のクリック音（低音長間隔）、③仲間に餌や危険の位置を教える場合のクリック音（指向性位置伝達）、④海中音響チャンネル（SOFAR）を通じ数十〜数百km先まで届く到達距離データ、⑤仲間からの『YES（肯定・了解）』の応答クリック音。この音響と行動記録により、人間側からクジラ言語で働きかける具体的作戦が成立する。",
      ownerId: "pc-5",
      foundPhase: 6,
      visibility: "shareable",
      category: "audio",
    },
    {
      id: "ev-folk-song-rhythm",
      title: "小笠原古謡（捕鯨唄）の口伝メモ",
      description: "島の古い漁師唄の拍子の中に、かつて島人が海へ向かって舌を鳴らしていた『餌（極上の獲物・捕食せよ）』の急速クリックリズムがそのまま口伝で残されていたメモ。",
      ownerId: "pc-3",
      foundPhase: 6,
      visibility: "shareable",
      category: "audio",
    },
    {
      id: "ev-coda-spectrogram",
      title: "実音響スペクトログラム波形シート",
      description: "恩師のテープから抽出されたクジラのクリック音と、祝詞の舌クリック音を重ね合わせた音響シート。海自ソナーから太平洋全域へ放流可能な【人工クジラ語メッセージ（新しい言語）】の合成プロトコルデータ。",
      ownerId: "pc-2",
      foundPhase: 6,
      visibility: "public",
      category: "data",
    },
  ],

  timeline: [
    {
      dayNumber: 1,
      locationName: "父島南西沖 (0 km)",
      distanceKm: 0,
      situationTitle: "荒海からのメーデー・漂流予測と遭難船救助",
      incidentOverview: "民間チャーター船（40t）が突如全電源喪失。AIS停波、衛星観測不能の中、発信から1時間後の漂流地点を海流と強風のベクトル合成から特定し、暗礁手前で救助する。",
      hqResponse: "衛星死角の報告と航法計算支援。南西強風（15m/s）による風圧流（北東へ約1.5kt）と黒潮支流（真東へ2.0kt）の合成計算を実施。",
      fieldResponse: "PC3の救難艇が暗礁群の手前、東北東の【漂流予測海域】へ急行。荒波の中で接舷し、船長と謎のダイバーグループを救出成功。ダイバーたちは魚の調査サンプルと称して、約30kgの重量がある大型プラスチック冷凍ボックスを持ち去る。",
      revealedEvidenceIds: [
        "ev-drift-map",
        "ev-satellite-blindspot",
        "ev-radio-fragment",
        "ev-diver-box-photo",
        "ev-captain-testimony",
      ],
    },
    {
      dayNumber: 2,
      locationName: "西之島沖 (約180 km)",
      distanceKm: 180,
      situationTitle: "異変の顕在化・西之島噴火と深海シグネチャー",
      incidentOverview: "西之島周辺の海底火山が突発的大規模噴火。船舶の避難誘導および安全確保のため、上層部より「合同対策本部の即応体制維持」が命じられる。周辺海域から巨大な影や異常振動の目撃情報が相次ぐ。",
      hqResponse: "東京司令部側アクション（ソナー/無線ログ/空撮写真）により、水深800mを時速約6kmで北上する全長数百mの巨大な影を特定。",
      fieldResponse: "小笠原現地側アクション（スクリュー鑑定/漁師証言/ダイバー証言/地震計解析）により、Day 1の元凶がダイオウイカであると判明し、物体の通過が海底火山の噴火を誘発した時系列を解明。",
      revealedEvidenceIds: [
        "ev-sonar-shadow",
        "ev-evacuation-radio-log",
        "ev-aerial-recon-report",
        "ev-propeller-tissue",
        "ev-fisherman-guide-testimony",
        "ev-diver-trauma-record",
        "ev-moving-epicenter",
      ],
    },
    {
      dayNumber: 3,
      locationName: "孀婦岩〜鳥島沖 (約400 km)",
      distanceKm: 400,
      situationTitle: "海底火山の連続爆発と未確認巨大生物の捕捉・写真分析と防衛合議",
      incidentOverview: "鳥島沖海底カルデラの連動大爆発。ヘリソナー索敵作戦によりセクターB-3で巨大生物の撮影・捕捉に成功（または航跡波を確認）。海上保安庁は撮影写真の生物学的解釈を海洋生物学者（PC5）に相談し、海上自衛隊の防衛出動の要否を防衛庁リエゾン（PC2）に諮問。全員による合議を経て、対策本部司令官（PC1）が最終意思決定を下す。",
      hqResponse: "洋上ヘリ索敵の統括と写真解析。PC5への生物学的鑑定相談、PC2への自衛隊出動判断の要請、そして合同対策本部での合議をまとめ、司令官（PC1）がDay 4の防衛出動・迎撃方針を最終決定。",
      fieldResponse: "捜索ヘリによる写真撮影任務の遂行。PC5による写真の生物学的所見（超巨大質量・無数の触手・火山誘引）の提示、および現地救難隊（PC3・PC4・PC6）による合議への参加。",
      revealedEvidenceIds: [],
    },
    {
      dayNumber: 4,
      locationName: "須美寿島〜青ヶ島沖 (約550 km)",
      distanceKm: 550,
      situationTitle: "須美寿島沖海底噴火・富士山到達危機と隕石追跡仮説・東京・小笠原クロス調査",
      incidentOverview: "須美寿島〜青ヶ島沖の海底カルデラが連動大爆発（Day 3海底噴火）。八丈島・青ヶ島では火山性群発微動が観測され、日速約150kmで北上する火山フロントが数日後に【富士山直下】に到達し破局的大噴火を誘発する壊滅的危険性をプレイヤー側が指摘。さらに、1ヶ月前に全員が目撃した流星雨の記憶と、その際に唯一小さな隕石片を拾って東京へ持ち帰っていた司令官（PC1）の事実、そしてDay 1で謎のダイバーグループが運んだ約30kgの大型冷凍ボックスの記憶から、『生物が海底から引き揚げられた隕石を何らかの理由で追って北上しているのではないか』という重大仮説を検討する（数百km離れた場所からの直接誘引は物理的に困難である一方、特異な鉱物組成や海底環境の変化が怪異を引き寄せている可能性が議論される）。Day 3の防衛出動要請に対し内閣は不作為を決め込むが、防衛庁からは『どこへ向かっている見立てなのか』の緊急意見聴取が寄せられ、提示する見立ての説得力が防衛庁の内閣説得を左右することが示唆される。父島へ帰還した現地組と東京組は、東京3枠（司令官の隕石片調査・火山性微動・島民魚探情報）および小笠原4枠（流星雨落下地質記録調査・神社調査・謎のダイバーグループ追跡・写真画像解析）の合議調査に着手。神社調査では怪異を鎮める祝詞の存在が判明するが、元神主は死去し、内容を知る子ども達は東京に出ており、両者の協力が必須となる。また祝詞は船で海に出て筒を海中に入れて読み上げる作法であることも判明する。Day 4の終盤には東京司令部への再確認（予想進路：東京湾首都直撃 vs 富士山直撃、および超巨大群体の生態報告）が行われ、どちらの進路を選択した場合でも、防衛庁より『内閣法制局の壁（外国からの武力攻撃ではないため防衛出動不可）を突破し、有事の防衛出動ではなく「害獣駆除（有害鳥獣等駆除名目）」という方針で自衛隊部隊を緊急動員し駆除作戦を展開する』との正式通達を受け、Day 5の自衛隊通常兵器迎撃作戦へと突入する。",
      hqResponse: "東京側アクション（3枠中1枠選択：司令官持ち帰り隕石片分析・八丈島微動解析・島民魚探情報）の実行と富士山到達リスクの指摘。小笠原側からの神社祝詞に関する照会要請の受託。終盤に防衛庁への最終進路・生態報告を実施し、防衛庁から『害獣駆除』方針による海上自衛隊動員の通達を受領。",
      fieldResponse: "小笠原現地アクション（4枠中2枠選択：観測所の流星雨落下地質記録分析・神社調査・謎のダイバーグループ貨物追跡・写真画像解析）の実行。神社の盟約祝詞の儀礼作法（海上に船で出て筒から海中へ唱える）の解明と、東京にいる神主の子どもの捜索依頼。",
      revealedEvidenceIds: [
        "ev-tokyo-meteorite-analysis",
        "ev-hachijo-tremor-analysis",
        "ev-hachijo-resident-and-sonar",
        "ev-ogasawara-meteorite-analysis",
        "ev-shrine-curse-stone",
        "ev-diver-shipping-waybill",
        "ev-photo-deep-analysis",
      ],
    },
    {
      dayNumber: 5,
      locationName: "八丈島〜御蔵島沖 (約700 km)",
      distanceKm: 700,
      situationTitle: "御蔵島沖海底噴火・富士山地下微動開始・自衛隊機密遮断と魚雷撃退作戦の結末",
      incidentOverview: "御蔵島沖の海底カルデラで連動噴火（Day 4噴火）が発生し、これを震源とするM4・震度3の地震が八丈島へ到達。さらに、最も恐れていた【富士山地下からの火山性深部微動】が観測され、メディア各社は『伊豆諸島の連続海底噴火と群発地震が富士山の大噴火を誘発するのではないか』と大々的な連動噴火報道・推論を開始する。一方、Day 4で害獣駆除名目での部隊動員を決めた防衛庁は、海上保安庁および小笠原現地緊急チームへのこれまでの協力に感謝を述べつつ、『ここからの作戦行動は自衛隊の最高軍事機密となるため、これ以上の情報を提供することはできない』として情報提供を遮断。プレイヤー達は自衛隊の制約から離れて自由に行動・調査できるようになる。しかしDay 5の終盤、八丈島〜御蔵島沖で展開された魚雷群の一斉射撃は全弾直撃したものの、物体は泥のように瞬時に再結合。防衛庁は『命中している以上、さらに大量の魚雷を集中投入（飽和攻撃）すれば撃滅できるはずだ』と考えつつも、力押しだけで本当に適切なのか疑念を抱き、緊急対策チームの防衛庁リエゾン（PC2）を通じて、生物を直接確認した海洋生物学者（PC5）に『通常兵器で倒せないなら、あいつらは一体どうやって一つの個体として統率しているのか、富士山を含む噴火をどうやって制御しているのか』という緊急意見照会を求めてくる（※海底噴火自体の根本原因は作中ではあえて説明しない）。",
      hqResponse: "メディア各社の富士山噴火パニック報道への対応および富士山地下深部微動の監視。防衛庁からの機密遮断通達を受け、東京側独自調査に着手。終盤に防衛庁よりPC2経由でPC5への『統率メカニズムに関する緊急諮問』を受電。",
      fieldResponse: "八丈島震度3地震の観測と御蔵島沖噴火の監視。自衛隊機密遮断下での独自アクションの実行。終盤に通常兵器敗北と物体北上継続（駿河トラフ到達・破局噴火まで残り48時間）の報を受け愕然とする。",
      revealedEvidenceIds: [
        "ev-cult-cargo",
        "ev-shrine-lineage",
        "ev-asakura-notes-bio",
        "ev-eruption-countdown",
      ],
    },
    {
      dayNumber: 6,
      locationName: "三宅島〜伊豆大島沖 (約830 km)",
      distanceKm: 830,
      situationTitle: "一時沈静化から終盤の再浮上へ ＆ 4大証拠の連鎖と8語新言語祝詞の完成・海自ソナー網装填",
      incidentOverview: "自衛隊の迎撃により物体は深海1,200mへ一時潜航。Day 6前半は微動が一時沈静化するも、終盤に駿河トラフ境界へ向けて急速に再浮上し、富士山地下微動が突如復活・激化（破局噴火まで残り24時間）。この極限状態の中、4段階の開示ロジック（祝詞儀礼 ➔ 海中筒の音響物理 ➔ 古代のイカ塊捕食伝承 ➔ 朝倉ノートのクジラ言語）を経て、祝詞の神髄が『舌を弾く吸着破裂音（クリック音）』であると解明。朝倉教授のノートから5大コーダ（捕食・危機・位置指示・SOFAR到達距離・YES了解）を読み解き、プレイヤー全員の知見を結集して『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』の8語合成新言語祝詞が完成。海自全ソナー網（SOSUS）へ信号パケットを装填し、翌朝決戦スタンバイを完了する。",
      hqResponse: "富士山微動の急激な復活アラート発令。Day 5未選択の東京側重要アクション（謎のダイバーグループによる約30kgの海底隕石の富士山麓搬入特定 または 元神主子どもの舌クリック口伝）を朝までに完全回収。PC1が全責任を負い海自ソナー網の軍事アクセスを開放、PC2が防衛庁上層部と音響コンソールを接続して8語信号の全周波数同期テストを完了。",
      fieldResponse: "小笠原大神宮古文書、朝倉教授の海洋音響実録ノート（5大コーダ実録）、小笠原古謡（捕鯨唄リズム）を持ち寄り、祝詞の型からクリック音列を復元。東京班の口伝と照合し、『人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ』の8語新言語シーケンスを完成させる。",
      revealedEvidenceIds: [
        "ev-ancient-shrine-scroll",
        "ev-asakura-notes",
        "ev-asakura-notes-records",
        "ev-folk-song-rhythm",
        "ev-coda-spectrogram",
      ],
    },
    {
      dayNumber: 7,
      locationName: "駿河湾口〜湾奥 (約950 km)",
      distanceKm: 950,
      situationTitle: "駿河湾口決戦・魚雷飽和攻撃（粉砕アシスト）× クジラたちのメッセージリレー × 深海大捕食",
      incidentOverview: "富士山直下のマグマ網到達寸前、物体は水深600〜1,000m（魚雷有効限界スレスレ）の超深海を維持して駿河湾奥へ突入。海自潜水艦部隊による重魚雷一斉飽和攻撃（ソナーPing照射アシストと一口サイズへの粉砕・分断）と、海自大出力ソナー網からの新言語祝詞放流、クジラたちのメッセージリレー（歌のバトン）、そして数百頭のマッコウクジラ群による深海大挟撃オペレーションが決行される。",
      hqResponse: "海自潜水艦部隊が重魚雷の一斉飽和攻撃を敢行し、巨大群体を一口サイズに粉砕・分断。同時に全海域メガワット級ソナー網より『人とクジラの約束…』を大出力放流。至近のクジラから太平洋全域へリレーされる歌声と深海ハイドロフォン観測をリアルタイム統括。",
      fieldResponse: "水深600〜1,000mの深海の闇で、メッセージリレーにより集結した数百頭のマッコウクジラ群が一斉突入！ 分断されたダイオウイカを片っ端から貪り喰らい尽くし、怪異を完全消滅。富士山火山性微動停止。日本壊滅は完全に回避される。",
      revealedEvidenceIds: [],
    },
  ],

  crypticWords: [
    // --- 祝詞の言葉（3種） ---
    {
      id: "word-human",
      symbol: "▲▲",
      meaning: "人間（人）",
      soundPattern: "舌クリック吸着音 均等2連打（カッ・カッ）",
      assignedCharId: "pc-6",
      clueSource: "祝詞巻物・人音の点刻記号",
    },
    {
      id: "word-whale",
      symbol: "▼━",
      meaning: "クジラ（鯨）",
      soundPattern: "重厚な低音長打（ドーン……）",
      assignedCharId: "pc-6",
      clueSource: "祝詞巻物・鯨神の点刻記号",
    },
    {
      id: "word-promise",
      symbol: "◆◆◆",
      meaning: "約束（盟約）",
      soundPattern: "共鳴する高低交差3連打（チ・トン・チ）",
      assignedCharId: "pc-6",
      clueSource: "祝詞巻物・盟約の誓記号",
    },

    // --- 地理・行動・目標の言葉 ---
    {
      id: "word-subsea-volcano",
      symbol: "▲🌋▲",
      meaning: "海の下の火山",
      soundPattern: "重低音の連続地鳴りパルス（ゴゴゴゴ……）",
      assignedCharId: "pc-4",
      clueSource: "気象観測所・海嶺海底熱水音響ログ",
    },
    {
      id: "word-go-north",
      symbol: "↑↑",
      meaning: "北に向かう",
      soundPattern: "上昇テンポ・高音パルス（ピ・ピピッ）",
      assignedCharId: "pc-2",
      clueSource: "海自・音響航法方位コーダ（北）",
    },
    {
      id: "word-go-south",
      symbol: "↓↓",
      meaning: "南に向かう",
      soundPattern: "低音下降パルス（ポ・ポポン）",
      assignedCharId: "pc-2",
      clueSource: "海自・音響航法方位コーダ（南）",
    },
    {
      id: "word-go-east",
      symbol: "→→",
      meaning: "東に向かう",
      soundPattern: "右上がり2点打（ツ・ツー）",
      assignedCharId: "pc-2",
      clueSource: "海自・音響航法方位コーダ（東）",
    },
    {
      id: "word-go-west",
      symbol: "←←",
      meaning: "西に向かう",
      soundPattern: "右下がり2点打（ツー・ツ）",
      assignedCharId: "pc-2",
      clueSource: "海自・音響航法方位コーダ（西）",
    },
    {
      id: "word-search",
      symbol: "◎◎",
      meaning: "探せ（索敵）",
      soundPattern: "等間隔の探査パルス（タン・タン・タン）",
      assignedCharId: "pc-5",
      clueSource: "朝倉教授ノート・索敵行動コーダ",
    },
    {
      id: "word-giant-prey",
      symbol: "●●●●●●↑",
      meaning: "巨大な餌（ご馳走）",
      soundPattern: "高音超高速ロングバースト（チチチチチチッ！）",
      assignedCharId: "pc-3",
      clueSource: "小笠原古謡（捕鯨唄）・巨頭捕食の手拍子",
    },
    {
      id: "word-gather",
      symbol: "●●●●↑",
      meaning: "集まれ（号令）",
      soundPattern: "加速する4連打（カ・カ・カカッ！）",
      assignedCharId: "pc-5",
      clueSource: "朝倉教授ノート・群合流コーダ",
    },
  ],

  crypticGrammar: {
    ruleDescription: "太古の祝詞とクジラ言語の融合構文：祝詞の中に刻まれた盟約『人とクジラの約束』を前置し、連動噴火の火山フロントを追跡する『海の下の火山を北に向かって探せ』のナビゲーションを指示し、最後に『巨大な餌に集まれ』と号令をかける3部構成の完全言語構文。",
    correctSequence: [
      "word-human",
      "word-whale",
      "word-promise",
      "word-subsea-volcano",
      "word-go-north",
      "word-search",
      "word-giant-prey",
      "word-gather",
    ],
    combinedMessage: "人とクジラの約束。海の下の火山を北に向かって探せ。巨大な餌に集まれ",
    holderCharId: "pc-6",
  },

  matrixLinks: [],
  lockCriteria: [
    { id: "lock-1", name: "通常兵器無効化の解明", description: "ダイオウイカ数百体の超群体であることの看破" },
    { id: "lock-2", name: "北上の真の理由特定", description: "謎のダイバーグループによる約30kgの海底隕石の富士山麓搬入の特定" },
    { id: "lock-3", name: "生物学的捕食手段の特定", description: "マッコウクジラ言語による捕食要請の立案" },
    { id: "lock-4", name: "言語文法の解読", description: "古文書の祝詞と音響データの結合によるメッセージ完成" },
  ],
  candidateStatuses: [],
};

/**
 * 6名プレイ用 PC4（純粋な海洋・気象観測員）
 */
export const pc4For6Players = {
  id: "pc-4",
  name: "PC4: 海洋・気象観測員",
  profession: "気象庁 小笠原観測所 職員",
  roleType: "investigator" as const,
  isCulpritCandidate: false,
  location: "field" as const,
  introduction:
    "あなたは気象・海洋・火山観測の専門員である。1ヶ月前、小笠原の夜空を焦がした流星雨を観測所で目撃し、近海に落下した隕石の衝撃波・地質観測ログを記録している。海洋ブイからリアルタイムの表層海流データを取得・分析する。",
  initialItems: [
    "地質・気象観測コンソール端末",
    "1ヶ月前の流星雨・落下地質観測ログ",
    "海洋ブイ表層流速データ（黒潮支流：真東へ2.0ノット）",
  ],
  capabilities: [
    {
      id: "cap-4-0",
      name: "海洋ブイ表層海流（真東2.0ノット）の提示",
      description: "現場海域の黒潮支流が真東へ2.0ノットで流れている実測値を全員に共有する。",
      targetPhase: 1,
    },
    {
      id: "cap-4-1",
      name: "海底火山連動シミュレーション",
      description: "海底火山の噴火データから、物体の時速約6kmでの北上ペースを割り出す。",
      targetPhase: 2,
      unlockedEvidenceIds: ["ev-volcano-chain-log"],
    },
    {
      id: "cap-4-2",
      name: "破局噴火タイムリミット算出",
      description: "本土直下のマグマ溜まりへの到達時間（残り48時間）を確定させる。",
      targetPhase: 5,
      unlockedEvidenceIds: ["ev-eruption-countdown"],
    },
    {
      id: "cap-4-3",
      name: "深海水温・音速伝播補正",
      description: "水温・塩分データからソナー音速を補正し、触手群体のノイズ周波数を同定する。",
      targetPhase: 6,
    },
  ],
  handout: {
    publicProfile: "科学的データと数値を冷静に分析する観測員。感情に流されない判断を下す。",
    secretObjective: "正確なデータを提示し続け、破局噴火の発生時刻までに回避策を実行させる。",
    internalDrama: {
      pride: "正確な気象・地質予報で人命を守る科学者としての矜持",
      guilt: "最悪のカウントダウンを告げることで仲間を絶望に突き落とす苦悩",
      loss: "過去の火山噴火予報の遅れで故郷を失った記憶",
    },
    backgroundTimeline: "Day 1 局地的な表層海流データを分析。遭難船の漂流先特定に貢献……",
    handoutBody:
      "「小笠原観測所のリアルタイム海洋ブイデータです。現場海域の黒潮支流は、風とは異なり【真東へ流速2.0ノット】で流れています！つまり、海流の力だけで1時間に真東へ2.0海里押し流されている計算になります！」",
  },
};

/**
 * 6名プレイ用 PC6（救護班チーフ 兼 神職）
 */
export const pc6Character = {
  id: "pc-6",
  name: "PC6: 救護班チーフ",
  profession: "現地救護ボランティア（島の旧家・神職）",
  roleType: "investigator" as const,
  isCulpritCandidate: false,
  location: "field" as const,
  introduction:
    "あなたは島の神社の家系であり、海難救助隊の救護チーフである。1ヶ月前、島の夜空を引き裂いて海に落ちた不吉な流星雨を境内から目撃し、古い伝承との符合に胸騒ぎを覚えている。救難信号途絶直前の最後の微弱な無線ログを管理している。",
  initialItems: [
    "神社の古い木札",
    "救護医療キット",
    "途絶直前のアナログ無線音声ログ",
  ],
  capabilities: [
    {
      id: "cap-6-0",
      name: "救難無線断片ログの共有",
      description: "途絶直前の船長の声『風で舵が効かない！真横から波を受けている！』を共有し、風と海流の双方を受けている事実を提示する。",
      targetPhase: 1,
      unlockedEvidenceIds: ["ev-radio-fragment"],
    },
    {
      id: "cap-6-1",
      name: "救護所での事情聴取",
      description: "救護した船長から『クジラとは異なる異常な挙動とスクリューの巻き付き故障』の証言を引き出す。",
      targetPhase: 1,
    },
    {
      id: "cap-6-2",
      name: "土蔵の古文書捜索",
      description: "先祖が遺した太古の魔物退治の古文書（祝詞）を発見する。",
      targetPhase: 6,
      unlockedEvidenceIds: ["ev-ancient-shrine-scroll"],
    },
    {
      id: "cap-6-3",
      name: "祝詞の拍子（文法ルール）詠唱",
      description: "古文書に記された点刻記号が『単語を並べる語順』であることを解き明かす。",
      targetPhase: 6,
    },
  ],
  handout: {
    publicProfile: "温和で献身的な救護担当。島の伝統や神事にも詳しい。",
    secretObjective: "島の信仰と祖先の知恵を信じ、現代科学と手を取り合って災厄を鎮める。",
    internalDrama: {
      pride: "何百年も島を守り祈り続けてきた社家としての責任感",
      guilt: "怪異の出現を単なる自然現象や錯覚として見過ごしかけた自責",
      loss: "近代化の中で失われていった島の神話や古い記憶",
    },
    backgroundTimeline: "Day 1 途絶直前の無線音声を解析し、救助後は船長の応急処置を担当……",
    handoutBody:
      "「救護本部で受信した、途絶直前の最後の微弱な無線記録です！『風で舵が効かない！真横から波（海流）を受けている！』という船長の悲鳴が残っています。船は風に煽られながら、真横から海流をまともに受けて漂流を始めた証拠です！」",
  },
};

/**
 * 5名プレイ用 PC4（海洋気象観測員 兼 神社社家：PC6の古文書・祝詞・無線ログを統合）
 */
export const pc4For5Players = {
  id: "pc-4",
  name: "PC4: 海洋気象観測員 兼 神社社家",
  profession: "気象庁 小笠原観測所 職員（島の旧家・社家出身）",
  roleType: "investigator" as const,
  isCulpritCandidate: false,
  location: "field" as const,
  introduction:
    "あなたは気象庁小笠原観測所の専門員であり、同時に島最古の大神宮を守る旧家（社家）の血筋である。普段は気象・海洋・火山の科学データを扱う観測官だが、幼少期から自宅の土蔵に伝わる古文書や、海に向かって唱える祝詞の記憶を色濃く受け継いでいる。1ヶ月前、小笠原の夜空を焦がした流星雨を目撃し、近海に落下した隕石の衝撃波・地質観測ログを記録している。",
  initialItems: [
    "地質・気象観測コンソール端末",
    "1ヶ月前の流星雨・落下地質観測ログ",
    "海洋ブイ表層流速データ（黒潮支流：真東へ2.0ノット）",
    "神社の古い木札",
    "途絶直前の遭難船アナログ無線音声ログ（『風で舵が効かない！』）",
  ],
  capabilities: [
    {
      id: "cap-4-0",
      name: "海洋ブイ海流（真東2.0kt）＆ 遭難無線断片ログの提示",
      description: "真東へ2.0ktの海流データと、途絶直前の船長の声『風で舵が効かない！真横から波を受けている！』を提示し、風と海流の双方を受けている事実を証明する。",
      targetPhase: 1,
      unlockedEvidenceIds: ["ev-radio-fragment"],
    },
    {
      id: "cap-4-1",
      name: "海底火山連動シミュレーション",
      description: "海底火山の噴火データから、物体の時速約6kmでの北上ペースを割り出す。",
      targetPhase: 2,
      unlockedEvidenceIds: ["ev-volcano-chain-log"],
    },
    {
      id: "cap-4-2",
      name: "破局噴火タイムリミット算出",
      description: "本土直下のマグマ溜まりへの到達時間（残り48時間）を確定させる。",
      targetPhase: 5,
      unlockedEvidenceIds: ["ev-eruption-countdown"],
    },
    {
      id: "cap-4-3",
      name: "実家土蔵の古文書捜索 ＆ 深海水温・音速伝播補正",
      description: "先祖が遺した太古の魔物退治の古文書（海底火山刺激と巨大イカ塊捕食の伝承、祝詞の型・吸着破裂音）を提示し、ソナー音速を補正する。",
      targetPhase: 6,
      unlockedEvidenceIds: ["ev-ancient-shrine-scroll"],
    },
  ],
  handout: {
    publicProfile: "海洋・気象観測の専門員。島最古の旧家出身でもあり、伝統や神事にも通じている。",
    secretObjective: "近代科学のデータと祖先の知恵（古文書）の両方を駆使し、未曾有の破局噴火から島と日本を救う。",
    internalDrama: {
      pride: "近代科学の観測技術と祖先の伝承という、新旧ふたつの知識体系を持つことへの誇り",
      guilt: "神職を継がずに科学者の道を選び、実家の伝承をどこかで迷信扱いしていたことへの後ろめたさ",
      loss: "数年前に亡くなった元神主（祖父・親族）から、もっと古文書の真意を聞いておくべきだったという悔恨",
    },
    backgroundTimeline: "Day 1 観測所にて遭難船の途絶直前無線を傍受、ブイの海流データを照合し漂流予測に貢献……",
    handoutBody:
      "近代科学を信じる観測官としてのあなたと、太古の神職の血を引くあなた。その双方が、今この海難事故で試されている。遭難直前に観測所のモニターに入った船長の悲痛な叫び『風で舵が効かない！真横から波を受けている！』。そしてブイが示す真東へ2.0ノットの海流。東京の風圧流データと組み合わせれば、船の現在地は必ず特定できる。そして、実家の土蔵に眠る古文書の存在が、あなたの胸を騒がせていた……",
  },
};

/**
 * プレイ人数（5名または6名）に応じたキャラクター一覧を取得
 */
export function getCharactersForPlayerCount(playerCount: number) {
  const pc1 = initialProject.characters.find((c) => c.id === "pc-1")!;
  const pc2 = initialProject.characters.find((c) => c.id === "pc-2")!;
  const pc3 = initialProject.characters.find((c) => c.id === "pc-3")!;
  const pc5 = initialProject.characters.find((c) => c.id === "pc-5")!;

  if (playerCount === 5) {
    // 5名モード：PC4は統合版、PC6はなし
    return [pc1, pc2, pc3, pc4For5Players, pc5];
  } else {
    // 6名モード：PC4は純粋観測員、PC6あり
    return [pc1, pc2, pc3, pc4For6Players, pc5, pc6Character];
  }
}
