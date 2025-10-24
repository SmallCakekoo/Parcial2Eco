const express = require("express");
const path = require("path");
const { createServer } = require("http");
const cors = require("cors");

const playersRouter = require("./server/routes/players.router");
const gameRouter = require("./server/routes/game.router");
const resultsRouter = require("./server/routes/results.router");
const { initSocketInstance } = require("./server/services/socket.service");

const PORT = process.env.PORT || 5050;

const app = express();
const httpServer = createServer(app);

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://tu-frontend.vercel.app',
        'https://tu-dominio.com'
      ]
    : ['http://localhost:3000', 'http://localhost:5173'], // Para desarrollo local
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use("/game", express.static(path.join(__dirname, "game")));
app.use("/results", express.static(path.join(__dirname, "results-screen")));
app.use("/assets", express.static(path.join(__dirname, "game", "assets")));
app.use("/screens", express.static(path.join(__dirname, "game", "screens")));
app.use("/styles.css", express.static(path.join(__dirname, "game", "styles.css")));
app.use("/app.js", express.static(path.join(__dirname, "game", "app.js")));

// Routes
app.use("/api", playersRouter);
app.use("/api/game", gameRouter);
app.use("/api/results", resultsRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "game", "index.html"));
});

// Health check endpoint para Vercel
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Services
initSocketInstance(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app; // Exportar para Vercel