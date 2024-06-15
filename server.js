const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const USER = require("./src/constants/user");
const CODE = require("./src/constants/code");

const server = http.createServer(app);
const io = new Server(server);

const usersMap = {};
function getClientsInRoom(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: usersMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  socket.on(USER.JOIN, ({ username, roomId }) => {
    console.log("join event", username, roomId);
    usersMap[socket.id] = username;
    socket.join(roomId);

    const clients = getClientsInRoom(roomId);
    console.log('clients', clients);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(USER.JOINED, {
        username,
        clients,
        socketId: socket.id,
      });
    });
  });

  socket.on(CODE.SYNC, ({ code, socketId }) => {
    console.log('sync request',usersMap[socketId]);
    io.to(socketId).emit(CODE.CHANGE, { code });
  });

  socket.on(CODE.CHANGE, ({ code,roomId }) => {
    console.log('code change',code);
    socket.in(roomId).emit(CODE.CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(USER.LEAVE, {
        socketId: socket.id,
        username: usersMap[socket.id],
      });
    });
    console.log('user leaving', usersMap[socket.id]);
    delete usersMap[socket.id];
    socket.leave();
  });



});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
