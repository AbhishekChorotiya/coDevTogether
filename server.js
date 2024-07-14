const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const USER = require("./src/utils/constants/user");
const CODE = require("./src/utils/constants/code");
const path = require("path");

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("build"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

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
    usersMap[socket.id] = username;
    socket.join(roomId);

    const clients = getClientsInRoom(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(USER.JOINED, {
        username,
        clients,
        socketId: socket.id,
      });
    });
  });

  socket.on(CODE.SYNC, ({ code, question, socketId, users, language }) => {
    io.to(socketId).emit(CODE.CHANGE, { code, language });
    io.to(socketId).emit(USER.QUESTON, { question });
  });

  socket.on(USER.QUESTON, ({ question, roomId }) => {
    const clients = getClientsInRoom(roomId);
    clients.forEach(({ socketId }) => {
      if (socketId !== socket.id)
        io.to(socketId).emit(USER.QUESTON, { question });
    });
  });

  socket.on(CODE.CHANGE, ({ code, roomId }) => {
    socket.in(roomId).emit(CODE.CHANGE, { code });
  });

  socket.on("FOCUS", ({ id, focus, roomId }) => {
    socket.in(roomId).emit("FOCUS", {
      id,
      focus,
    });
  });

  socket.on("LANGUAGE", ({ lang, roomId }) => {
    socket.in(roomId).emit("LANGUAGE", {
      lang,
    });
  });

  socket.on(USER.MESSAGE, ({ message, roomId, type }) => {
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
    socket.in(roomId).emit(USER.FOCUS_ON, {
      socketId: socket.id,
    });
  });

  socket.on(USER.FOCUS_OFF, ({ roomId }) => {
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
    delete usersMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 80;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
