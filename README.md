# Footprint

這是一個全靜態的鬼角圖（Amidakuji）網頁應用程式，使用 React + Vite 建構。

## 線上預覽

[點擊這裡查看 DEMO](https://<YOUR_GITHUB_USERNAME>.github.io/<REPO_NAME>/)

*(請將上述連結替換為您實際的 Github Pages 連結)*

## 本地開發

確保您的電腦已安裝 [Node.js](https://nodejs.org/)。

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

## 部署到 GitHub Pages

本專案已設定好 `gh-pages` 自動部署流程。

1. 確保所有的程式碼都已 commit 並 push 到 GitHub。
2. 執行部署指令：

```bash
npm run deploy
```

這將會執行 `vite build` 並將 `dist` 目錄推送到 `gh-pages` 分支。
