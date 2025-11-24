const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const isMac = process.platform === 'darwin';

  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 1100,
    minHeight: 700,
    frame: !isMac, // Frameless on Mac, default frame on Windows/Linux
    titleBarStyle: isMac ? 'hidden' : 'default', // Hidden title bar on Mac for traffic lights
    trafficLightPosition: isMac ? { x: 15, y: 12 } : undefined, // Adjust traffic light position on Mac
    transparent: true, // Transparent background
    vibrancy: isMac ? 'fullscreen-ui' : undefined, // macOS blur effect
    visualEffectState: 'active', // Keep blur active when window is inactive
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simple setup as requested, though contextIsolation: true is more secure
    },
    backgroundColor: 'rgba(0, 0, 0, 0)' // Fully transparent hex
  });

  // Load the angular app
  // In development, we can load from localhost if serving, or from dist if building.
  // For this setup, we'll assume we build the app or serve it.
  // Let's try to load from the dist folder for production-like behavior, 
  // or localhost for dev.

  // Check if we are in dev mode (you can pass a flag or check env)
  const isDev = process.argv.includes('--dev');

  if (isDev) {
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/time-blocking/browser/index.html'));
  }

  // IPC listeners
  const { ipcMain } = require('electron');
  ipcMain.on('window-close', () => win.close());
  ipcMain.on('window-minimize', () => win.minimize());
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
