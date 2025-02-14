const express = require("express");
const app = express();

const jsonBodyParser = express.json();

const http = require("http").Server(app);
var bodyParser = require("body-parser");
const port = process.env.PORT || 8081;

const chat = require("./routes/chat");
const io = require("socket.io")(http);

const cors = require("cors");
app.use(cors());

app.use(express.json());

io.on("connection", (socket) => {
  socket.on("create", function (room) {
    console.log("Creating room:  " + room);
    socket.join(room);
  });

  socket.on("disconnect", () => {
    // socket.leave(boxId);
    console.log("user disconnected");
  });

  //Get all messages
  app.get("/getChat/:boxId", chat.AllChat);

  //POST new message
  app.post("/sendMessage",bodyParser.urlencoded({extended: true}), chat.SendMessage );

  //Push new message
  app.use((req, res, next)=>{
    req.io = io
    next()
  })
  app.post("/pubsub/push",jsonBodyParser, chat.PushMessage );
});

http.listen(port, () => console.log("listening on port " + port));
require("dotenv").config();

module.exports = app;

// gcloud builds submit --tag gcr.io/sapient-metrics-333504/message
// gcloud run deploy --image gcr.io/sapient-metrics-333504/message --allow-unauthenticated
