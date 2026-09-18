---
name: Footprint
description: 聚會用鬼腳圖；像攤在桌上的遊戲紙，以螢光路徑讓結果一眼可讀。
status: final
sources:
  - ../../../specs/spec-footprint-bmad-redesign/SPEC.md
colors:
  canvas: '#F3EFE4'
  paper: '#FFFCF4'
  paper-strong: '#FFFFFF'
  ink: '#17211B'
  ink-muted: '#657068'
  line: '#D8D1C2'
  primary: '#235347'
  primary-strong: '#173D34'
  on-primary: '#FFFFFF'
  accent: '#F7C94B'
  accent-soft: '#FFF0B8'
  coral: '#E86A4A'
  success: '#2F7D5A'
  focus: '#166BFF'
typography:
  display:
    fontFamily: 'ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", system-ui, sans-serif'
    fontSize: 'clamp(2.4rem, 7vw, 5rem)'
    fontWeight: '800'
    lineHeight: '0.95'
    letterSpacing: '-0.055em'
  heading:
    fontFamily: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif'
    fontSize: 'clamp(1.45rem, 3vw, 2rem)'
    fontWeight: '750'
    lineHeight: '1.15'
  body:
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '16px'
    fontWeight: '450'
    lineHeight: '1.6'
  label:
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
    fontSize: '12px'
    fontWeight: '750'
    lineHeight: '1.3'
    letterSpacing: '0.12em'
rounded:
  sm: '8px'
  md: '14px'
  lg: '24px'
  full: '9999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '24px'
  '6': '32px'
  '7': '48px'
  '8': '72px'
components:
  primary-button:
    background: '{colors.primary}'
    foreground: '{colors.on-primary}'
    radius: '{rounded.full}'
  paper-panel:
    background: '{colors.paper}'
    border: '{colors.line}'
    radius: '{rounded.lg}'
  input:
    background: '{colors.paper-strong}'
    foreground: '{colors.ink}'
    border: '{colors.line}'
    radius: '{rounded.sm}'
---

## Brand & Style

[ASSUMPTION] Footprint 採「桌上紙筆遊戲」而非電競或賭博語彙。暖白紙面、深綠墨色與一條黃色螢光筆構成主視覺；刻意保留手作感，但資訊與操作仍乾淨、可靠。語氣像會控場的朋友：短句、明確、帶一點玩心，不嘲諷落敗者。

## Colors

- `{colors.canvas}` 是桌面背景，`{colors.paper}` 是主要工作面；兩者只用色階分層。
- `{colors.primary}` 僅用於主要行動、目前回合與關鍵標題。
- `{colors.accent}` 代表「現在要注意」：步驟號碼、目前玩家與活躍路徑提示；不可大面積鋪底。
- `{colors.coral}` 只作少量趣味標記或警示，不承擔唯一狀態訊號。
- 一般文字使用 `{colors.ink}`；輔助文字使用 `{colors.ink-muted}`。正文不得落在 accent 或 coral 上。

## Typography

大標題使用 `{typography.display}`，只出現在首頁品牌與結果揭曉；區塊標題使用 `{typography.heading}`。表單、說明、按鈕均使用 `{typography.body}`；欄位群組與步驟標籤使用 `{typography.label}`。數字採等寬數字特性，方便玩家編號掃讀。

## Layout & Spacing

頁面最大寬度 1180px。桌面設定頁為 5/7 欄比例：左側解釋與人數，右側玩家／任務成對表格；低於 760px 全部改為單欄。主要面板使用 `{components.paper-panel}`，區塊距離以 `{spacing.6}` 與 `{spacing.7}` 為主。手機左右邊距 16px，桌面 32px。

## Elevation & Depth

深度以色調與 1px 紙張邊線建立。大面板可使用低透明、偏暖的擴散陰影；控制項 hover 只上移 1px。禁止高對比黑影、玻璃擬態與多層浮卡。

## Shapes

紙張面板用 `{rounded.lg}`，輸入與小型控制用 `{rounded.sm}`，主按鈕與狀態膠囊用 `{rounded.full}`。SVG 梯線保持直角，讓玩法結構與柔和外框形成對比。

## Components

- **品牌標頭**：小型眉題＋Footprint 字標＋一句玩法承諾。Coffee 連結為低權重文字按鈕。
- **紙張面板**：`{components.paper-panel}`；承載設定或遊戲，不再用多層卡片切碎內容。
- **玩家／任務列**：每列固定顯示編號、姓名、任務；桌面同行，手機上下排列。
- **主要按鈕**：`{components.primary-button}`；每個表面最多一個實心主要行動。
- **次要按鈕**：透明底＋`{colors.line}` 邊線；用於重設線條與新遊戲。
- **回合膠囊**：accent 圓點、目前玩家名與剩餘人數；文字仍用 ink。
- **結果票券**：accent-soft 底、深色文字，顯示玩家、動詞與任務，不只顯示英文句子。
- **梯線舞台**：白紙底、淡灰梯線；完成路徑使用玩家色，活躍路徑加粗並帶有限光暈。

## Do's and Don'ts

| Do | Don't |
|---|---|
| 用編號、姓名與文字共同表示狀態 | 只靠顏色區分玩家或結果 |
| 讓設定欄位成對、逐列閱讀 | 把玩家與任務拆成兩條難以對照的長欄 |
| 一個畫面只有一個主要實心按鈕 | 所有按鈕都用相同高權重色塊 |
| 動畫服務於路徑理解 | 加入純裝飾的漂浮、粒子或自動循環動畫 |
| 保持紙張與螢光筆語彙 | 使用霓虹賭場、深色電競或企業儀表板風格 |
