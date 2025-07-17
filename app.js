"use strict";

const express = require("express");
const path = require("path");

// Ensure Java is installed before starting the server
async function prepareJava() {
  const { installJava } = require("./scripts/install-java");
  const result = await installJava();
  if (!result.success) {
    console.error("Java is required but could not be installed.");
    process.exit(1);
  }
}

async function startServer() {
  await prepareJava();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, "public")));

  // Main route serving index.html
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });
}

startServer();
