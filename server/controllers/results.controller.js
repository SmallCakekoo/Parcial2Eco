const playersDb = require("../db/players.db");
const {
  emitEvent,
  emitToSpecificClient,
} = require("../services/socket.service");

// Obtener todos los jugadores con sus puntuaciones
const getPlayers = async (req, res) => {
  try {
    const players = playersDb.getAllPlayers();
    res.status(200).json({ success: true, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar puntuación de un jugador
const updateScore = async (req, res) => {
  try {
    const { socketId, scoreChange, reason } = req.body;

    const updatedPlayer = playersDb.updatePlayerScore(socketId, scoreChange);
    if (!updatedPlayer) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }

    // Emitir evento de actualización de puntuación
    emitEvent("playerScoreUpdated", {
      player: updatedPlayer,
      scoreChange,
      reason,
    });

    // Verificar si hay un ganador
    const winner = playersDb.checkForWinner();
    if (winner) {
      emitEvent("gameEnded", {
        winner: winner.nickname,
        winningScore: winner.score,
        players: playersDb.getAllPlayers(),
      });
    }

    res.status(200).json({
      success: true,
      player: updatedPlayer,
      isWinner: !!winner,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reiniciar el juego
const resetGame = async (req, res) => {
  try {
    playersDb.resetGame();

    // Emitir evento de reinicio a todos los clientes
    emitEvent("gameReset", { message: "Juego reiniciado" });

    res.status(200).json({ success: true, message: "Juego reiniciado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener ganador actual
const getWinner = async (req, res) => {
  try {
    const winner = playersDb.getWinner();
    res.status(200).json({ success: true, winner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPlayers,
  updateScore,
  resetGame,
  getWinner,
};
