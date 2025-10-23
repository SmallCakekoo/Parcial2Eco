import { navigateTo, socket, makeRequest } from "../app.js";

export default function renderGameGround(data) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="game-ground">
      <div id="player-info">
        <h2 id="game-nickname-display">${data.nickname}</h2>
        <p>Tu rol es:</p>
        <h2 id="role-display">${data.role}</h2>
        <div id="score-display">
          <h3>Puntuación: <span id="current-score">0</span> pts</h3>
        </div>
      </div>
      <h2 id="shout-display"></h2>
      <div id="pool-players"></div>
      <button id="shout-button">Gritar ${data.role}</button>
    </div>
  `;

  const nickname = data.nickname;
  const polos = [];
  const myRole = data.role;
  const shoutbtn = document.getElementById("shout-button");
  const shoutDisplay = document.getElementById("shout-display");
  const container = document.getElementById("pool-players");
  const currentScoreElement = document.getElementById("current-score");

  // Función para actualizar la puntuación del jugador
  async function updatePlayerScore() {
    try {
      const response = await makeRequest("/api/results/players", "GET");
      if (response.success) {
        const myPlayer = response.players.find(
          (player) => player.nickname === nickname
        );
        if (myPlayer) {
          currentScoreElement.textContent = myPlayer.score || 0;
        }
      }
    } catch (error) {
      console.error("Error updating player score:", error);
    }
  }

  // Actualizar puntuación inicial
  updatePlayerScore();

  if (myRole !== "marco") {
    shoutbtn.style.display = "none";
  }

  shoutDisplay.style.display = "none";

  // Replace socket.emit with HTTP requests
  shoutbtn.addEventListener("click", async () => {
    if (myRole === "marco") {
      await makeRequest("/api/game/marco", "POST", {
        socketId: socket.id,
      });
    }
    if (myRole === "polo" || myRole === "polo-especial") {
      await makeRequest("/api/game/polo", "POST", {
        socketId: socket.id,
      });
    }
    shoutbtn.style.display = "none";
  });

  // Add event listener to the container for all buttons: this is called event delegation
  container.addEventListener("click", async function (event) {
    if (event.target.tagName === "BUTTON") {
      const key = event.target.dataset.key;
      await makeRequest("/api/game/select-polo", "POST", {
        socketId: socket.id,
        poloId: key,
      });
    }
  });

  // Keep socket.on listeners for receiving notifications
  socket.on("notification", (data) => {
    console.log("Notification", data);
    if (myRole === "marco") {
      container.innerHTML =
        "<p>Haz click sobre el polo que quieres escoger:</p>";
      polos.push(data);
      polos.forEach((elemt) => {
        const button = document.createElement("button");
        button.innerHTML = `Un jugador gritó: ${elemt.message}`;
        button.setAttribute("data-key", elemt.userId);
        container.appendChild(button);
      });
    } else {
      shoutbtn.style.display = "block";
      shoutDisplay.innerHTML = `Marco ha gritado: ${data.message}`;
      shoutDisplay.style.display = "block";
    }
  });

  // Listen for score updates
  socket.on("playerScoreUpdated", (data) => {
    console.log("Score updated:", data);
    updatePlayerScore(); // Actualizar puntuación cuando cambie
  });

  // Listen for game reset
  socket.on("gameReset", () => {
    console.log("Game reset");
    updatePlayerScore(); // Actualizar puntuación después del reinicio
  });

  // Keep socket.on listeners for game over notification
  socket.on("notifyGameOver", (data) => {
    navigateTo("/gameOver", { message: data.message, nickname });
  });
}
