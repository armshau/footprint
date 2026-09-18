# Footprint

這是一個全靜態的鬼角圖（Amidakuji）網頁應用程式，使用 React + Vite 建構。

## 產品體驗

- 2–20 位玩家與任務成對設定
- 隨機產生鬼腳圖、逐人選路與結果動畫
- 可新增或清除自訂橫線、重播完成路徑
- 響應式介面、鍵盤焦點與 reduced-motion 支援

## BMAD 設計產物

專案使用 BMAD 6.12.0（Core + BMM），並以繁體中文保存規格、UX 與架構決策：

```text
_bmad/                         BMAD 工作流與設定
.agents/skills/                Codex 可用的 BMAD skills
_bmad-output/specs/            核心規格與 brownfield 分析
_bmad-output/planning-artifacts/
  ux-designs/                  DESIGN.md 與 EXPERIENCE.md
  architecture/                Architecture Spine
```

目前視覺方向是「紙張遊戲＋螢光筆路徑」。完整產品契約從 `_bmad-output/specs/spec-footprint-bmad-redesign/SPEC.md` 開始閱讀。

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
