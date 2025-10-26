# 🪟 Windows 11 Setup Guide for AndRate

## Step-by-Step Setup

### 1️⃣ Install Prerequisites

#### Install Node.js
1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Run the installer and follow the prompts
3. Verify installation:
```powershell
node --version
npm --version
```

#### Install Rust
1. Download and run rustup from [https://rustup.rs/](https://rustup.rs/)
   - Or use winget:
   ```powershell
   winget install --id Rustlang.Rustup
   ```
2. Restart your terminal/PowerShell
3. Verify installation:
```powershell
rustc --version
cargo --version
```

#### Install Visual Studio Build Tools
This is **required** for Rust to compile on Windows.

1. Download [Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. Run the installer
3. Select **"Desktop development with C++"**
4. Click Install (this may take 10-15 minutes)

#### WebView2 (Usually Already Installed)
Windows 11 typically has this pre-installed. If not, download from [Microsoft](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

---

### 2️⃣ Clone and Setup the Project

Open PowerShell or Windows Terminal and run:

```powershell
# Clone the repository
git clone https://github.com/<yourusername>/AndRate.git
cd AndRate

# Install root dependencies (Tauri CLI)
npm install

# Install frontend dependencies
npm run install-deps
```

---

### 3️⃣ Run the App in Development Mode

```powershell
npm run dev
```

This will:
- Install any missing dependencies
- Start the Vite dev server (frontend)
- Launch the Tauri app with live reload

**The app window should open automatically!** 🎉

---

### 4️⃣ Build a Production App (Optional)

To create a distributable `.exe` and `.msi` installer:

```powershell
npm run build
```

The built files will be in:
```
src-tauri\target\release\bundle\msi\AndRate_0.1.0_x64_en-US.msi
src-tauri\target\release\AndRate.exe
```

---

## 🐛 Troubleshooting

### "cargo: command not found"
- Restart your terminal/PowerShell after installing Rust
- Make sure `~/.cargo/bin` is in your PATH

### "link.exe not found" or "MSVC not found"
- You need Visual Studio Build Tools with C++ development tools
- Make sure you selected "Desktop development with C++" during installation

### "npm: command not found"
- Restart your terminal after installing Node.js
- Verify Node.js is in your PATH

### Port 5173 already in use
- Another app is using the Vite dev server port
- Kill the process or change the port in `ui/vite.config.ts`

### WebView2 not found
- Download and install from [Microsoft WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

---

## 🚀 Quick Reference Commands

```powershell
# Install dependencies
npm run install-deps

# Run in development mode
npm run dev

# Build production app
npm run build

# Run Tauri CLI commands directly
npm run tauri -- <command>

# Example: Check Tauri info
npm run tauri -- info
```

---

## 📝 Notes

- First build may take 5-10 minutes as Rust compiles all dependencies
- Subsequent builds are much faster (incremental compilation)
- Dev mode supports hot reload - changes appear instantly!

---

Enjoy your cross-platform app! 🎬🎌

