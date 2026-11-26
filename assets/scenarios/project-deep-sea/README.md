# 組み込み作品の資料パッケージ

このフォルダは一つの作品に所属する資料の正本。共通素材や新規作品の既定資料として使用しない。

- `sources/`: 編集可能な原本と再生成手順。原本がない配布物は、現行ファイルを保持する。
- `releases/images/`, `releases/pdfs/`, `releases/videos/`: 現行の表示・配布ファイル。`releases/images/monitor-png/` には大型モニター提示用の高画質PNG（GM専用図版を除くSVG資料から書き出したもの）を収める。PNGは `python3 scripts/render_svg_to_png.py <入力SVG> <出力PNG>` で再生成できる。動画資料は macOS 上で `swift -module-cache-path /tmp/swift-module-cache scripts/generate_ogasawara_geography_video.swift` および `swift -module-cache-path /tmp/swift-module-cache scripts/generate_day7_suruga_sonar_video.swift` により再生成できる。
- `archive/`: 旧配置から退避した比較用PDF。現行PDFと完全一致しないため保管。自動的に旧版とは断定しない。
- `manifest.json`: ファイル一覧、用途、公開対象、旧URL、照合用ハッシュ。

`npm run assets:prepare` は作者用の全資料を `public/scenarios/` へ配置する。参加者向けビルドでは `participantApp: true` の資料だけ配置する。生成された公開フォルダを直接編集しない。

資料を追加した場合はmanifestにも登録する。`npm run assets:check` は未登録・欠損・ハッシュ差分を検出する。画像原本の変更時は配布物を再生成し、変更したファイルのSHA-256も更新する。配置変更だけでは文字サイズやPDF内容を変更しない。
