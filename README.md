# Antigravity Training System

員工教育訓練系統，包含後台課程管理與前台學習介面。

## 功能特色
- **管理員後台**: 課程管理、素材上傳(支援拖曳排序、預覽)、訓練紀錄查詢/匯出、權限控管。
- **學員前台**: 課程列表、互動式課程播放器(圖片/影片輪播)、完課狀態追蹤。

## 技術架構
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express, SQLite (better-sqlite3)

## 本地開發

1. **安裝依賴**:
   ```bash
   chmod +x start_app.sh
   ./start_app.sh
   ```
   此腳本會自動安裝前後端套件並啟動服務。

2. **手動啟動**:
   - Backend: `cd server && npm install && npm start` (Port 3001)
   - Frontend: `cd client && npm install && npm run dev` (Port 5173)

3. **管理員帳號**: `admin` / `000000`

## GitHub Pages 自動部署

本專案已設定 GitHub Actions，可自動將 Frontend 部署至 GitHub Pages。

### 設定步驟
1. 將程式碼推送到 GitHub Repository。
2. 進入 GitHub Repository 的 **Settings** > **Pages**。
3. 在 **Build and deployment** 區塊：
   - **Source**: 選擇 `GitHub Actions`。
4. 設定完成後，每次推送到 `main` 或 `master` 分支時，Action 會自動觸發構建並部署。
5. 部署完成後，GitHub 會提供網址 (例如 `https://yourname.github.io/repo-name/`)。

**注意**: GitHub Pages 僅能託管靜態前端頁面。若需完整功能，後端 API 必須另外部署至有 Node.js 環境的伺服器 (如 Render, Railway, AWS)，並在 Frontend 設定正確的 API URL。
