# QA Checklist

## Learning Hints

- [ ] 不正解入力がある状態ではヒントを出さないこと
- [ ] Naked Single のヒントが出ること
- [ ] Hidden Single in Row のヒントが出ること
- [ ] Hidden Single in Column のヒントが出ること
- [ ] Hidden Single in Block のヒントが出ること
- [ ] ヒントの「次へ」「前へ」が機能すること
- [ ] 「答えを入れる」を押すまで board が変更されないこと
- [ ] ヒントで入力した数字が given 扱いにならないこと
- [ ] ヒント使用回数が正しく増えること
- [ ] ヒントが見つからない場合にエラーにならないこと
- [ ] iPhone Safari / PWA 表示でヒントカードが見切れないこと
- [ ] ヒント表示後に通常操作へ戻れること
- [ ] LocalStorage復元後もヒント機能が破綻しないこと

## Basic Launch

- [ ] `index.html` を直接開いて基本動作する
- [ ] ローカルサーバーで開いて基本動作する
- [ ] ローカルサーバーで console error が出続けない
- [ ] スマホ幅で表示が崩れない

## GitHub Pages Preflight

- [ ] GitHub Pages の公開元を branch の `/root` にできる構成になっている
- [ ] `index.html` がリポジトリ直下にある
- [ ] `manifest.webmanifest` がリポジトリ直下にある
- [ ] `service-worker.js` がリポジトリ直下にある
- [ ] `src/` と `assets/icons/` が公開対象に含まれる
- [ ] CSS / JS / manifest / icons が相対パスで参照されている
- [ ] GitHub Pages のサブパス配信で `/<repo>/` から起動できる
- [ ] `.gitignore` にローカルの一時画像やログが含まれている

## GitHub Pages Published URL

- [ ] 公開 URL で `index.html` が表示される
- [ ] `manifest.webmanifest` が 200 で取得できる
- [ ] `service-worker.js` が 200 で取得できる
- [ ] `src/app.js` が 200 で取得できる
- [ ] `src/style.css` が 200 で取得できる
- [ ] `src/puzzles.js` が 200 で取得できる
- [ ] `assets/icons/quiet-sudoku-192.png` が 200 で取得できる
- [ ] `assets/icons/quiet-sudoku-512.png` が 200 で取得できる
- [ ] Chrome DevTools の Application > Manifest でエラーがない
- [ ] Application > Service Workers で service worker が登録される
- [ ] Application > Cache Storage に `quiet-sudoku-pwa-v5` が作成される
- [ ] オフライン切替後に再読み込みして最低限盤面が表示される
- [ ] LocalStorage に `quiet-sudoku-*` のキーで保存される
- [ ] クリア履歴、今日の一問、途中保存が保持される

## Mobile Compact Layout

- [ ] iPhone Safari で、盤面・操作ボタン・数字入力が見切れにくい
- [ ] 4つの操作ボタンが1行で表示される
- [ ] 操作ボタンのラベルが「一時停止」「戻す」「消す」「メモ」になっている
- [ ] メモON状態が見た目で分かる
- [ ] 無効状態の戻すボタンが薄く表示される
- [ ] 数字入力ボタンが押しやすい
- [ ] 数字入力ボタンが1行で表示される
- [ ] スポンサー枠が数字入力の下に表示される
- [ ] スポンサー枠がゲーム操作を邪魔しない
- [ ] スポンサー枠が画面下で不自然に見切れない
- [ ] PWA standalone 表示でも上下余白が過大にならない
- [ ] デスクトップ表示が崩れていない

## Manifest

- [ ] `manifest.webmanifest` の `start_url` が `./` になっている
- [ ] `manifest.webmanifest` の `scope` が `./` になっている
- [ ] `display` が `standalone` になっている
- [ ] `theme_color` と `background_color` が設定されている
- [ ] 192px / 512px の PNG アイコンが存在する
- [ ] ホーム画面追加時にアプリ名とアイコンが表示される

## Service Worker And Cache

- [ ] `service-worker.js` の `CACHE_NAME` にバージョンが入っている
- [ ] install 時に app shell が cache される
- [ ] activate 時に古い `quiet-sudoku-pwa-*` キャッシュが削除される
- [ ] fetch は同一オリジンの GET だけを扱う
- [ ] fetch 失敗時のナビゲーションフォールバックが `index.html` を返す
- [ ] キャッシュ更新後に新しい CSS / JS が反映される
- [ ] DevTools で service worker unregister 後に再登録できる
- [ ] Cache Storage を削除しても再アクセスで復旧する
- [ ] 不要な console.error が出続けない

## Cache Update Procedure

- [ ] `service-worker.js` の `CACHE_NAME` を次の `quiet-sudoku-pwa-v*` に上げる
- [ ] 変更を公開する
- [ ] 公開 URL を開き直す
- [ ] Application > Service Workers で新しい service worker が active になることを確認する
- [ ] Application > Cache Storage で古い `quiet-sudoku-pwa-*` が削除されることを確認する
- [ ] 修正が反映されない場合、service worker を unregister する
- [ ] 修正が反映されない場合、Cache Storage の `quiet-sudoku-pwa-*` を削除する
- [ ] 修正が反映されない場合、ブラウザで hard reload する

## iPhone Safari Real Device

- [ ] 公開 URL を Safari で開く
- [ ] 共有ボタンから「ホーム画面に追加」を選ぶ
- [ ] ホーム画面アイコンから起動する
- [ ] standalone 表示で盤面が崩れない
- [ ] 数字入力ボタンが押しやすい
- [ ] 1問の途中保存後、アプリを閉じて再起動して復元される
- [ ] 一時停止、メモ、Undo、削除が使える

## Android Chrome Real Device

- [ ] 公開 URL を Chrome で開く
- [ ] インストール / ホーム画面追加の導線を確認する
- [ ] ホーム画面アイコンから起動する
- [ ] standalone 表示で盤面が崩れない
- [ ] 数字入力ボタンが押しやすい
- [ ] 1問の途中保存後、アプリを閉じて再起動して復元される
- [ ] 初回アクセス後、オフラインで起動または再読み込みできる

## Board

- [ ] 9x9 の盤面が表示される
- [ ] Easy / Normal / Hard を切り替えられる
- [ ] 初期値マスを編集できない
- [ ] 空マスに数字を入力できる
- [ ] 数字入力ボタンが押しやすい
- [ ] 消すボタンで空マスの数字やメモを消せる
- [ ] 元に戻すで直前の入力、メモ、消去を戻せる

## Judgement

- [ ] 正解入力ではミスが増えない
- [ ] 不正解入力ではミスが増える
- [ ] 不正解の数字が視覚的に分かる
- [ ] `solution` 完全一致でクリア判定される
- [ ] すべてのマスが埋まっていても `solution` と違う場合はクリアにならない

## Notes

- [ ] メモモードで数字を入れると小さなメモとして表示される
- [ ] 同じメモ数字をもう一度押すと外れる
- [ ] 確定入力をすると、そのマスのメモが消える
- [ ] メモ入力が確定入力と混ざって壊れない

## Timer And Pause

- [ ] タイマーが進む
- [ ] 一時停止中は盤面が隠れる
- [ ] 一時停止中はタイマーが止まる
- [ ] 再開できる

## Clear Experience

- [ ] クリア判定が `solution` 完全一致である
- [ ] クリア直後に広告動画が出ない
- [ ] クリア結果にタイム、ミス数、ヒント数、難易度が表示される
- [ ] ノーミス、ヒントなし、今日の一問クリアなどの小さな達成バッジが表示される
- [ ] 「もう1問」「閉じる」「今日の記録を見る」が動作する
- [ ] クリア履歴が LocalStorage に保存される

## Today's Puzzle And Persistence

- [ ] 今日の日付に応じた問題が開く
- [ ] 今日の一問をクリア済みかどうか保存できる
- [ ] 日付が変わると新しい daily entry が作られる
- [ ] 入力途中で再読み込みしても途中保存が復元される
- [ ] 難易度、盤面、メモ、ミス数、経過時間が復元される

## Sponsor

- [ ] スポンサー枠に「このアプリは、集中を邪魔しない広告掲載を目指しています。」が表示される
- [ ] 現時点では「スポンサー募集中」と表示される
- [ ] URL が空の場合、クリックしても外部ページを開かない
- [ ] URL がある場合のみクリック可能になる
- [ ] 外部リンクは別タブで開く
- [ ] スポンサー枠がゲーム操作を邪魔しない

## Mobile

- [ ] スマホ幅で盤面が画面からはみ出さない
- [ ] 数字入力ボタンが押しやすい
- [ ] メモ入力、Undo、削除、一時停止が分かりやすい
- [ ] テキストが親要素からはみ出さない
- [ ] 下部スポンサー枠で主要操作が隠れない
