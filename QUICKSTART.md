# Quick Start Guide - 快速開始指南

## 第一次使用？跟著這些步驟開始！

### 1️⃣ 確保後端運行 (2 分鐘)

```bash
# 進入後端目錄
cd A-Grade-Amendment-System

# 安裝依賴（如果還沒安裝）
npm install

# 啟動後端服務
npm start

# 後端應該運行在 http://localhost:3000
```

### 2️⃣ 安裝前端 (1 分鐘)

```bash
# 在前端目錄中
npm install
```

### 3️⃣ 啟動前端 (30 秒)

```bash
npm run dev
```

打開瀏覽器訪問：**http://localhost:5173**

### 4️⃣ 試試添加一條記錄 (1 分鐘)

1. 滾動到「Add New Amendment」部分
2. 填寫表單：
   - **Student ID**: 20251001
   - **Student Name**: John Doe
   - **Course Code**: COMP3047
   - **Course Name**: Software Engineering
   - **Original Grade**: B
   - **Amended Grade**: A
   - **Reason**: Marking error in final exam
   - **Status**: Pending
3. 點擊「Add」

✅ 你的第一條記錄出現在下面的表格中了！

### 5️⃣ 試試 Excel 功能 (2 分鐘)

#### 下載模板
1. 點擊「Download Template」按鈕
2. 在 Excel 中打開模板文件
3. 你會看到示例數據和正確的格式

#### 導入數據
1. 在模板中填寫你的數據
2. 保存文件
3. 點擊「Choose File」選擇你的文件
4. 點擊「Import」

#### 導出數據
1. 點擊「Export to Excel」按鈕
2. 文件會自動下載
3. 在 Excel 中打開查看

### 6️⃣ 試試編輯和刪除 (1 分鐘)

#### 編輯記錄
1. 點擊任意記錄的「Edit」按鈕
2. 修改字段（所有字段都可以編輯）
3. 點擊「Save」保存或「Cancel」取消

#### 刪除記錄
1. 點擊「Delete」按鈕刪除單條記錄
2. 點擊「Delete All」刪除所有記錄（會有確認提示）

---

## 🎉 完成！

你現在已經掌握了基本功能！

## 下一步

- 📖 閱讀 [USAGE_GUIDE.md](./USAGE_GUIDE.md) 了解更多功能
- 🔧 修改 `.env.development` 配置 API 地址
- 🎨 自定義 `src/assets/main.css` 的樣式

## 遇到問題？

### 前端無法連接後端
- 確認後端運行在 `http://localhost:3000`
- 檢查 `.env.development` 文件中的 `VITE_API_BASE_URL`
- 打開瀏覽器開發者工具查看網絡請求

### Excel 導入失敗
- 確保文件是 .xlsx 或 .xls 格式
- 文件大小不超過 5MB
- 使用提供的模板格式

### 頁面空白
- 打開瀏覽器控制台查看錯誤
- 確認 `npm run dev` 沒有報錯
- 嘗試清除瀏覽器緩存

---

## 技術支援

- 後端倉庫：https://github.com/Brian-code-123/A-Grade-Amendment-System
- Vue 3 文檔：https://vuejs.org/
- Vite 文檔：https://vitejs.dev/
