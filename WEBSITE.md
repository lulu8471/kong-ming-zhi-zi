# 《空名之子》官方網站

網站程式及可直接發布的靜態檔案均保存在 `lulu8471/kong-ming-zhi-zi`。原有 `README.md` 是作者的作品說明，保留原文。

## 內容

故事導覽、十位人物介紹、曦衡聯域地理、映京十二層、四氣候期、六大神域、日常場景、圖像典藏、作品導讀、九卷規劃、資料更新與常見問題。

支援人物搜尋與分類、圖片瀏覽、地圖縮放、瀏覽器本機收藏、閱讀字級與明暗配色、動態暫停、手機選單與鍵盤操作。沒有帳號、投稿表單或遠端收藏資料庫。

作品導讀是為官網編寫的介紹，不是小說正文。未公開的重大事件與結局未加入網站；後續卷名預設隱藏。

## 編輯與建置

使用 Node.js 22.13 或更新版本，以及 `package.json` 指定的 pnpm 版本。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build:pages
```

- `lib/site-content.ts`：人物、地域、城層、神域、圖像說明、卷名及導讀。
- `components/official-site.tsx`：版面及互動。
- `app/globals.css`：配色、字體、動態及手機版。
- `public/assets/`：作者提供的美術圖像之 WebP 網頁版本。
- `docs/`：`pnpm build:pages` 產生的 GitHub Pages 靜態網站。

每次修改內容後重新執行 `pnpm build:pages`，並將來源與更新後的 `docs/` 一起提交。預設路徑前綴為 `/kong-ming-zhi-zi`；若專案日後改名，需要同步修改建置路徑。

## 在同一專案開啟網站

GitHub 專案的 **Settings → Pages**：

1. Source 選擇 **Deploy from a branch**。
2. Branch 選擇 **main**，資料夾選擇 **/docs**。
3. 按 **Save**，等待 GitHub Pages 發布完成。

本專案未設定自訂網域，也不涉及 Vellum 專案。README 的 GitHub 檔案頁仍是原來的連結，網站則由該專案的 GitHub Pages 功能呈現。

私有專案是否能使用 GitHub Pages，依 GitHub 帳號方案而定。此網站不會修改儲存庫公開／私有設定，也不會更動付費方案。

## 素材依據

使用作者提供的 Google Drive「故事正典與九卷章卡_20260918」資料中的《空名之子_故事正典_世界全書》、圖冊及人物／場景美術，依 2026-09-19 取得的版本整理公開介紹。

已使用圖像：A18、A23、A32、A34、A35、A40、A41、A70、A72、A73、A74、A75、A76、A80、A81、A82、A83、M09。圖像僅縮放及轉換網頁格式。設定文件全文與私人 Drive 連結未包含在公開網站。

所有作品文字及圖像權利歸原權利人；程式依賴套件維持各自授權。
