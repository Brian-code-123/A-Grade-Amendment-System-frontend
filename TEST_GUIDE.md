# Grade Amendment System - 測試指南

## 🧪 手動測試流程

### 測試準備

1. **啟動後端服務**
```bash
cd A-Grade-Amendment-System
npm install
npm start
# 確認運行在 http://localhost:3000
```

2. **啟動前端服務**
```bash
cd A-Grade-Amendment-System-frontend-1
npm install
npm run dev
# 確認運行在 http://localhost:5173
```

---

## 📋 測試案例

### 測試 1: 首頁功能測試

**目標**: 驗證首頁顯示正確

1. ✅ 訪問 http://localhost:5173
2. ✅ 檢查以下元素是否顯示：
   - 標題：「Grade Amendment System」
   - 4 個統計卡片（總記錄、待處理、主任審核中、已完成）
   - 工作流程圖（7個步驟）
   - 快速操作按鈕（3個）
   - 最近活動列表

**預期結果**:
- 所有元素正確顯示
- 統計數字初始為 0
- 最近活動顯示「暫無最近活動」

---

### 測試 2: 工作流程步驟測試

**目標**: 驗證工作流程顯示和交互

1. ✅ 在首頁滾動到「成績修改工作流程」區域
2. ✅ 檢查 7 個步驟是否全部顯示：
   - Step 1: 收到改分通知 (Teacher)
   - Step 2: Excel 模板或表單填寫 (Teacher)
   - Step 3: Excel 上傳與數據驗證 (System)
   - Step 4: 格式與內容驗證 (System)
   - Step 5: Programme Director 提交 (Programme Director)
   - Step 6: Admin 確認和打印 (Admin)
   - Step 7: 完成 (System)
3. ✅ 點擊每個步驟的折疊面板
4. ✅ 檢查是否顯示：
   - 操作說明
   - 驗證要求
   - 提示信息

**預期結果**:
- 所有步驟正確顯示
- 折疊面板可以正常展開/收起
- 角色標籤顏色正確（Teacher=藍色、Director=淺藍、Admin=綠色、System=灰色）

---

### 測試 3: 添加修改記錄測試

**目標**: 測試完整的添加流程

1. ✅ 點擊「新增修改記錄」或導航到「修改記錄」頁面
2. ✅ 填寫表單：
   ```
   Student ID: 20251001
   Student Name: Test Student
   Course Code: COMP3047
   Course Name: Software Engineering
   Original Grade: B
   Amended Grade: A
   Reason: Test reason for grade amendment
   Status: Pending
   ```
3. ✅ 點擊「Add」按鈕
4. ✅ 檢查成功訊息
5. ✅ 檢查表格中是否出現新記錄
6. ✅ 返回首頁檢查統計數字是否更新

**預期結果**:
- 表單提交成功
- 顯示成功訊息
- 新記錄出現在表格中
- ID 自動遞增
- 首頁統計更新為：總記錄=1, 待處理=1

---

### 測試 4: Excel 模板下載測試

**目標**: 測試模板下載功能

1. ✅ 在首頁點擊「下載 Excel 模板」
2. ✅ 檢查瀏覽器下載目錄
3. ✅ 打開下載的 `grade_amendment_template.xlsx` 文件
4. ✅ 檢查以下內容：
   - 表頭：Student ID, Student Name, Course Code, Course Name, Original Grade, Amended Grade, Reason, Status
   - 示例數據行存在
   - 格式正確

**預期結果**:
- 文件成功下載
- 文件可以在 Excel 中打開
- 包含正確的表頭和示例數據

---

### 測試 5: Excel 導入測試

**目標**: 測試批量導入功能

**準備**:
1. 使用下載的模板
2. 添加以下測試數據：

| Student ID | Student Name | Course Code | Course Name | Original Grade | Amended Grade | Reason | Status |
|------------|--------------|-------------|-------------|----------------|---------------|--------|--------|
| 20251002 | Alice Wong | COMP3001 | Database | C | B | Regrade request | Pending |
| 20251003 | Bob Chen | MATH2001 | Calculus | D | C | Extra credit | Pending |
| 20251004 | Carol Li | PHYS1001 | Physics | B | A | Lab score error | Pending |

**測試步驟**:
1. ✅ 導航到「修改記錄」頁面
2. ✅ 點擊「Choose File」選擇準備好的 Excel 文件
3. ✅ 點擊「Import」按鈕
4. ✅ 等待導入完成
5. ✅ 檢查成功訊息（應顯示導入了 3 條記錄）
6. ✅ 檢查表格中是否出現 3 條新記錄
7. ✅ 返回首頁檢查統計

**預期結果**:
- 導入成功
- 顯示「Successfully imported 3 amendment(s)」
- 表格中有 3 條新記錄
- 首頁統計更新為：總記錄=4, 待處理=4

---

### 測試 6: 編輯記錄測試

**目標**: 測試內聯編輯功能

1. ✅ 在「修改記錄」頁面選擇任意一條記錄
2. ✅ 點擊「Edit」按鈕
3. ✅ 修改以下字段：
   - Amended Grade: 改為 A+
   - Reason: 添加 " - Updated"
4. ✅ 點擊「Save」按鈕
5. ✅ 檢查記錄是否更新

**預期結果**:
- 編輯模式正確顯示
- 所有字段可編輯
- 保存後數據正確更新
- 顯示成功訊息

---

### 測試 7: 刪除記錄測試

**目標**: 測試單條和批量刪除

**單條刪除**:
1. ✅ 點擊任意記錄的「Delete」按鈕
2. ✅ 確認彈出確認對話框
3. ✅ 點擊「確定」
4. ✅ 檢查記錄是否消失

**批量刪除**:
1. ✅ 點擊「Delete All」按鈕
2. ✅ 確認彈出確認對話框
3. ✅ 點擊「確定」
4. ✅ 檢查所有記錄是否清空

**預期結果**:
- 刪除前有確認對話框
- 刪除後記錄正確移除
- 顯示成功訊息
- 首頁統計更新

---

### 測試 8: Excel 導出測試

**目標**: 測試數據導出功能

**準備**: 確保系統中有至少 3 條記錄

1. ✅ 點擊「Export to Excel」按鈕
2. ✅ 檢查瀏覽器下載
3. ✅ 打開 `grade_amendments.xlsx` 文件
4. ✅ 驗證以下內容：
   - 表頭格式正確（藍色背景、白色文字）
   - 所有記錄都存在
   - 數據完整且正確

**預期結果**:
- 文件成功下載
- 包含所有記錄
- 格式正確
- 可以重新導入

---

### 測試 9: 角色切換測試

**目標**: 測試角色切換功能

1. ✅ 點擊導航欄右側的用戶頭像
2. ✅ 查看下拉菜單
3. ✅ 依次切換到以下角色：
   - Teacher
   - Programme Director
   - Admin
4. ✅ 檢查每次切換後：
   - 導航欄顯示的角色標籤
   - 用戶名稱

**預期結果**:
- 角色可以正常切換
- 標籤顏色和文字正確更新
- 沒有錯誤

---

### 測試 10: 工作流程狀態測試（手動）

**目標**: 測試工作流程狀態更新

**注意**: 這是前端狀態測試，實際應用需要後端支持

1. ✅ 打開瀏覽器控制台
2. ✅ 添加一條記錄
3. ✅ 在控制台執行以下命令測試狀態更新：

```javascript
// 獲取 store
const store = window.__PINIA__.state.value.amendment

// 測試狀態更新
store.submitForReview(1)  // 提交審核
// 等待幾秒，檢查訊息

store.validateAmendment(1, true)  // 驗證通過
// 等待幾秒，檢查訊息

store.directorApprove(1, '主任同意')  // 主任審核
// 等待幾秒，檢查訊息

store.adminConfirm(1, '管理員確認')  // 管理員確認
// 等待幾秒，檢查訊息

store.completeAmendment(1)  // 完成
// 等待幾秒，檢查訊息
```

4. ✅ 每次執行後檢查：
   - 首頁統計數字變化
   - 成功訊息顯示
   - 記錄的工作流狀態

**預期結果**:
- 每次狀態更新成功
- 顯示對應的訊息
- 統計數字正確更新

---

## 🐛 錯誤處理測試

### 測試 11: 文件類型驗證

1. ✅ 嘗試上傳非 Excel 文件（如 .txt, .pdf）
2. ✅ 檢查是否顯示錯誤訊息

**預期結果**: 顯示「Only Excel files (.xlsx, .xls) are allowed」

---

### 測試 12: 文件大小驗證

1. ✅ 嘗試上傳超過 5MB 的 Excel 文件
2. ✅ 檢查是否顯示錯誤訊息

**預期結果**: 顯示「File size exceeds 5MB limit」

---

### 測試 13: 必填字段驗證

1. ✅ 嘗試提交空表單
2. ✅ 檢查瀏覽器原生驗證

**預期結果**: 瀏覽器提示必填字段

---

## 📱 響應式測試

### 測試 14: 移動設備測試

1. ✅ 打開瀏覽器開發者工具
2. ✅ 切換到移動設備視圖（iPhone, iPad）
3. ✅ 測試以下功能：
   - 導航菜單可折疊
   - 統計卡片正確顯示
   - 表格可水平滾動
   - 按鈕大小適當
   - 表單輸入框大小合適

**預期結果**:
- 所有元素在移動設備上正確顯示
- 沒有水平滾動（除了表格）
- 觸摸操作正常

---

## ✅ 測試清單

複製以下清單進行測試：

```
□ 測試 1: 首頁功能測試
□ 測試 2: 工作流程步驟測試
□ 測試 3: 添加修改記錄測試
□ 測試 4: Excel 模板下載測試
□ 測試 5: Excel 導入測試
□ 測試 6: 編輯記錄測試
□ 測試 7: 刪除記錄測試
□ 測試 8: Excel 導出測試
□ 測試 9: 角色切換測試
□ 測試 10: 工作流程狀態測試
□ 測試 11: 文件類型驗證
□ 測試 12: 文件大小驗證
□ 測試 13: 必填字段驗證
□ 測試 14: 響應式測試
```

---

## 🔧 測試工具

### Chrome DevTools
- 查看網絡請求
- 檢查控制台錯誤
- 測試不同設備尺寸

### Vue DevTools
```bash
# 安裝 Vue DevTools 瀏覽器擴展
# Chrome: https://chrome.google.com/webstore
# Firefox: https://addons.mozilla.org
```

用於：
- 檢查組件狀態
- 查看 Pinia store
- 追蹤事件

---

## 📊 測試報告模板

```markdown
## 測試報告

**測試日期**: YYYY-MM-DD
**測試人員**: [姓名]
**瀏覽器**: Chrome/Firefox/Safari [版本]

### 通過的測試
- ✅ 測試 1: ...
- ✅ 測試 2: ...

### 失敗的測試
- ❌ 測試 X: ...
  - 錯誤描述: ...
  - 重現步驟: ...
  - 預期結果: ...
  - 實際結果: ...

### 發現的問題
1. ...
2. ...

### 建議
1. ...
2. ...
```

---

## 🎯 下一步

完成測試後：
1. 填寫測試報告
2. 記錄發現的問題
3. 與開發團隊溝通
4. 規劃改進計劃

---

**最後更新**: 2026-02-09
