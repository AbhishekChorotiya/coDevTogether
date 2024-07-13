const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const USER = require("./src/utils/constants/user");
const CODE = require("./src/utils/constants/code");

const server = http.createServer(app);
const io = new Server(server);

const usersMap = {};
function getClientsInRoom(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: usersMap[socketId],
        focus: true,
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
    console.log("clients", clients);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(USER.JOINED, {
        username,
        clients,
        socketId: socket.id,
      });
    });
  });

  socket.on(CODE.SYNC, ({ code, question, socketId, users, language }) => {
    console.log("sync request", usersMap[socketId]);
    console.log("users", users);
    io.to(socketId).emit(CODE.CHANGE, { code, language });
    io.to(socketId).emit(USER.QUESTON, { question });
  });

  socket.on(USER.QUESTON, ({ question, roomId }) => {
    console.log("question", question);
    const clients = getClientsInRoom(roomId);
    clients.forEach(({ socketId }) => {
      if (socketId !== socket.id)
        io.to(socketId).emit(USER.QUESTON, { question });
    });
  });

  socket.on(CODE.CHANGE, ({ code, roomId }) => {
    console.log("code change", code);
    socket.in(roomId).emit(CODE.CHANGE, { code });
  });

  socket.on("FOCUS", ({ id, focus, roomId }) => {
    console.log("focus-->", focus, usersMap[id], roomId);
    socket.in(roomId).emit("FOCUS", {
      id,
      focus,
    });
  });

  socket.on("LANGUAGE", ({ lang, roomId }) => {
    console.log("language", lang);
    socket.in(roomId).emit("LANGUAGE", {
      lang,
    });
  });

  socket.on(USER.MESSAGE, ({ message, roomId, type }) => {
    console.log("message", message, type);
    const clients = getClientsInRoom(roomId);
    const time = Date.now();
    clients.forEach(({ socketId }) => {
      if (socketId !== socket.id)
        io.to(socketId).emit(USER.MESSAGE, {
          message,
          username: usersMap[socket.id],
          type,
          time,
        });
    });
  });

  socket.on(USER.FOCUS_ON, ({ roomId }) => {
    console.log("focus on", usersMap[socket.id]);
    socket.in(roomId).emit(USER.FOCUS_ON, {
      socketId: socket.id,
    });
  });

  socket.on(USER.FOCUS_OFF, ({ roomId }) => {
    console.log("focus off", usersMap[socket.id]);
    socket.in(roomId).emit(USER.FOCUS_OFF, {
      socketId: socket.id,
    });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(USER.LEAVE, {
        socketId: socket.id,
        username: usersMap[socket.id],
      });
    });
    console.log("user leaving", usersMap[socket.id]);
    delete usersMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
