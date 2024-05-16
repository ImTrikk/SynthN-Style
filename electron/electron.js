const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const { Hidden } = require("@mui/material");

const isDev = process.env.IS_DEV == "true" ? true : false;

function createWindow() {
 const mainWindow = new BrowserWindow({
  width: 1080,
  height: 720,
  autoHideMenuBar: true,
  vibrancy: "under-window",
  visualEffectState: "active",
  webPreferences: {
   preload: path.join(__dirname, "preload.js"),
  },
 });

 mainWindow.webContents.setWindowOpenHandler((edata) => {
  shell.openExternal(edata.url);
  return { action: "deny" };
 });

 mainWindow.loadURL(
  isDev
   ? "http://localhost:3000"
   : `file://${path.join(__dirname, "../dist/index.html")}`
 );
 // Open the DevTools.
 if (isDev) {
  //mainWindow.webContents.openDevTools();
 }

 // Start Flask server
 const flaskProcess = spawn("python", ["api/server.py"]);

 flaskProcess.stdout.on("data", (data) => {
  console.log(`Flask: ${data}`);
 });

 flaskProcess.stderr.on("data", (data) => {
  console.error(`Flask Error: ${data}`);
 });
}

app.whenReady().then(() => {
 createWindow();

 app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
 });
});

app.on("window-all-closed", () => {
 if (process.platform !== "darwin") app.quit();
});

ipcMain.on("zoom", (event, direction) => {
 const win = BrowserWindow.getFocusedWindow();
 if (win) {
  const zoomFactor = direction === "in" ? 1.2 : 0.8;
  win.webContents.zoomFactor = zoomFactor;
 }
});
