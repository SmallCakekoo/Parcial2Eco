import { navigateTo, socket, makeRequest } from "../app.js";

export default function renderLeaderboardFinalScreen(data) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="container">
      <div class="winner-display">
        <div class="winner-name">🎉 ¡${
          data.winner || "Ganador"
        } ha ganado! 🎉</div>
        <p>¡Felicidades por alcanzar ${data.winningScore || 100}+ puntos!</p>
      </div>
      
      <h2>🏆 Tabla de Posiciones Final</h2>
      <div class="controls">
        <button id="sort-score-btn">📊 Ordenar por Puntuación</button>
        <button id="sort-alphabetical-btn" class="alphabetical">🔤 Ordenar Alfabéticamente</button>
        <button id="back-to-realtime-btn">⏱️ Ver Tiempo Real</button>
        <button id="reset-game-btn" class="reset">🔄 Reiniciar Juego</button>
      </div>
      
      <div id="leaderboard-container">
        <ol class="leaderboard-list" id="leaderboard-list">
          <li>Cargando resultados...</li>
        </ol>
      </div>
    </div>
  `;

  const leaderboardList = document.getElementById("leaderboard-list");
  const sortScoreBtn = document.getElementById("sort-score-btn");
  const sortAlphabeticalBtn = document.getElementById("sort-alphabetical-btn");
  const backToRealtimeBtn = document.getElementById("back-to-realtime-btn");
  const resetGameBtn = document.getElementById("reset-game-btn");

  let currentPlayers = [];
  let sortByScore = true;

  // Función para actualizar la lista de líderes
  function updateLeaderboard(players, sortByScore = true) {
    if (!players || players.length === 0) {
      leaderboardList.innerHTML = `
        <li class="no-players">No hay jugadores para mostrar</li>
      `;
      return;
    }

    let sortedPlayers;
    if (sortByScore) {
      // Ordenar por puntuación (mayor a menor)
      sortedPlayers = [...players].sort(
        (a, b) => (b.score || 0) - (a.score || 0)
      );
    } else {
      // Ordenar alfabéticamente por nombre
      sortedPlayers = [...players].sort((a, b) =>
        a.nickname.localeCompare(b.nickname)
      );
    }

    leaderboardList.innerHTML = sortedPlayers
      .map((player, index) => {
        const position = sortByScore ? index + 1 : "";
        const score = player.score || 0;
        const role = player.role || "Sin rol";

        return `
        <li>
          ${sortByScore ? `${position}. ` : ""}${player.nickname} 
          ${sortByScore ? `(${score} pts)` : `- ${score} pts - ${role}`}
        </li>
      `;
      })
      .join("");
  }

  // Función para obtener datos de jugadores
  async function fetchPlayersData() {
    try {
      const response = await makeRequest("/api/results/players", "GET");
      if (response.success) {
        currentPlayers = response.players;
        updateLeaderboard(currentPlayers, sortByScore);
      }
    } catch (error) {
      console.error("Error fetching players data:", error);
    }
  }

  // Event listeners para Socket.IO
  socket.on("gameReset", () => {
    console.log("Juego reiniciado desde pantalla final");
    navigateTo("/", {}); // Volver a la vista de tiempo real
  });

  // Event listeners para los botones
  sortScoreBtn.addEventListener("click", () => {
    sortByScore = true;
    updateLeaderboard(currentPlayers, true);
    sortScoreBtn.style.backgroundColor = "#2980b9";
    sortAlphabeticalBtn.style.backgroundColor = "#9b59b6";
  });

  sortAlphabeticalBtn.addEventListener("click", () => {
    sortByScore = false;
    updateLeaderboard(currentPlayers, false);
    sortAlphabeticalBtn.style.backgroundColor = "#8e44ad";
    sortScoreBtn.style.backgroundColor = "#3498db";
  });

  backToRealtimeBtn.addEventListener("click", () => {
    navigateTo("/", {});
  });

  resetGameBtn.addEventListener("click", async () => {
    try {
      const response = await makeRequest("/api/results/reset-game", "POST");
      if (response.success) {
        console.log("Juego reiniciado exitosamente");
        navigateTo("/", {}); // Volver a la vista de tiempo real
      } else {
        console.error("Error al reiniciar el juego:", response.error);
      }
    } catch (error) {
      console.error("Error al reiniciar el juego:", error);
    }
  });

  // Cargar datos iniciales
  fetchPlayersData();

  // Establecer el estilo inicial del botón de puntuación como activo
  sortScoreBtn.style.backgroundColor = "#2980b9";
}
