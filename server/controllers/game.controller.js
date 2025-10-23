const playersDb = require("../db/players.db");
const {
  emitEvent,
  emitToSpecificClient,
} = require("../services/socket.service");

const joinGame = async (req, res) => {
  try {
    const { nickname, socketId } = req.body;
    playersDb.addPlayer(nickname, socketId);

    const gameData = playersDb.getGameData();
    emitEvent("userJoined", gameData);

    res.status(200).json({ success: true, players: gameData.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startGame = async (req, res) => {
  try {
    const playersWithRoles = playersDb.assignPlayerRoles();

    playersWithRoles.forEach((player) => {
      emitToSpecificClient(player.id, "startGame", player.role);
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyMarco = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole([
      "polo",
      "polo-especial",
    ]);

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Marco!!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyPolo = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole("marco");

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Polo!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const endTurn = async (req, res) => {
  try {
    const { socketId } = req.body;

    const myUser = playersDb.findPlayerById(socketId);
    const allPlayers = playersDb.getAllPlayers();

    // Logs de consola para debugging
    console.log("=== FIN DE TURNO ===");
    console.log("Jugador:", myUser.nickname, "| Rol:", myUser.role);

    // Verificar que el jugador sea Polo especial
    if (myUser.role !== "polo-especial") {
      console.log("❌ ERROR: Solo Polo especial puede terminar turno");
      return res
        .status(400)
        .json({ error: "Solo Polo especial puede terminar turno" });
    }

    // Polo especial no fue atrapado: +10 pts
    console.log(
      "✅ Polo especial no fue atrapado - Aplicando recompensa de +10 puntos"
    );

    const poloScoreBefore = myUser.score;
    playersDb.updatePlayerScore(socketId, 10);
    const poloScoreAfter = playersDb.findPlayerById(socketId).score;

    console.log("Puntos después - Polo especial:", poloScoreAfter);
    console.log(
      "Cambio de puntos - Polo especial: +10 (recompensa por no ser atrapado)"
    );

    // Emitir actualización de puntuación
    emitEvent("playerScoreUpdated", {
      player: playersDb.findPlayerById(socketId),
      scoreChange: 10,
      reason: "Polo especial no fue atrapado (recompensa)",
    });

    // Verificar si hay un ganador después de actualizar puntuaciones
    const winner = playersDb.checkForWinner();
    if (winner) {
      console.log(
        "🏆 GANADOR DETECTADO:",
        winner.nickname,
        "con",
        winner.score,
        "puntos"
      );
      emitEvent("gameEnded", {
        winner: winner.nickname,
        winningScore: winner.score,
        players: playersDb.getAllPlayers(),
      });
    }

    // Notificar que el turno terminó y el Polo especial ganó puntos
    allPlayers.forEach((player) => {
      emitToSpecificClient(player.id, "turnEnded", {
        message: `El Polo especial ${myUser.nickname} no fue atrapado - +10 puntos`,
      });
    });

    console.log("=== FIN DE TURNO ===\n");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ ERROR en endTurn:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const selectPolo = async (req, res) => {
  try {
    const { socketId, poloId } = req.body;

    const myUser = playersDb.findPlayerById(socketId);
    const poloSelected = playersDb.findPlayerById(poloId);
    const allPlayers = playersDb.getAllPlayers();

    // Logs de consola para debugging
    console.log("=== CAPTURA REALIZADA ===");
    console.log("Atacante:", myUser.nickname, "| Rol:", myUser.role);
    console.log("Víctima:", poloSelected.nickname, "| Rol:", poloSelected.role);
    console.log(
      "Puntos antes - Atacante:",
      myUser.score,
      "| Víctima:",
      poloSelected.score
    );

    // Verificar que el atacante sea Marco
    if (myUser.role !== "marco") {
      console.log("❌ ERROR: Solo Marco puede atrapar jugadores");
      return res
        .status(400)
        .json({ error: "Solo Marco puede atrapar jugadores" });
    }

    if (poloSelected.role === "polo-especial") {
      // Marco atrapa Polo especial: Marco +50 pts, Polo especial -10 pts
      console.log(
        "Marco atrapó Polo especial - Aplicando cambios de puntaje"
      );

      const marcoScoreBefore = myUser.score;
      const poloScoreBefore = poloSelected.score;

      playersDb.updatePlayerScore(socketId, 50);
      playersDb.updatePlayerScore(poloId, -10);

      const marcoScoreAfter = playersDb.findPlayerById(socketId).score;
      const poloScoreAfter = playersDb.findPlayerById(poloId).score;

      console.log(
        "Puntos después - Marco:",
        marcoScoreAfter,
        "| Polo especial:",
        poloScoreAfter
      );
      console.log("Cambio de puntos - Marco: +50", "| Polo especial: -10");

      // Emitir actualización de puntuaciones
      emitEvent("playerScoreUpdated", {
        player: playersDb.findPlayerById(socketId),
        scoreChange: 50,
        reason: "Marco atrapó Polo especial",
      });

      emitEvent("playerScoreUpdated", {
        player: playersDb.findPlayerById(poloId),
        scoreChange: -10,
        reason: "Polo especial fue atrapado",
      });

      // Verificar si hay un ganador después de actualizar puntuaciones
      const winner = playersDb.checkForWinner();
      if (winner) {
        console.log(
          "🏆 GANADOR DETECTADO:",
          winner.nickname,
          "con",
          winner.score,
          "puntos"
        );
        emitEvent("gameEnded", {
          winner: winner.nickname,
          winningScore: winner.score,
          players: playersDb.getAllPlayers(),
        });
      }

      // Notify all players that the game is over
      allPlayers.forEach((player) => {
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: `El marco ${myUser.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`,
        });
      });
    } else {
      // Marco atrapa Polo normal: Marco pierde -10 pts, Polo normal gana +10 pts
      console.log(
        "Marco atrapó Polo normal - Aplicando penalización de -10 puntos a Marco y +10 puntos a Polo"
      );

      const marcoScoreBefore = myUser.score;
      const poloScoreBefore = poloSelected.score;

      playersDb.updatePlayerScore(socketId, -10);
      playersDb.updatePlayerScore(poloId, 10);

      const marcoScoreAfter = playersDb.findPlayerById(socketId).score;
      const poloScoreAfter = playersDb.findPlayerById(poloId).score;

      console.log(
        "Puntos después - Marco:",
        marcoScoreAfter,
        "| Polo normal:",
        poloScoreAfter
      );
      console.log(
        "Cambio de puntos - Marco: -10 (penalización por no atrapar Polo especial) | Polo normal: +10 (recompensa por ser atrapado)"
      );

      // Emitir actualización de puntuación para Marco
      emitEvent("playerScoreUpdated", {
        player: playersDb.findPlayerById(socketId),
        scoreChange: -10,
        reason: "Marco no atrapó Polo especial (penalización)",
      });

      // Emitir actualización de puntuación para Polo normal
      emitEvent("playerScoreUpdated", {
        player: playersDb.findPlayerById(poloId),
        scoreChange: 10,
        reason: "Polo normal fue atrapado (recompensa)",
      });

      // Verificar si hay un ganador después de actualizar puntuaciones
      const winner = playersDb.checkForWinner();
      if (winner) {
        console.log(
          "🏆 GANADOR DETECTADO:",
          winner.nickname,
          "con",
          winner.score,
          "puntos"
        );
        emitEvent("gameEnded", {
          winner: winner.nickname,
          winningScore: winner.score,
          players: playersDb.getAllPlayers(),
        });
      }

      // Notificar que Marco atrapó a un Polo normal y ambos cambiaron puntos
      allPlayers.forEach((player) => {
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: `El marco ${myUser.nickname} atrapó a ${poloSelected.nickname} (Polo normal) - Marco -10 pts, ${poloSelected.nickname} +10 pts`,
        });
      });
    }

    console.log("=== FIN DE CAPTURA ===\n");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ ERROR en selectPolo:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  joinGame,
  startGame,
  notifyMarco,
  notifyPolo,
  endTurn,
  selectPolo,
};
