# ⚡ Quick Start - Get Running in 5 Minutes

## Windows 11 Users - Fastest Way to Run

### First Time Setup:

1. **Install Prerequisites** (if you don't have them):
   - [Node.js](https://nodejs.org/) - Download and install
   - [Rust](https://rustup.rs/) - Download and install
   - [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) - Select "Desktop development with C++"

2. **Open PowerShell in the project directory** and run:
   ```powershell
   .\setup-windows.ps1
   ```
   
   Or manually:
   ```powershell
   npm install
   cd ui
   npm install
   cd ..
   ```

3. **Run the app:**
   ```powershell
   npm run dev
   ```
   
   **OR** just double-click `run-dev.bat` in File Explorer!

---

## Already Have Everything Installed?

Just run:
```powershell
npm run dev
```

Or double-click: **`run-dev.bat`**

---

## Mac Users

```bash
# First time
npm install
cd ui && npm install && cd ..

# Run the app
npm run dev
```

---

## That's it! 🎉

The app will automatically:
- Install any missing dependencies
- Start the Vite dev server
- Launch the Tauri desktop app

The first launch might take 5-10 minutes to compile Rust dependencies.
Subsequent launches are much faster!

