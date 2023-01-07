const express = require("express");
const app = express();
const server = require("http").Server(app);
const PORT = 3000;
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const url = require("url");
const path = require("path");

const peerServer = ExpressPeerServer(server, () => {
  console.log("peerserver is live");
});

//middlewares
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.get("/join", (req, res) => {
  res.redirect(
    url.format({
      pathname: `/join/${uuidv4()}`,
      query: req.query,
    })
  );
});

app.get("/joinold/:meeting_id", (req, res) => {
  res.redirect(
    url.format({
      pathname: req.params.meeting_id,
      query: req.query,
    })
  );
});

app.get("/join/:room", (req, res) => [
  res.render("room", { roomid: req.params.room, Myname: req.query.name }),
]);

io.on("connnection", (socket) => {
  socket.on("join-room", (roomid, id, Myname) => {
    socket.to(roomid).broadcast.emit("user-connected", id, Myname);
  });

  socket.on("tellname", (Myname) => {
    socket.to(roomid).broadcast.emit("AddName", Myname);
  });

  socket.on("disconnect", () => {
    socket.to(roomid).broadcast.emit("user-disconnected", id);
  });
});

server.listen(PORT, () => {
  console.log("server is live on http://localhost:" + PORT);
});
