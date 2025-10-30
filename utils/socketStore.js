// socketStore.js
let ioInstance = null;
const connectedUsers = new Map();

function setIo(io) {
  ioInstance = io;
}

function getIo() {
  return ioInstance;
}

function getConnectedUsers() {
  return connectedUsers;
}

module.exports = {
  setIo,
  getIo,
  getConnectedUsers,
};
