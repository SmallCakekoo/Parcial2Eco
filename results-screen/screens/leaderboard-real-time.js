import { navigateTo, socket, makeRequest } from "../app.js";

export default function renderLeaderboardRealTime(data) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="container">
      <h1>🏆 Resultados en Tiempo Real</h1>
      <div id="players-container">
        <table class="players-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Jugador</th>
              <th>Rol</th>
              <th>Puntuación</th>
            </tr>
          </thead>
          <tbody id="players-table-body">
            <tr>
              <td colspan="4" class="no-players">Cargando jugadores...</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="controls">
        <button id="reset-game-btn" class="reset">🔄 Reiniciar Juego</button>
      </div>
    </div>
  `;

  const playersTableBody = document.getElementById("players-table-body");
  const resetGameBtn = document.getElementById("reset-game-btn");

  // Función para actualizar la tabla de jugadores
  function updatePlayersTable(players) {
    if (!players || players.length === 0) {
      playersTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="no-players">No hay jugadores conectados</td>
        </tr>
      `;
      return;
    }

    playersTableBody.innerHTML = players
      .map(
        (player) => `
      <tr>
        <td>
          <span class="status-indicator status-online"></span>
          Conectado
        </td>
        <td class="player-name">${player.nickname}</td>
        <td class="player-role">${player.role || "Sin rol"}</td>
        <td class="player-score">${player.score || 0} pts</td>
      </tr>
    `
      )
      .join("");
  }

  // Función para obtener datos de jugadores
  async function fetchPlayersData() {
    try {
      const response = await makeRequest("/api/results/players", "GET");
      if (response.success) {
        updatePlayersTable(response.players);
      }
    } catch (error) {
      console.error("Error fetching players data:", error);
    }
  }

  // Event listeners para Socket.IO
  socket.on("userJoined", (gameData) => {
    console.log("Usuario se unió:", gameData);
    updatePlayersTable(gameData.players);
  });

  socket.on("playerScoreUpdated", (playerData) => {
    console.log("Puntuación actualizada:", playerData);
    fetchPlayersData(); // Refrescar datos
  });

  socket.on("gameReset", () => {
    console.log("Juego reiniciado");
    fetchPlayersData(); // Refrescar datos
  });

  socket.on("gameEnded", (winnerData) => {
    console.log("Juego terminado:", winnerData);
    navigateTo("/final", winnerData);
  });

  // Event listener para el botón de reinicio
  resetGameBtn.addEventListener("click", async () => {
    try {
      const response = await makeRequest("/api/results/reset-game", "POST");
      if (response.success) {
        console.log("Juego reiniciado exitosamente");
        fetchPlayersData();
      } else {
        console.error("Error al reiniciar el juego:", response.error);
      }
    } catch (error) {
      console.error("Error al reiniciar el juego:", error);
    }
  });

  // Cargar datos iniciales
  fetchPlayersData();

  // Actualizar datos cada 5 segundos como respaldo
  setInterval(fetchPlayersData, 5000);
}
