---
id: SPEC-footprint-bmad-redesign
companions:
  - brownfield.md
sources:
  - README.md
  - package.json
  - src/App.jsx
  - src/GhostLeg.jsx
  - src/index.css
---

**Canonical contract.** `SPEC.md` 與 `companions` 共同構成建置、測試與驗收必須遵守的完整契約。

# Footprint 鬼腳圖 BMAD 分析與體驗重設計

## Why

現有產品已具備可玩的鬼腳圖核心，但資訊架構、操作回饋、響應式版面與無障礙支援仍停留在原型階段；本次以 BMAD 建立可追溯的產品與設計基線，並讓聚會主持人能在共用裝置上更快設定、引導與完成一局遊戲。

## Capabilities

- **CAP-1**
  - **intent:** 主持人可設定 2–20 位玩家與等量任務，快速產生一局鬼腳圖。
  - **success:** 修改人數時欄位數量同步，既有輸入在未被裁切的範圍內保留，送出後顯示相同數量的起點與終點。
- **CAP-2**
  - **intent:** 玩家可依序選擇未佔用起點，觀看路徑並清楚理解最終任務。
  - **success:** 每次選擇只分配佇列首位玩家；動畫結束後顯示玩家、終點與任務，已完成路徑可重播。
- **CAP-3**
  - **intent:** 主持人可調整橫線並控制一局的生命週期。
  - **success:** 可在合法位置新增橫線、一次清除所有自訂橫線，且可回到設定開始新局。

## Constraints

- 維持 React 19、Vite 7、純前端與 GitHub Pages 部署模型，不加入後端、登入或持久化。
- 使用繁體中文介面；在 320px 以上視窗可操作，桌面與手機皆不得因固定寬度破版。
- 互動元素需支援鍵盤焦點；動畫需尊重 `prefers-reduced-motion`。
- 保留隨機產生橋接線、逐人選路、使用者自訂橋接線與路徑重播的既有行為。

## Non-goals

- 不加入帳號、雲端同步、歷史戰績、即時多人連線或伺服器端公平性驗證。
- 不更換 React/Vite 技術棧，也不導入大型 UI 元件庫。

## Success signal

一位第一次使用的主持人可在手機或桌面完成「設定玩家與任務 → 產生遊戲 → 全員選路 → 看懂結果 → 開新局」流程；`npm run lint` 與 `npm run build` 均通過。

## Assumptions

- 主要使用情境是聚會中由一台共用裝置主持遊戲。
- 使用者未指定品牌識別，因此視覺方向以「紙張遊戲、螢光筆路徑、熱鬧但不幼稚」為基準。

## Open Questions

- 未來是否需要保存玩家名單、歷史結果或支援多人跨裝置同步？本次視為範圍外。
