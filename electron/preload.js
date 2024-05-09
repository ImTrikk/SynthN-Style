const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
 const replaceText = (selector, text) => {
  const element = document.getElementById(selector);
  if (element) element.innerText = text;
 };

 for (const dependency of ["chrome", "node", "electron"]) {
  replaceText(`${dependency}-version`, process.versions[dependency]);
 }
});

// preload.js

contextBridge.exposeInMainWorld("zoomAPI", {
 zoomIn: () => {
  ipcRenderer.send("zoom", "in");
 },
 zoomOut: () => {
  ipcRenderer.send("zoom", "out");
 },
});

document.addEventListener("keydown", (event) => {
 if (event.ctrlKey && event.code === "Equal") {
  // Ctrl + = (zoom in)
  ipcRenderer.send("zoom", "in");
 }
 if (event.ctrlKey && event.code === "Minus") {
  // Ctrl + - (zoom out)
  ipcRenderer.send("zoom", "out");
 }
});
