const express = require("express");
const router = express.Router();
const {
  getPlayers,
  updateScore,
  resetGame,
  getWinner,
} = require("../controllers/results.controller");

// GET /api/results/players - Obtener todos los jugadores
router.get("/players", getPlayers);

// POST /api/results/update-score - Actualizar puntuación de un jugador
router.post("/update-score", updateScore);

// POST /api/results/reset-game - Reiniciar el juego
router.post("/reset-game", resetGame);

// GET /api/results/winner - Obtener ganador actual
router.get("/winner", getWinner);

module.exports = router;
