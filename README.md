# FA-PANEL VSCode Extension

FA-PANELスクリプト言語用のVSCode拡張機能です。シンタックスハイライトと自動補完機能を提供します。

## 機能

### ✨ シンタックスハイライト
- **キーワード**: `if`, `else`, `for`, `while`, `switch`, `case`, `default`, `break`, `continue`, `return`
- **グローバル関数**: `::Edit.*`, `::MsgBox`, `::StrLen`, `::Val`, `::Str` など26関数
- **オブジェクトメソッド**: `.Text`, `.Enabled`, `.Visible`, `.SetFocus()` など
- **特殊値**: `#NOTHING#`, `#N/A#`, `#ERROR#`, `#INVALID#`, `T`, `F`
- **演算子**: 論理演算子 (`&&`, `||`, `!`)、比較演算子、算術演算子
- **配列記法**: `c()` 関数、`[index]` アクセス
- **XML構造**: `<OBJ>`, `<ROOT>`, `<FORMROOT>`, `<FRAMESET>`, `<FRAME>`

### 🔧 自動補完（IntelliSense）
- **関数補完**: `::` 入力で26のFA-PANEL API関数
- **メソッド補完**: `.` 入力でオブジェクトプロパティ・メソッド
- **イベント補完**: `event` キーワード後のイベントハンドラー
- **XML補完**: `<` 入力でXML要素
- **ホバー情報**: 関数の詳細情報とサンプルコード

## インストール

1. このリポジトリをクローン
2. `npm install` で依存関係をインストール
3. `npm run compile` でTypeScriptをコンパイル
4. F5キーでデバッグ実行、または `vsce package` でVSIXファイル作成

## 開発状況

### ✅ 実装済み機能
- 基本キーワード・制御構文
- 26のグローバル関数（`::Edit.*`, `::MsgBox`, `::StrLen` など）
- オブジェクトメソッド・プロパティ
- 論理演算子・比較演算子・算術演算子
- 配列記法（`c()` 関数、インデックスアクセス）
- XML構造とEventスクリプト埋め込み
- Language Serverによる自動補完とホバー情報

### 🔍 分析済みファイル
FA-PANELマニュアル2713個のHTMLファイルを体系的に分析し、language featuresを抽出しました。
（チェックリストファイルはサイズが大きいため、このリポジトリには含まれていません）

## ファイル構成

```
├── package.json          # 拡張機能設定
├── tsconfig.json         # TypeScript設定
├── src/
│   ├── extension.ts      # メイン拡張機能
│   └── server.ts         # Language Server
├── syntaxes/
│   └── fapanel.tmLanguage.json  # シンタックスハイライト定義
├── snippets/
│   └── fapanel.json      # コードスニペット
├── language-configuration.json  # 言語設定
├── docs/
│   └── 要件定義.md       # プロジェクト要件
└── tmp/                  # 開発作業メモ（一部のみ公開）
```

## 技術仕様

- **言語**: TypeScript
- **対象**: FA-PANELスクリプト（XMLファイル内JavaScript風言語）
- **ファイル拡張子**: `.xml`, `.fap`
- **VSCode Language Server Protocol**: 完全対応
- **TextMate Grammar**: カスタム文法定義

## ライセンス

MIT License

## 作者

開発: Claude Code (claude.ai/code)  
Repository: aziproducer