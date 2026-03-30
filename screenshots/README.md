# A-Grade Amendment System – Screenshot Catalogue

This directory contains high-quality screenshots of every module and user-facing function in the A-Grade Amendment System frontend.

Screenshots were captured at **1440 × 900** (desktop) and **390 × 844** (mobile / iPhone 14) via Playwright against the running Vite dev server.

---

## How to Re-capture

```bash
# Run these commands in a terminal (Command Prompt / PowerShell / macOS Terminal),
# from the project root folder.

# 1. Start the dev server (keep it running in the background)
npm run dev

# 2. In a separate terminal, run the capture script
npm run screenshots
```

### Where should I type these commands?

Type them in your terminal after opening this project folder:

`/home/runner/work/A-Grade-Amendment-System-frontend/A-Grade-Amendment-System-frontend`

### Troubleshooting: `npm error Missing script: "screenshots"`

This error usually means you are not in this project root folder when running the command.

1. Change to project root first:
   - Windows cmd: `cd /d C:\Users\kassie\OneDrive\桌面\A-Grade-Amendment-System-frontend`
   - PowerShell: `Set-Location "C:\Users\kassie\OneDrive\桌面\A-Grade-Amendment-System-frontend"`
2. Confirm the script exists: `npm run`
3. If `screenshots` still does not appear, update your local repo and check this file:
   - `A-Grade-Amendment-System-frontend/package.json` (it should contain `"screenshots": "node scripts/capture-screenshots.js"`)
4. You can also run the command directly from project root:
   - `node scripts/capture-screenshots.js`

For Windows users, `cp` is not a Command Prompt command. Also make sure `screenshots/` exists first (run `npm run screenshots` once).

```bat
:: Command Prompt (cmd)
cd /d C:\Users\kassie\OneDrive\桌面\A-Grade-Amendment-System-frontend
dir screenshots
xcopy .\screenshots "%USERPROFILE%\Desktop\screenshots\" /E /I /Y
```

```powershell
# PowerShell
Set-Location "C:\Users\kassie\OneDrive\桌面\A-Grade-Amendment-System-frontend"
Get-ChildItem .\screenshots
Copy-Item -Path .\screenshots\* -Destination "$HOME\Desktop\screenshots" -Recurse -Force
```

---

## Screenshot Index

### 1 · Public / Authentication Pages

| File | Description |
|------|-------------|
| `01-login-page.png` | Login page – default Login tab with email/password/code fields |
| `02-login-register-tab.png` | Login page – Register tab for new account creation |
| `03-login-error-state.png` | Login page – validation error state (missing verification code) |
| `04-demo-login-page.png` | Demo Login page – auto-login spinner as Administrator |
| `05-demo-verify-page.png` | Demo Verify page – human verification captcha |
| `06-demo-verify-error-state.png` | Demo Verify page – incorrect captcha answer error |

---

### 2 · Admin Role

| File | Description |
|------|-------------|
| `07-home-dashboard-admin.png` | Home / Dashboard – calendar + announcements (Admin) |
| `08-navbar-admin.png` | Navigation bar – Admin role (Home, Amendments, Admin menu) |
| `09-amendments-list-admin.png` | Amendment List page – full-page view (Admin) |
| `10-amendments-search-filter.png` | Amendment List – active search/filter state *(if rendered)* |
| `11-excel-upload-page.png` | Excel Upload page – bulk grade import |
| `12-submissions-admin.png` | Submissions page (Admin view) |
| `13-admin-dashboard.png` | Admin Dashboard – default Users Management tab |
| `14-admin-tab-amendments.png` | Admin Dashboard – Amendments tab |
| `14-admin-tab-admin.png` | Admin Dashboard – Admin tab |
| `14-admin-tab-submissions-4.png` | Admin Dashboard – Submissions tab |
| `14-admin-tab-system-announcements.png` | Admin Dashboard – System Announcements tab |
| `15-admin-archive.png` | Admin Archive page |
| `16-profile-admin.png` | Profile page (Admin) |
| `17-home-dark-mode-admin.png` | Home – Dark mode *(if theme toggle visible)* |
| `18-notifications-dropdown-admin.png` | Notifications dropdown (Admin) |

---

### 3 · Teacher Role

| File | Description |
|------|-------------|
| `19-home-dashboard-teacher.png` | Home / Dashboard (Teacher) |
| `20-navbar-teacher.png` | Navigation bar – Teacher role |
| `21-amendments-list-teacher.png` | Amendment List page (Teacher view) |
| `22-amendment-create-form.png` | Amendment Create / New Amendment form |
| `23-submissions-teacher.png` | Submissions page (Teacher view) |
| `24-pdf-editor-teacher.png` | PDF Editor page (Teacher – Admin is blocked from this page) |
| `25-signature-setup-teacher.png` | Signature Setup page |
| `26-profile-teacher.png` | Profile page (Teacher) |
| `27-profile-edit-form-teacher.png` | Profile page – Edit form open |

---

### 4 · Head Role

| File | Description |
|------|-------------|
| `28-home-dashboard-head.png` | Home / Dashboard (Head of Department) |
| `29-navbar-head.png` | Navigation bar – Head role (includes PD Approvals link) |
| `30-pd-approvals-head.png` | PD Approvals page – full list |
| `31-pd-approvals-detail-head.png` | PD Approvals page – expanded row / detail |

---

### 5 · Programme Director Role

| File | Description |
|------|-------------|
| `32-home-dashboard-pd.png` | Home / Dashboard (Programme Director) |
| `33-amendments-list-pd.png` | Amendment List page (PD view) |
| `34-pdf-editor-pd.png` | PDF Editor page (Programme Director) |
| `35-submissions-pd.png` | Submissions page (PD view) |

---

### 6 · Access Control / Redirect States

| File | Description |
|------|-------------|
| `36-unauthenticated-redirect-to-login.png` | Attempt to access protected route without auth → redirected to Login |
| `37-non-admin-redirect-from-admin.png` | Non-admin attempt to access /admin → redirected to Home |

---

### 7 · Mobile Viewport (390 × 844 – iPhone 14)

| File | Description |
|------|-------------|
| `38-mobile-login-page.png` | Login page on mobile |
| `39-mobile-home-dashboard-admin.png` | Home dashboard on mobile (Admin) |
| `40-mobile-navbar-open.png` | Mobile navbar – hamburger menu expanded |

---

## Role Permissions Summary

| Page / Feature | Admin | Teacher | Programme Director | Head |
|---|:---:|:---:|:---:|:---:|
| Home / Dashboard | ✅ | ✅ | ✅ | ✅ |
| Amendment List | ✅ | ✅ | ✅ | ✅ |
| Excel Upload | ✅ | — | — | — |
| Submissions | ✅ | ✅ | ✅ | ✅ |
| Admin Dashboard | ✅ | ❌ | ❌ | ❌ |
| Admin Archive | ✅ | ❌ | ❌ | ❌ |
| PDF Editor | ❌ | ✅ | ✅ | ✅ |
| Signature Setup | ❌ | ✅ | ✅ | ✅ |
| Profile | ✅ | ✅ | ✅ | ✅ |
| PD Approvals | ❌ | ❌ | ❌ | ✅ |
