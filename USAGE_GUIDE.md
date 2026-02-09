# A-Grade Amendment System Frontend - 使用指南

## 專案說明

這是一個基於 Vue 3 的前端應用，用於連接 A-Grade-Amendment-System 後端系統。

### 後端倉庫
https://github.com/Brian-code-123/A-Grade-Amendment-System.git

## 功能特性

- ✨ Vue 3 Composition API
- 🚀 Vite 快速開發
- 🗂️ Pinia 狀態管理
- 🛣️ Vue Router 路由管理
- 📡 Axios API 調用
- 📊 Excel 導入/導出功能
- 🎨 Bootstrap 5 響應式設計

## 安裝步驟

### 前置要求
- Node.js (v16 或更高版本)
- npm 或 yarn
- 後端服務器運行在 http://localhost:3000

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發服務器

```bash
npm run dev
```

應用將在 http://localhost:5173 運行

### 3. 構建生產版本

```bash
npm run build
```

### 4. 預覽生產構建

```bash
npm run preview
```

## 後端 API 端點

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/amendments` | 獲取所有修改記錄(HTML頁面) |
| POST | `/amendments/add` | 添加新的修改記錄 |
| POST | `/amendments/import` | 從 Excel 導入修改記錄 |
| GET | `/amendments/export` | 導出修改記錄到 Excel |
| GET | `/amendments/template` | 下載 Excel 模板 |
| POST | `/amendments/update/:id` | 更新修改記錄 |
| POST | `/amendments/delete/:id` | 刪除修改記錄 |
| POST | `/amendments/delete-all` | 刪除所有修改記錄 |

## 數據結構

```javascript
{
  id: Number,              // 自動遞增的唯一標識符
  studentId: String,       // 學生ID
  studentName: String,     // 學生姓名
  courseCode: String,      // 課程代碼 (例如 COMP3047)
  courseName: String,      // 課程名稱
  originalGrade: String,   // 修改前的成績
  amendedGrade: String,    // 修改後的成績
  reason: String,          // 修改原因
  status: String           // 狀態: "Pending", "Approved", 或 "Rejected"
}
```

## 專案結構

```
src/
├── assets/           # 靜態資源
├── components/       # 可重用組件
│   ├── AlertMessage.vue      # 通知訊息組件
│   ├── AmendmentForm.vue     # 添加修改表單
│   ├── AmendmentTable.vue    # 修改記錄表格
│   └── ImportExport.vue      # 導入/導出功能
├── views/           # 頁面組件
│   └── AmendmentsView.vue    # 主頁面
├── router/          # Vue Router 配置
│   └── index.js
├── stores/          # Pinia stores
│   └── amendmentStore.js     # 修改記錄狀態管理
├── services/        # API 服務
│   ├── api.js                # Axios 配置
│   └── amendmentService.js   # 修改記錄 API
├── utils/           # 工具函數
├── App.vue          # 根組件
└── main.js          # 應用入口點
```

## 使用說明

### 1. 添加修改記錄
- 填寫「Add New Amendment」表單
- 點擊「Add」按鈕

### 2. 從 Excel 導入
- 點擊「Download Template」下載模板
- 在 Excel 中填寫數據
- 選擇文件並點擊「Import」

### 3. 導出到 Excel
- 點擊「Export to Excel」按鈕
- 文件會自動下載為 `grade_amendments.xlsx`

### 4. 編輯修改記錄
- 點擊表格中的「Edit」按鈕
- 修改字段
- 點擊「Save」保存或「Cancel」取消

### 5. 刪除修改記錄
- 單個刪除：點擊「Delete」按鈕
- 批量刪除：點擊「Delete All」按鈕

## 開發注意事項

### 環境變量
- 開發環境：`.env.development`
- 生產環境：`.env.production`

### API 代理
Vite 開發服務器配置了代理，將 `/api` 請求轉發到 `http://localhost:3000`

### 狀態管理
使用 Pinia 管理應用狀態，主要的 store：
- `amendmentStore`：管理修改記錄的增刪改查

## 常見問題

### Q: 後端連接失敗
A: 確保後端服務器運行在 `http://localhost:3000`，檢查 `.env.development` 中的配置。

### Q: Excel 導入失敗
A: 確保文件格式為 .xlsx 或 .xls，文件大小不超過 5MB。

### Q: 為什麼刷新後數據消失？
A: 目前後端使用內存存儲。生產環境需要集成數據庫。

## 技術棧

- **Vue 3**: 前端框架
- **Vite**: 構建工具
- **Pinia**: 狀態管理
- **Vue Router**: 路由管理
- **Axios**: HTTP 客戶端
- **Bootstrap 5**: UI 框架
- **ExcelJS**: Excel 處理

## 授權

MIT

## 支援

如有問題，請查閱：
- 後端文檔：https://github.com/Brian-code-123/A-Grade-Amendment-System
- Vue 3 文檔：https://vuejs.org/
- Vite 文檔：https://vitejs.dev/
