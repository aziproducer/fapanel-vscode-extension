# 🚀 FA-PANEL VSCode拡張 - 次の作業ガイド

**最終更新**: 2025-07-23  
**現在の状態**: 基本機能完成・GitHub公開済み  
**リポジトリ**: https://github.com/aziproducer/fapanel-vscode-extension

## 📋 プロジェクト現状

### ✅ 完了済み
- シンタックスハイライト（26+関数対応）
- Language Server（自動補完・ホバー情報）
- GitHub公開（aziproducer/fapanel-vscode-extension）
- 2713個HTMLファイルの分析準備完了

### 🔄 今すぐできる作業

## 1. 🎯 【最優先】未発見関数の発見・実装

### 作業手順
```bash
# 1. プロジェクトフォルダに移動
cd C:\Users\neozi\VSCODE\fapanel_hokan

# 2. チェックリストを確認
ls tmp/checklist/
```

### やること
1. **tmp/checklist/** フォルダの49個のCSVファイルを順次チェック
2. 各HTMLファイルから新しい関数・メソッドを発見
3. **発見例**: `Beep()`関数のような見落とし機能
4. 発見した機能を以下に実装:
   - `syntaxes/fapanel.tmLanguage.json` (シンタックスハイライト)
   - `src/server.ts` (自動補完)

### チェック方法
```csv
ファイル名,中身,シンタックス,自動補完
beep.html,Beep()関数,未実装,未実装  ← これを「実装済み」に更新
```

## 2. 🧪 テスト・デバッグ

### 作業手順
```bash
# 1. 依存関係インストール
npm install

# 2. TypeScriptコンパイル
npm run compile

# 3. VSCodeでデバッグ実行
# F5キーでExtension Development Hostを起動

# 4. テストファイル作成
# sample/test_fapanel_syntax.xml を使用
```

### 確認項目
- [ ] シンタックスハイライトが正常動作
- [ ] 自動補完が正常動作（::入力時）
- [ ] ホバー情報が表示される
- [ ] XMLタグ補完が動作
- [ ] イベントハンドラー補完が動作

## 3. 📦 VSCode Marketplace公開準備

### 作業手順
```bash
# 1. vsce インストール
npm install -g vsce

# 2. パッケージ作成
vsce package

# 3. 作成されたVSIXファイルをテスト
code --install-extension fapanel-vscode-extension-*.vsix
```

### 必要な準備
- [ ] アイコン画像追加
- [ ] package.json のメタデータ充実
- [ ] README.md の使い方セクション充実
- [ ] スクリーンショット追加

## 4. 🔍 高度な機能追加

### デバッグ機能
- ブレークポイント対応
- 変数ウォッチ
- コールスタック表示

### IntelliSense強化
- パラメータヒント
- シグネチャヘルプ
- 定義へのジャンプ

## 📁 重要ファイル一覧

### 編集対象ファイル
| ファイル | 用途 | 編集頻度 |
|---------|------|----------|
| `syntaxes/fapanel.tmLanguage.json` | シンタックスハイライト | 🔥 高 |
| `src/server.ts` | 自動補完機能 | 🔥 高 |
| `snippets/fapanel.json` | コードスニペット | 🔄 中 |
| `package.json` | 拡張設定 | 🔄 中 |

### 参考ファイル
| ファイル | 用途 |
|---------|------|
| `tmp/作業メモ_2025-07-23.md` | 開発履歴・教訓 |
| `tmp/シンタックスハイライト_完全実装チェックリスト.md` | 実装状況 |
| `docs/要件定義.md` | プロジェクト要件 |
| `sample/test_fapanel_syntax.xml` | テスト用サンプル |

## 🚨 注意事項

### セキュリティ
- **絶対に公開してはいけない**: `sample/resource_fapanel_6017/` フォルダ
- プロプライエタリなFA-PANELマニュアルが含まれています
- `.gitignore`で除外済みですが、念のため注意

### 開発環境
- **必要なツール**: Node.js, TypeScript, VSCode
- **推奨拡張**: ESLint, TypeScript Hero
- **テスト環境**: VSCode Extension Development Host

## 🎯 今日やるべきこと（優先順）

### 🔥 最優先（30分）
1. `tmp/checklist/html_list_B.txt` を開く
2. `beep.html,Beep()関数,未実装,未実装` → `beep.html,Beep()関数,実装済み,実装済み` に更新
3. 他のBファイルもチェックして新機能発見

### 🔄 次の作業（1時間）
1. `tmp/checklist/html_list_A.txt` から順次チェック
2. 発見した関数を `src/server.ts` に追加
3. git commit & push

### 🎨 時間があれば
1. F5でデバッグ実行してテスト
2. README.mdに使用方法追加
3. アイコン画像作成

## 💡 発見のコツ

### HTMLファイルで探すべきパターン
```javascript
// 関数パターン
::FunctionName()
FunctionName()

// メソッドパターン
.MethodName()
obj.Property

// 特殊値パターン
#VALUE#
SpecialKeyword
```

### 実装すべき優先度
1. **高**: グローバル関数（::記法）
2. **中**: オブジェクトメソッド（.記法）
3. **低**: 特殊値・キーワード

---

**🎉 作業開始**: この文書を読み終わったら、`tmp/checklist/` フォルダを開いて作業開始！