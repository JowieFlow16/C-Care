const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const isDev = !app.isPackaged;
const FLASK_PORT = 5000;
let flaskProcess = null;
let mainWindow = null;

function startFlask() {
  const pythonExe = isDev
    ? 'python'
    : path.join(process.resourcesPath, 'backend', 'python', 'python.exe');

  const scriptPath = isDev
    ? path.join(__dirname, '..', '..', 'backend', 'app.py')
    : path.join(process.resourcesPath, 'backend', 'app.py');

  flaskProcess = spawn(pythonExe, [scriptPath], {
    env: { ...process.env, FLASK_ENV: 'production' },
    cwd: isDev ? path.join(__dirname, '..', '..', 'backend') : path.join(process.resourcesPath, 'backend'),
  });

  flaskProcess.stdout.on('data', d => console.log('[Flask]', d.toString()));
  flaskProcess.stderr.on('data', d => console.error('[Flask]', d.toString()));
}

function waitForFlask(cb, retries = 30) {
  http.get(`http://localhost:${FLASK_PORT}/api/auth/setup-status`, res => {
    if (res.statusCode === 200) cb();
    else retry();
  }).on('error', () => retry());

  function retry() {
    if (retries <= 0) { cb(); return; }
    setTimeout(() => waitForFlask(cb, retries - 1), 500);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "C-Care — by Convergence",
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    backgroundColor: '#f5f5f5',
  });

  const url = isDev
    ? 'http://localhost:5173'
    : `http://localhost:${FLASK_PORT}`;

  mainWindow.loadURL(url);
  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  if (!isDev) {
    startFlask();
    waitForFlask(createWindow);
  } else {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (flaskProcess) flaskProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (flaskProcess) flaskProcess.kill();
});
