const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const axios = require("axios");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("i am alive");
});

const rooms = {};
const participants = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("login", (data) => {
    const axiosConfig = {
      headers: {
        Authorization: "Bearer " + data,
      },
    };

    axios
      .get("https://directus.sw.hybrid-class.gr/users/me", axiosConfig)
      .then((res) => {
        socket.data.user_id = res.data.data.id;
        socket.data.email = res.data.data.email;
        socket.data.teacher = true;
        // console.log(res.data.data, 'socket')
      })
      .catch((err) => {
        console.log(err);
      });
  });

  socket.on("live", (data) => {
    console.log(data);
  });

  socket.on("ended", (data) => {
    console.log(data);
  });

  socket.on("name", (data) => {
    data.socketid = socket.id
    participants.push(data);
    console.log("participants_in", participants);
    socket.join(data.pin)
    share_participants(data.pin)
  });

  function share_participants(pin){
    io.to(pin).emit('participants', participants.filter((x) => x.pin === pin))
  }

  socket.on("leave", () => {
    let ind = participants.findIndex((x) => x.socketid === socket.id);
    if (ind > -1) {
      let room = participants[ind].pin
      participants.splice(ind, 1);
      console.log("participants_out", participants);
      share_participants(room)
    }
  });

  socket.on("disconnect", () => {
    let ind = participants.findIndex((x) => x.socketid === socket.id);
    if (ind > -1) {
      let room = participants[ind].pin
      participants.splice(ind, 1);
      console.log("participants_out", participants);
      share_participants(room)
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3015;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
