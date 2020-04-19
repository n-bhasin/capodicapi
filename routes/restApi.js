const Chat = require("../models/chat");
const Log = require("../models/log");
const express = require("express");
const router = express.Router();

/**CHAT API */
//get api
router.get("/chat", async (req, res) => {
  const chat = await Chat.find().sort("-date");
  res.json(chat);
});

router.get("/chat/:id", async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(404).send("The Chat with given id not there.");
  res.send(chat);
});
//post api
router.post("/chat", async (req, res) => {
  let chat = new Chat({
    sender: req.body.username,
    message: req.body.message,
    room: req.body.room,
    date: req.body.date,
    time: req.body.time,
  });

  chat = await chat.save();
  res.json(chat);
});
//put api--- we dont need put api for chat messages
// router.put("/chat/:id", async (req, res) => {
//     const chat = await Chat.findByIdAndUpdate(req.params.id, )
//   const chat = await Chat.find().sort("-date");
//   res.json(chat);
// });

//delete api
router.delete("/chat/:id", async (req, res) => {
  const chat = await Chat.findByIdAndRemove(req.params.id);
  if (!chat) return res.status(404).send("There chat with given id not there.");
  res.json(chat);
});

/**LOG API */
//log get api
router.get("/log", async (req, res) => {
  const log = await Log.find().sort("date");
  res.send(log);
});
//log post api
router.post("/log", async (req, res) => {
  let log = new Log({
    logType: req.params.logtype,
    name: req.params.name,
    message: req.params.message,
  });
  log = await log.save;
  res.json(log);
});

//put api

//log delete api
router.delete("/log/:id", async (req, res) => {
  const log = await Log.findByIdAndRemove(req.params.id);
  if (!log) return res.status(404).send("The Log with given id not there.");
  res.send(log);
});

router.get("/log/:id", async (req, res) => {
  const log = await Log.findById(req.params.id);
  if (!log) return res.status(404).send("The Log with given id not there.");
  res.send(log);
});
module.exports = router;
