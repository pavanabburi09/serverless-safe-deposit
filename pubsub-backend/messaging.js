const express = require("express");
const process = require("process");
const { PubSub } = require("@google-cloud/pubsub");

const pubsub = new PubSub();


const app = express();
const formBodyParser = express.urlencoded({ extended: false });
const jsonBodyParser = express.json();
const { PUBSUB_VERIFICATION_TOKEN } = process.env;

const topic = pubsub.topic("one");

io.on("connection", (socket) => {
  console.log('connecting')
  app.get("/", (req, res) => {
    res.send(200, "Hello");
  });

  app.post("/", formBodyParser, async (req, res, next) => {
    if (!req.body.payload) {
      console.log(req);
      console.log(req.body);
      res.status(400).send("Missing payload");
      return;
    }

    const data = Buffer.from(req.body.payload);
    try {
      const messageId = await topic.publish(data);
      res.status(200).send(`Message ${messageId} sent.`);
    } catch (error) {
      next(error);
    }
  });

  app.post("/pubsub/push", jsonBodyParser, (req, res) => {
    if (req.query.token !== PUBSUB_VERIFICATION_TOKEN) {
      res.status(400).send();
      return;
    }
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf-8"
    );
    console.log(message)
    socket.broadcast.emit("new message", {
      message: message,
    });
    res.status(200).send();
  });
});

module.exports = app;
