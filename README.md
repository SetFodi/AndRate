Perfect 🎉 Let’s give your project a **fancy markdown README** that looks great on GitHub **and** speaks directly to what your Tauri + React app does (Anime/Movies/TV library with TMDB + AniList integration).  

Here’s a stylish `README.md` you can copy into your root folder:

---

# 🎬 AndRate

> A modern cross‑platform desktop app built with [Tauri](https://tauri.app/), [Rust](https://www.rust-lang.org/), and [React](https://react.dev/) for browsing, searching, and managing your Anime 🎌, TV Shows 📺, and Movies 🎥.  
> Powered by [AniList GraphQL](https://anilist.co/) and [TMDB API](https://www.themoviedb.org/).

---

## ✨ Features

✅ **Multi‑Source Search**
- Anime results from AniList GraphQL API  
- TV and Movie results from TMDB API  

✅ **Your Personal Library**
- Register / Login locally (credentials safely hashed with **Argon2** 🔐)  
- Track shows & movies by status: _watching, planning, completed, abandoned_  
- Add your own ratings ⭐  

✅ **Beautiful Interface**
- Built with **React + Vite + TailwindCSS**  
- Smooth animations with **Framer Motion**  
- Dark mode 🌙 and responsive layout  

✅ **Cross Platform & Lightweight**
- Powered by **Tauri** (Rust backend + web frontend)  
- Tiny install size compared to Electron apps  
- Runs natively on macOS (with `.app` + `.dmg` bundle)  

---

## 🖼️ Screenshots
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/20520bf2-2630-4929-ac08-8695b64a9450" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/a656e148-3da1-4157-a84e-6450f66b1807" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/7bb13e7b-1229-4779-9dd4-61442ec7dd9f" />



## 🛠️ Tech Stack

- 🎨 **Frontend:** React, Vite, TailwindCSS, Framer Motion  
- ⚡ **Backend:** Tauri Core (Rust + Tokio + Reqwest)  
- 🗄️ **Database:** SQLite (via Rusqlite) with WAL journaling  
- 🔑 **Security:** Argon2 password hashing  
- 🌐 **APIs:** AniList GraphQL, TMDB REST  

---

## 🚀 Getting Started

> **⚡ Want to run this quickly?** → [QUICKSTART.md](QUICKSTART.md)  
> **🪟 Windows Users:** See detailed setup instructions in [WINDOWS_SETUP.md](WINDOWS_SETUP.md)

### Prerequisites

#### For Windows 11:
1. **Node.js** (v16+): [Download here](https://nodejs.org/)
2. **Rust**: Install via [rustup](https://rustup.rs/)
   ```powershell
   # Run this in PowerShell
   winget install --id Rustlang.Rustup
   ```
3. **Visual Studio C++ Build Tools**: Required for Rust on Windows
   - Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
   - During installation, select "Desktop development with C++"
4. **WebView2**: Usually pre-installed on Windows 11, but if needed: [Download here](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

#### For macOS:
1. **Node.js** (v16+): Install via [Homebrew](https://brew.sh/) or [nodejs.org](https://nodejs.org/)
2. **Rust**: Install via [rustup](https://rustup.rs/)
3. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```

---

### Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/<yourusername>/AndRate.git
cd AndRate
```

### 2. Install dependencies

**Windows (with automated setup):**
```powershell
.\setup-windows.ps1
```

**Mac/Linux or Manual:**
```bash
npm run install-deps
```
Or manually:
```bash
cd ui
npm install
cd ..
```

### 3. Run in dev mode
```bash
npm run dev
```
This starts Vite dev server + Rust backend with live reload.

**Alternative (if you have Tauri CLI installed globally):**
```bash
cargo tauri dev
```

### 4. Build the app

#### For Windows (`.exe` + `.msi`):
```bash
npm run build
```
Built bundles will be in:
```
src-tauri/target/release/bundle/msi/AndRate_0.1.0_x64_en-US.msi
src-tauri/target/release/AndRate.exe
```

#### For macOS (`.app` + `.dmg`):
```bash
npm run build
```
Built bundles will be in:
```
src-tauri/target/release/bundle/macos/AndRate.app
src-tauri/target/release/bundle/dmg/AndRate_0.1.0_aarch64.dmg
```

---

## 📦 Project Structure
```
AndRate/
 ├─ ui/                 # Frontend (React + Vite)
 │   ├─ src/            # React source files
 │   ├─ public/         # Static assets
 │   └─ package.json
 │
 └─ src-tauri/          # Backend (Rust + Tauri)
     ├─ src/            # Rust commands, DB, API handlers
     ├─ icons/          # App icons for bundling
     ├─ tauri.conf.json # Tauri config
     └─ Cargo.toml
```

---

## 🔑 API Keys
- **TMDB API Key** is currently hardcoded in `lib.rs` (`TMDB_API_KEY`).  
- For AniList, no API key is needed.  

⚠️ Reminder: Never expose real secrets in production builds. For local/personal use, this is fine.

---

## 💡 Roadmap
- [ ] Add user ratings sync between devices  
- [ ] Add streaming links / trailers  
- [ ] Improve library statistics  
- [ ] Cross‑platform builds for Windows & Linux  

---

## 🤝 Contributing
Pull requests are welcome! For major changes, open an issue first to discuss what you’d like to change.  
Make sure to run **`cargo fmt`** and **`npm run lint`** before submitting.

---

CREDITS TO TMDB, ANILIST API
Enjoy your movies, shows and anime! 🎉

---

