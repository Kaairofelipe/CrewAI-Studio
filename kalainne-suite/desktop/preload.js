const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("kalainneDesktop", {
  version: "1.0.0",
});
