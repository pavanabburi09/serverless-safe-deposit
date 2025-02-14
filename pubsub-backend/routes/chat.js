var chatService = {};
const express = require("express");
const router = express.Router();

const { PubSub } = require("@google-cloud/pubsub");
const pubsub = new PubSub();
const { PUBSUB_VERIFICATION_TOKEN } = process.env;

//firebase
const admin = require("firebase-admin");
const account = require("../firebaseKey.json");
let db;
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(account),
  });
  db = admin.firestore();
}

//Get all chat
chatService.AllChat = function (req, res) {
  if (!req.params.boxId) {
    res.status(400).send();
    return;
  }
  db.collection("chatSystem")
    .doc(req.params.boxId)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(200).send({ allMessages: [] });
      }
      res.status(200).send(doc.data());
      return;
    }).catch(err=>console.log(err));
};

//send chat
chatService.SendMessage = async function (req, res, next) {
  if (!req.body.payload) {
    res.status(400).send("Missing payload");
    return;
  }
  const data = Buffer.from(req.body.payload);
  const obj = JSON.parse(data);
  try {
    console.log('Sending message:', obj)
    const topic = pubsub.topic(`topic-${obj.boxId}`);
    const messageId = await topic.publish(data);

    storeToFireStore(data)
    res.status(200).send(`Message ${messageId} sent.`);
  } catch (error) {
    next(error);
  }
};

//push message
chatService.PushMessage = function (req, res) {
  if (req.query.token !== PUBSUB_VERIFICATION_TOKEN) {
    res.status(400).send();
    return;
  }
  const message = Buffer.from(req.body.message.data, "base64").toString(
    "utf-8"
  )
  const boxId = JSON.parse(message)["boxId"]
  console.log("Message :" + message);
  console.log(`To box id : ${boxId}`);
  req.io.in(boxId).emit("new message", {
    message,
  });
  res.status(200).send();
};

//store push message to firestore
const storeToFireStore = (message) => {
    console.log('FireStore')
  let obj = JSON.parse(message);
  let data;
  db.collection("chatSystem")
    .doc(obj["boxId"])
    .get()
    .then((doc) => {
      if (!doc.exists) {
        data = {
          allMessages: [],
        };
      } else {
        data = doc.data();
      }
      data.allMessages.push(obj);
      db.collection("chatSystem")
        .doc(obj["boxId"])
        .set(data)
        .catch((err) => {
          console.log(err);
          return res.status(500).json({
            message: "Internal Server Error",
            success: false,
          });
        });
    }).catch((err)=>{
        console.log(err)
    });
};

module.exports = chatService;