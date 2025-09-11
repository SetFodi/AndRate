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



## 🛠️ Tech Stack

- 🎨 **Frontend:** React, Vite, TailwindCSS, Framer Motion  
- ⚡ **Backend:** Tauri Core (Rust + Tokio + Reqwest)  
- 🗄️ **Database:** SQLite (via Rusqlite) with WAL journaling  
- 🔑 **Security:** Argon2 password hashing  
- 🌐 **APIs:** AniList GraphQL, TMDB REST  

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/<yourusername>/AndRate.git
cd AndRate
```

### 2. Install dependencies
```bash
cd ui
npm install
```

### 3. Run in dev mode
```bash
cd ..
npx tauri dev
```
This starts Vite dev server + Rust backend with live reload.

### 4. Build app (macOS `.app` + `.dmg`)
```bash
cargo tauri build
```

The built bundles will be inside:
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

