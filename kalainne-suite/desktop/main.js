const { app, BrowserWindow } = require("electron");
const path = require("path");

const webUrl = process.env.KALAINNE_WEB_URL || "http://localhost:3000";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: "#0A0A0A",
    title: "Kalaïnne Launch OS",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.loadURL(webUrl);
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
