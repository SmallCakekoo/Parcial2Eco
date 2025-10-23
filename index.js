const express = require("express");
const path = require("path");
const { createServer } = require("http");

const playersRouter = require("./server/routes/players.router");
const gameRouter = require("./server/routes/game.router");
const resultsRouter = require("./server/routes/results.router");
const { initSocketInstance } = require("./server/services/socket.service");

const PORT = 5050;

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(express.json());
app.use("/game", express.static(path.join(__dirname, "game")));
app.use("/results", express.static(path.join(__dirname, "results-screen")));
// Serve game assets for root route
app.use("/assets", express.static(path.join(__dirname, "game", "assets")));
app.use("/screens", express.static(path.join(__dirname, "game", "screens")));
app.use(
  "/styles.css",
  express.static(path.join(__dirname, "game", "styles.css"))
);
app.use("/app.js", express.static(path.join(__dirname, "game", "app.js")));

// Routes
app.use("/api", playersRouter);
app.use("/api/game", gameRouter);
app.use("/api/results", resultsRouter);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "game", "index.html"));
});

// Services
initSocketInstance(httpServer);

httpServer.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
  console.log(`Results screen running at http://localhost:${PORT}/results`),
  console.log(`Game running at http://localhost:${PORT}/game`),
  console.log(`TERMINÉEEEEEEE, feliz`),

);
