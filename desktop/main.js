'use strict';

const path = require('path');
const { app, BrowserWindow, Menu, shell, session } = require('electron');

let mainWindow = null;
let studioServer = null;

function appDataPath(...parts) {
  return path.join(app.getPath('userData'), ...parts);
}

function configureEnvironment() {
  process.env.FOODRANKED_STUDIO_DATA_DIR = process.env.FOODRANKED_STUDIO_DATA_DIR || appDataPath('studio-data');
  process.env.FOODRANKED_STUDIO_RENDER_DIR = process.env.FOODRANKED_STUDIO_RENDER_DIR || appDataPath('renders');
}

function configureDownloads() {
  session.defaultSession.on('will-download', (_event, item) => {
    const fileName = item.getFilename();
    if (!/\.mp4$/i.test(fileName)) return;
    item.setSavePath(path.join(app.getPath('downloads'), fileName));
  });
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#0f141b',
    title: 'FoodRanked Studio',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadURL(url);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function boot() {
  configureEnvironment();
  configureDownloads();
  Menu.setApplicationMenu(null);

  const { startStudioServer } = require('../studio/server');
  studioServer = await startStudioServer({
    host: '127.0.0.1',
    port: 4787,
    renderPortStart: 4290
  });
  createWindow(studioServer.url);
}

app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
});

app.whenReady().then(boot).catch(error => {
  console.error(error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (studioServer?.server) studioServer.server.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (!mainWindow && studioServer?.url) createWindow(studioServer.url);
});
