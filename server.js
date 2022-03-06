const express = require("express");
const app = express();
const server = require("http").Server(app);
// It's nothing we have just created a server
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("./public"));

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  //   res.render("room");
  // Instead of rendering it on the route url, we'll be redirecting it using uuid
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
  //   passsing the roomId to the ejs/frontend
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId, userId) => {
    // console.log("joined room");
    socket.join(roomId);
    // socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(443);
