/**
 * Database service for player-related operations
 */

const { assignRoles } = require("../utils/helpers");

const players = [];

/**
 * Get all players
 * @returns {Array} Array of player objects
 */
const getAllPlayers = () => {
  return players;
};

/**
 * Add a new player
 * @param {string} nickname - Player's nickname
 * @param {string} socketId - Player's socket ID
 * @returns {Object} The created player
 */
const addPlayer = (nickname, socketId) => {
  const newPlayer = { id: socketId, nickname, score: 0 };
  players.push(newPlayer);
  return newPlayer;
};

/**
 * Find a player by their socket ID
 * @param {string} socketId - Player's socket ID
 * @returns {Object|null} Player object or null if not found
 */
const findPlayerById = (socketId) => {
  return players.find((player) => player.id === socketId) || null;
};

/**
 * Assign roles to all players
 * @returns {Array} Array of players with assigned roles
 */
const assignPlayerRoles = () => {
  const playersWithRoles = assignRoles(players);
  // Update the players array with the new values
  players.splice(0, players.length, ...playersWithRoles);
  return players;
};

/**
 * Find players by role
 * @param {string|Array} role - Role or array of roles to find
 * @returns {Array} Array of players with the specified role(s)
 */
const findPlayersByRole = (role) => {
  if (Array.isArray(role)) {
    return players.filter((player) => role.includes(player.role));
  }
  return players.filter((player) => player.role === role);
};

/**
 * Get all game data (includes players)
 * @returns {Object} Object containing players array
 */
const getGameData = () => {
  return { players };
};

/**
 * Update player score
 * @param {string} socketId - Player's socket ID
 * @param {number} scoreChange - Score change (positive or negative)
 * @returns {Object|null} Updated player or null if not found
 */
const updatePlayerScore = (socketId, scoreChange) => {
  const player = findPlayerById(socketId);
  if (player) {
    player.score = (player.score || 0) + scoreChange;
    return player;
  }
  return null;
};

/**
 * Get player with highest score
 * @returns {Object|null} Player with highest score or null if no players
 */
const getWinner = () => {
  if (players.length === 0) return null;
  return players.reduce((winner, player) => {
    return (player.score || 0) > (winner.score || 0) ? player : winner;
  });
};

/**
 * Check if any player has reached winning score
 * @param {number} winningScore - Score threshold (default 100)
 * @returns {Object|null} Winner if found, null otherwise
 */
const checkForWinner = (winningScore = 100) => {
  return players.find((player) => (player.score || 0) >= winningScore) || null;
};

/**
 * Reset game data
 * @returns {void}
 */
const resetGame = () => {
  players.splice(0, players.length);
};

module.exports = {
  getAllPlayers,
  addPlayer,
  findPlayerById,
  assignPlayerRoles,
  findPlayersByRole,
  getGameData,
  updatePlayerScore,
  getWinner,
  checkForWinner,
  resetGame,
};
