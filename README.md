# quiet-sudoku

quiet-sudoku は、強制広告で集中を切らさずに、毎日少しずつ数独を楽しむための Web/PWA 版アプリです。App Store / Google Play へのリリースはまだ狙わず、まずは URL で共有できる静的アプリとして完成度を上げます。

## コンセプト

- クリア直後の達成感を広告で邪魔しない
- 数独好きが毎日1問続けたくなる体験を目指す
- スマホのホーム画面に追加して使える PWA を目指す
- オフラインでも最低限起動できる土台を持つ
- 実広告 SDK は入れず、将来の静かなスポンサー枠だけを用意する

## ファイル構成

```text
index.html
src/style.css
src/app.js
src/puzzles.js
manifest.webmanifest
service-worker.js
assets/icons/
README.md
AGENTS.md
docs/product-spec.md
docs/qa-checklist.md
docs/roadmap.md
```

GitHub Pages の root 公開に向けて、`index.html`、`manifest.webmanifest`、`service-worker.js` はリポジトリ直下に置きます。

## ローカル確認

`index.html` をブラウザで直接開くと基本動作を確認できます。

PWA と service worker は `file://` では登録されないため、ローカルサーバーで確認してください。

```powershell
python -m http.server 4173
```

その後、ブラウザで `http://localhost:4173/` を開きます。

## GitHub Pages 公開手順

1. この構成を GitHub リポジトリの root に置きます。
2. GitHub のリポジトリ画面で `Settings` を開きます。
3. 左メニューの `Pages` を開きます。
4. `Build and deployment` の `Source` で `Deploy from a branch` を選びます。
5. `Branch` で公開したいブランチを選び、フォルダは `/root` を選びます。
6. `Save` します。
7. 数分待って、表示された Pages URL を開きます。

公開後に確認する URL:

- `https://<user>.github.io/<repo>/`
- `https://<user>.github.io/<repo>/manifest.webmanifest`
- `https://<user>.github.io/<repo>/service-worker.js`
- `https://<user>.github.io/<repo>/src/app.js`
- `https://<user>.github.io/<repo>/src/style.css`
- `https://<user>.github.io/<repo>/src/puzzles.js`
- `https://<user>.github.io/<repo>/assets/icons/quiet-sudoku-192.png`
- `https://<user>.github.io/<repo>/assets/icons/quiet-sudoku-512.png`

## ルート公開とサブパス公開

GitHub Pages で通常のプロジェクトページとして公開すると、URL は `https://<user>.github.io/<repo>/` のようなサブパスになります。

このアプリは以下の理由でサブパス配信に対応しやすい構成です。

- HTML の参照は `src/app.js` のような相対パス
- `manifest.webmanifest` の `start_url` は `./`
- `manifest.webmanifest` の `scope` は `./`
- service worker は配置されたディレクトリ配下を scope にする

独自ドメインや `https://<user>.github.io/` 直下で公開する場合も、同じ相対パスのまま動きます。

GitHub Pages で `/docs` 公開に切り替える場合は、このアプリ一式を `docs/` 配下に移す必要があります。現状の推奨は `/root` 公開です。

## 404 やキャッシュ不整合の対処

404 が出る場合:

- Pages の公開元が `/root` になっているか確認します
- `manifest.webmanifest`、`service-worker.js`、`src/`、`assets/` が公開対象に含まれているか確認します
- URL の末尾にリポジトリ名のサブパスが入っているか確認します
- ブラウザで直接 `manifest.webmanifest` や `service-worker.js` を開き、200 で返るか確認します

修正が反映されない場合:

- `service-worker.js` の `CACHE_NAME` を上げます
- Chrome DevTools の Application > Service Workers で unregister します
- Application > Cache Storage で `quiet-sudoku-pwa-*` を削除します
- ブラウザで hard reload します
- Android / iPhone のホーム画面アプリは、一度閉じて再起動します

## PWA 公開後確認

Chrome DevTools で以下を確認します。

- Application > Manifest にエラーがない
- Application > Service Workers に service worker が登録される
- Application > Cache Storage に `quiet-sudoku-pwa-v2` が作成される
- Application > Local Storage に `quiet-sudoku-*` のキーが作成される
- DevTools の Network で Offline に切り替え、再読み込みして最低限盤面が表示される

## iPhone Safari 実機確認

1. iPhone Safari で公開 URL を開きます。
2. 共有ボタンから「ホーム画面に追加」を選びます。
3. ホーム画面アイコンから起動します。
4. standalone 表示で盤面が崩れないか確認します。
5. 1問の途中まで入力します。
6. アプリを閉じ、ホーム画面アイコンから再起動します。
7. 途中保存が復元されるか確認します。

iOS Safari では Android Chrome のようなインストールプロンプトが出ない場合があります。`apple-mobile-web-app-title` と `apple-touch-icon` の見え方も実機で確認してください。

## Android Chrome 実機確認

1. Android Chrome で公開 URL を開きます。
2. インストール、またはホーム画面追加の導線を確認します。
3. ホーム画面アイコンから起動します。
4. standalone 表示で盤面が崩れないか確認します。
5. 1問の途中まで入力し、再起動後に復元されるか確認します。
6. 初回アクセス後にオフラインへ切り替えます。
7. オフライン状態で起動または再読み込みし、最低限盤面が表示されるか確認します。

## PWA と公開方針

- `manifest.webmanifest` でアプリ名、テーマカラー、アイコン、standalone 表示を定義
- `service-worker.js` で `index.html`、CSS、JS、問題データ、manifest、アイコンをキャッシュ
- GitHub Pages / Cloudflare Pages / Vercel など、静的ホスティングにそのまま置ける構成
- ホーム画面追加時のアプリ名は `quiet-sudoku`

## アイコン方針

現在は `assets/icons/quiet-sudoku-icon.svg` を元に、以下の PNG を配置しています。

- `assets/icons/quiet-sudoku-192.png`
- `assets/icons/quiet-sudoku-512.png`

正式公開前に、同じ落ち着いた紙色・深緑・数独グリッドの方向性で、マスク可能アイコンとして余白や角丸を実機確認してください。

## 実装済み

- 9x9 の数独盤面
- Easy / Normal / Hard の 3 問
- 数字入力、メモ入力、消去、元に戻す
- 初期値マスの編集不可
- 同じ数字、選択中マスの行・列・3x3 ブロックのハイライト
- solution 完全一致によるクリア判定
- タイマー、一時停止、途中保存、復元
- 今日の一問の土台とクリア済み保存
- クリア履歴の保存
- クリア結果ダイアログ
- manifest / service worker / アイコン
- 控えめなスポンサー枠

## 現時点の制約

- 問題数はまだ少なく、今日の一問は既存問題を日替わりで使い回します
- ヒント機能は未実装のため、クリア結果のヒント数は常に 0 です
- service worker は HTTPS または localhost でのみ登録されます
- サーバー、ログイン、クラウド同期はありません

## 広告 / スポンサー方針

現時点では AdMob などの実広告 SDK は入れません。スポンサー枠は `src/puzzles.js` の `QUIET_SUDOKU_SPONSOR` で管理します。

```js
{
  name: "スポンサー募集中",
  description: "静かで誠実な掲載枠を準備中です。",
  image: "",
  url: ""
}
```

`url` がある場合のみクリック可能になり、外部リンクは別タブで開きます。スポンサー枠はゲーム操作やクリア後の達成感を邪魔しない位置と強さに留めます。

## 今後のロードマップ

- 問題数を増やし、日替わりローテーションの質を上げる
- 連続記録や週次サマリーを追加する
- PWA インストール後の実機 QA を行う
- オフライン時の表示と更新導線を磨く
- 将来のスポンサー審査ポリシーを整える
