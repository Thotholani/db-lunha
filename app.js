require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const bodyParser = require("body-parser");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let roomsArray = [];

const mongoose = require("mongoose");
const { log } = require("console");

// connect to db
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log("Connected to DB and listening on 3000");
    });
  })
  .catch((error) => {
    console.log(error);
  });

// Model and Schema
const Schema = mongoose.Schema;
const roomSchema = Schema({
  name: {
    type: String,
  },
  occupants: { type: String },
  number: { type: String },
});

const Room = mongoose.model("Room", roomSchema);

// Middleware
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

if (roomsArray.length === 0) {
  fetchData();
}

// routes
app.get("/", async (req, res) => {
  res.render("index");
});

// get all admin rooms
app.get("/admin", async (req, res) => {
  //get all rooms
  fetchData();
  res.render("admin", { frontEndRooms: roomsArray });
});

app.get("/admin/:roomName", (req, res) => {
  const message = "";

  const name = req.params.roomName;
  const foundRoom = roomsArray.find((object) => {
    return object.name === name;
  });

  res.render("edit", {
    frontEndfoundRoom: foundRoom,
    frontEndMessage: message,
    changed: false,
  });
});

app.get("/rooms", function (req, res) {
  fetchData();
  res.render("rooms", { frontEndRooms: roomsArray });
});

app.get("/rooms/:roomName", (req, res) => {
  let roomName = req.params.roomName;
  roomName = roomName.toString();
  // console.log("The room name found is " + roomName);
  try {
    const foundRoom = roomsArray.find((object) => {
      return object.name === roomName;
    });

    console.log("the found room is " + foundRoom);

    res.render("room", { frontEndfoundRoom: foundRoom });
  } catch (error) {
    console.error(err);
    res.status(500).send("Could not find room");
  }
});

app.post("/edit", async function (req, res) {
  // console.log(req.body);
  const roomName = req.body.name;
  const occupants = req.body.occupants;
  const numberSent = req.body.number;

  // console.log("Occupants constant contains: " + occupants);
  // console.log("Number Sent constant contains: " + numberSent);

  try {
    const updatedRoom = await Room.findOneAndUpdate(
      { number: numberSent },
      { occupants: occupants },
      { new: true } // This option returns the updated document, useful for debugging
    );
    fetchData();

    const foundRoom = roomsArray.find((object) => {
      return object.name === roomName;
    });

    res.status(200).render("edit", {
      frontEndfoundRoom: foundRoom,
      changed: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating room");
  }
});

io.on("connection", (socket) => {
  socket.on("edit room", (msg) => {
    io.emit("edit room", msg);
  });
});

// function jsonReader(filePath, cb) {
//   fs.readFile(filePath, "utf-8", (err, fileData) => {
//     if (err) {
//       return cb && cb(err);
//     }
//     try {
//       const object = JSON.parse(fileData);
//       return cb && cb(null, object);
//     } catch (err) {
//       return cb && cb(err);
//     }
//   });
// }

app.get("*", function (req, res) {
  res.render("error");
});

process.env;

// ROOM CREATION CODE
//  // get values submited
//  const { name, occupants, number } = req.body;

//  try {
//    const room = await Room.create({ name, occupants, number });
//    res.status(200).json(room);
//  } catch (error) {
//    res.status(400).json({ error: error.message });
//  }

async function fetchData() {
  const rooms = await Room.find({});
  roomsArray = rooms;
}
