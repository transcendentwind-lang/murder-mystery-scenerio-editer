# 編集用SVG原本

このディレクトリのSVGは文字を編集できる原本。対応する `assets/scenarios/project-deep-sea/releases/images/` の同名SVGは、配布・印刷時にフォント環境で崩れないよう、日本語を輪郭の図形へ変換した生成物。

文章や配置を変更するときは原本を編集し、次の手順で生成物を更新する。生成物を直接編集しない。原本のプレビューには下記フォントを使用する。

## 再生成

1. Python環境に `fonttools==4.68.0` と `uharfbuzz==0.57.0` を導入する。
2. [Noto CJK公式リポジトリ](https://github.com/notofonts/noto-cjk/tree/f8d157532fbfaeda587e826d4cd5b21a49186f7c/Serif/OTF/Japanese)から `NotoSerifCJKjp-Regular.otf` と `NotoSerifCJKjp-Bold.otf` を取得する。フォントはSIL Open Font License 1.1。実行環境にのみ置き、配布SVGから参照しない。
3. リポジトリ直下で以下を実行する。`INPUT.svg` は対象原本のファイル名に置き換える。

```sh
python3 scripts/outline_svg_text.py \
  assets/scenarios/project-deep-sea/sources/INPUT.svg assets/scenarios/project-deep-sea/releases/images/INPUT.svg \
  --regular /path/to/NotoSerifCJKjp-Regular.otf \
  --bold /path/to/NotoSerifCJKjp-Bold.otf
```

フォントのSHA-256:

| フォント | SHA-256 |
| --- | --- |
| Regular | `d9854c7a8ef170b5a7932558856fd64eb8de0b007cd823fed6f9f514ad2803d3` |
| Bold | `861a2b2c0e24b23745c262be8c3fdef63f12628f0492fb120ee51aa55c503af8` |

生成時はHarfBuzzの縦組みとOpenTypeの `vert` / `vrt2` を使用し、句読点・括弧も縦書き用字形へ置換する。文字サイズ、字間、列位置は原本の値を引き継ぐ。日本語本文は `aria-label` に保持し、横書きの欧文注記はテキストのまま残す。

墨の掠れは原本の `aged-ink` フィルターで調整する。細かな欠けと大きな濃淡を重ね、文字の透明度だけを変える。乱数の種は固定し、再生成のたびに模様が変わらないようにする。文字サイズ・字形・位置は変更しない。

紙の経年表現は `paper-mottling` の斑な黄変、`paper-stain-wash` / `paper-stain-tide` の吸湿跡、背景グループ内の褐色斑点を重ねる。染みの輪郭は `paper-stain-edge` で不規則にする。染み・斑点は大小と位置に偏りを付け、本文より背面に配置する。印刷結果が一定になるよう模様を原本に保存し、表示のたびに再抽選しない。

更新後はブラウザで単独表示と画像としての埋め込み表示を確認する。特に句読点の右上配置、括弧の向き、本文の欠落、枠からのはみ出しを確認する。画像生成のみの工程なので、アプリ本体のビルドは不要。
