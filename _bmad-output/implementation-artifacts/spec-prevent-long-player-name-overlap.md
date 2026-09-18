---
title: '避免長玩家名稱互相遮蓋'
type: 'bugfix'
created: '2026-09-18'
status: 'done'
route: 'oneshot'
design_review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-footprint-2026-09-18/DESIGN.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-footprint-2026-09-18/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 遊戲人數較多或玩家名稱較長時，上方起點膠囊會依文字內容向左右擴張，遮住相鄰玩家名稱；下方任務文字也缺乏明確的欄寬約束。

**Approach:** 每條路徑取得固定且一致的水平欄位，起點標籤改成編號在上、名稱在下的垂直結構；名稱與終點文字在各自欄位內截斷或換行，完整內容保留在無障礙標籤與結果區。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| 一般名稱 | 2–4 位短名稱玩家 | 起點編號與名稱置中對齊各自直線 | 不需要額外處理 |
| 長名稱 | 7 位以上、中文或英文長名稱 | 標籤維持固定欄寬，最多兩行，不遮蓋相鄰欄位 | 超長部分視覺截斷，完整名稱保留於 `title` 與 `aria-label` |
| 長任務 | 終點任務超過欄寬 | 任務在自身欄位內限制顯示，不侵入相鄰欄位 | 完整任務仍在結果票券呈現 |
| 窄螢幕 | 遊戲區寬於 viewport | 梯線舞台水平捲動，不壓縮固定欄寬 | 保留既有橫向捲動行為 |

</frozen-after-approval>

## Implementation Notes

- `src/GhostLeg.jsx`：將每條路徑的基準寬度設為 96px，讓梯線欄距隨玩家數穩定增加；起點按鈕加入完整名稱的 `title`，終點任務與勝出者名稱以安全長度顯示。
- `src/index.css`：起點由水平膠囊改為固定欄寬的垂直卡片，編號在上、名稱最多兩行；增加舞台頂部空間並保留橫向捲動。
- 獨立 review 後將 SVG 終點文字縮至最多 7 個 Unicode 字元、避免切斷 emoji，並讓水平捲動區可由鍵盤聚焦。
- 驗證：ESLint、Vite production build 與 `git diff --check` 均通過。

## Spec Change Log

## Review Triage Log

- `medium → patch`：最小 96px 欄距不足以容納 9 個全形字；已將終點任務與勝出者名稱限制為最多 7 個顯示字元。
- `low → patch`：使用 UTF-16 `slice()` 可能切斷 emoji；已改用 `Array.from()` 依 Unicode code point 截斷。
- `low → patch`：頂部 focus outline 可能被捲動容器裁切；已將頂部 padding 由 82px 增為 90px。
- `low → patch`：水平捲動區缺少鍵盤入口；已加入 `role="region"`、`tabIndex="0"` 與可左右捲動的無障礙名稱。
- `false`：完整文字只靠 tooltip 不可發現；上方名稱在卡片內最多兩行且完整值保留於按鈕 `aria-label`，任務在抽籤前依產品規則不可揭露，完成後由結果票券完整顯示。

## Verification

**Commands:**

- `npm run lint` -- expected: ESLint 無錯誤。
- `npm run build` -- expected: Vite production build 成功。

**Manual checks:**

- 使用至少 7 位長名稱玩家檢查上方標籤無重疊。
- 檢查下方終點任務不侵入相鄰欄位。
- 檢查桌面與窄螢幕皆可水平捲動並操作起點。
