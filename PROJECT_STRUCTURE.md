# 專案文件結構

## 完整的文件列表

```
A-Grade-Amendment-System-frontend-1/
│
├── .env.development              # 開發環境變量
├── .env.production              # 生產環境變量
├── .eslintrc.cjs                # ESLint 配置
├── .gitignore                   # Git 忽略文件
├── index.html                   # HTML 入口文件
├── jsconfig.json                # JavaScript 配置
├── package.json                 # 項目依賴和腳本
├── vite.config.js               # Vite 配置
│
├── README.md                    # 項目說明（英文）
├── USAGE_GUIDE.md               # 使用指南（中文）
├── QUICKSTART.md                # 快速開始指南
├── PROJECT_STRUCTURE.md         # 本文件 - 專案結構說明
│
└── src/                         # 源代碼目錄
    ├── main.js                  # 應用入口點
    ├── App.vue                  # 根組件
    │
    ├── assets/                  # 靜態資源
    │   └── main.css            # 全局樣式
    │
    ├── components/              # 可重用組件
    │   ├── AlertMessage.vue    # 通知訊息組件
    │   ├── AmendmentForm.vue   # 添加修改表單組件
    │   ├── AmendmentTable.vue  # 修改記錄表格組件
    │   └── ImportExport.vue    # 導入/導出功能組件
    │
    ├── views/                   # 頁面組件
    │   └── AmendmentsView.vue  # 主頁面視圖
    │
    ├── router/                  # 路由配置
    │   └── index.js            # Vue Router 配置
    │
    ├── stores/                  # Pinia 狀態管理
    │   └── amendmentStore.js   # 修改記錄 Store
    │
    └── services/                # API 服務
        ├── api.js              # Axios 基礎配置
        └── amendmentService.js # 修改記錄 API 服務
```

## 文件說明

### 配置文件

- **package.json**: 定義項目依賴、腳本和元數據
- **vite.config.js**: Vite 構建工具配置，包含代理設置
- **jsconfig.json**: JavaScript 項目配置，路徑別名設置
- **.eslintrc.cjs**: 代碼檢查規則配置
- **.env.development**: 開發環境變量（API 地址等）
- **.env.production**: 生產環境變量
- **.gitignore**: Git 版本控制忽略文件

### 源代碼文件

#### 入口文件
- **index.html**: HTML 模板
- **src/main.js**: Vue 應用初始化
- **src/App.vue**: 根組件

#### 組件
- **AlertMessage.vue**: 顯示成功/錯誤訊息
- **ImportExport.vue**: Excel 導入/導出、下載模板、刪除全部
- **AmendmentForm.vue**: 添加新修改記錄的表單
- **AmendmentTable.vue**: 顯示、編輯、刪除修改記錄列表

#### 視圖
- **AmendmentsView.vue**: 主頁面，整合所有組件

#### 路由
- **router/index.js**: 定義應用路由

#### 狀態管理
- **stores/amendmentStore.js**: 
  - 管理修改記錄數據
  - 處理增刪改查操作
  - 管理加載狀態和錯誤/成功訊息

#### API 服務
- **services/api.js**: 
  - Axios 實例配置
  - 請求/響應攔截器
  - 基礎 URL 設置
  
- **services/amendmentService.js**:
  - addAmendment(): 添加新記錄
  - updateAmendment(): 更新記錄
  - deleteAmendment(): 刪除單條記錄
  - deleteAllAmendments(): 刪除所有記錄
  - importExcel(): 導入 Excel 文件
  - exportExcel(): 導出到 Excel
  - downloadTemplate(): 下載 Excel 模板

#### 樣式
- **assets/main.css**: 
  - Bootstrap 5 引入
  - 全局樣式定義
  - 自定義主題顏色
  - 響應式樣式

## 數據流

```
用戶操作
    ↓
組件 (Components)
    ↓
Store (amendmentStore)
    ↓
Service (amendmentService)
    ↓
API (Axios)
    ↓
後端 (http://localhost:3000)
```

## 技術棧

### 核心框架
- **Vue 3.4+**: 使用 Composition API
- **Vite 5.0+**: 快速的開發構建工具

### 狀態管理和路由
- **Pinia 2.1+**: Vue 官方狀態管理庫
- **Vue Router 4.2+**: 官方路由管理器

### HTTP 和數據處理
- **Axios 1.6+**: Promise 基礎的 HTTP 客戶端
- **ExcelJS 4.4+**: Excel 文件處理

### UI 框架
- **Bootstrap 5.3+**: CSS 框架（通過 CDN）

## 開發命令

```bash
# 安裝依賴
npm install

# 啟動開發服務器 (http://localhost:5173)
npm run dev

# 構建生產版本
npm run build

# 預覽生產構建
npm run preview

# 代碼檢查
npm run lint
```

## 環境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- 後端服務運行在 http://localhost:3000

## API 端點映射

| 前端方法 | 後端端點 | HTTP 方法 |
|---------|---------|----------|
| addAmendment | /amendments/add | POST |
| updateAmendment | /amendments/update/:id | POST |
| deleteAmendment | /amendments/delete/:id | POST |
| deleteAllAmendments | /amendments/delete-all | POST |
| importExcel | /amendments/import | POST |
| exportExcel | /amendments/export | GET |
| downloadTemplate | /amendments/template | GET |

## 最後更新

2026-02-09
