# Cliente Results-Screen

Este cliente muestra los resultados del juego en tiempo real y la pantalla final de ganador.

## Características

### Vista 1: Resultados en Tiempo Real

- Muestra una tabla con todos los jugadores conectados y sus puntajes actuales
- Se actualiza automáticamente cuando un usuario se conecta
- Las puntuaciones se actualizan en tiempo real mediante Socket.IO
- Botón para reiniciar el juego

### Vista 2: Pantalla Final de Ganador

- Se activa cuando cualquier jugador alcance ≥100 puntos
- Muestra el nombre del ganador y la lista de todos los jugadores ordenada de mayor a menor
- Botón "Ordenar alfabéticamente" para reorganizar la lista por nombre
- Botón "Reiniciar Juego" para limpiar todas las puntuaciones

## Lógica de Puntuaciones

- **Marco atrapa Polo especial**: Marco +50 pts, Polo especial -10 pts
- **Marco no atrapa Polo especial**: Marco -10 pts, Polo +10 pts
- **Polo especial no es atrapado**: Polo especial +10 pts
- **Polo especial es atrapado**: Polo especial -10 pts

## Cómo usar

1. Inicia el servidor: `npm start`
2. Abre el cliente results-screen en: `http://localhost:5050/results`
3. El cliente se conectará automáticamente y mostrará los jugadores en tiempo real
4. Cuando un jugador alcance 100+ puntos, se mostrará la pantalla de ganador

## Arquitectura

- **Frontend**: Vanilla JavaScript con Socket.IO
- **Backend**: Express.js con controladores REST
- **Comunicación**: Socket.IO para eventos en tiempo real + HTTP para operaciones CRUD
- **Base de datos**: Array en memoria (players.db.js)

## Endpoints API

- `GET /api/results/players` - Obtener todos los jugadores
- `POST /api/results/update-score` - Actualizar puntuación de un jugador
- `POST /api/results/reset-game` - Reiniciar el juego
- `GET /api/results/winner` - Obtener ganador actual

## Eventos Socket.IO

- `userJoined` - Usuario se unió al juego
- `playerScoreUpdated` - Puntuación de jugador actualizada
- `gameReset` - Juego reiniciado
- `gameEnded` - Juego terminado (ganador encontrado)
