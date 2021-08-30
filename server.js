"use strict";
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");
require("dotenv").config();
const server = express();
server.use(cors());
server.use(express.json());
const PORT = process.env.PORT;

mongoose.connect(
  "mongodb://adhammhaydat:12345@cluster0-shard-00-00.qi4a6.mongodb.net:27017,cluster0-shard-00-01.qi4a6.mongodb.net:27017,cluster0-shard-00-02.qi4a6.mongodb.net:27017/colors?ssl=true&replicaSet=atlas-ipru7s-shard-0&authSource=admin&retryWrites=true&w=majority", { useNewUrlParser: true ,useUnifiedTopology: true}
);

const ColorSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
});

const UserSchema = new mongoose.Schema({
  email: String,
  colors: [ColorSchema],
});

const UsersModel = mongoose.model("User", UserSchema);

function SeedUsersData() {
  let ibrahim = new UsersModel({
    email: "adhammohidat123@gmail.com",
    colors: [
      {
        title: "Black",
        imageUrl: "http://www.colourlovers.com/img/000000/100/100/Black.png",
      },
    ],
  });

  let razan = new UsersModel({
    email: "quraanrazan282@gmail.com",
    colors: [
      {
        title: "Black",
        imageUrl: "http://www.colourlovers.com/img/000000/100/100/Black.png",
      },
      {
        title: "dutch teal",
        imageUrl:
          "http://www.colourlovers.com/img/1693A5/100/100/dutch_teal.png",
      },
    ],
  });

  ibrahim.save();
  razan.save();
  console.log(ibrahim, razan);
}
// SeedUsersData();

function gettingColors(req, res) {
  axios
    .get("https://flowers-api-13.herokuapp.com/getFlowers")
    .then((result) => {
      res.send(result.data);
    });
}

function gettingFavColors(req, res) {
  let email = req.params.email;
  UsersModel.find({ email: email }, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
}

function addToFav(req, res) {
  const { name, photo } = req.body;
  let email = req.params.email;
  UsersModel.findOne({ email: email }, (err, ele) => {
    ele.colors.push({
      title: name,
      imageUrl: photo,
    });
    ele.save();
    res.send(ele);
  });
}

function deleteColor(req, res) {
  let email = req.params.email;
  let id = req.params.id;

  UsersModel.findOne({ email: email }, (err, ele) => {
    ele.colors.splice(id, 1);
    ele.save();
    res.send(ele);
  });
}

function updateColor(req, res) {
  let email = req.params.email;
  let id = req.params.id;
  let data = { title: req.body.title, imageUrl: req.body.imageUrl };
  UsersModel.findOne({ email: email }, (err, ele) => {
    if (err) {
      console.log(err);
    } else {
      ele.colors.splice(id, 1, data);
      ele.save();
      res.send(ele);
    }
  });
}
server.get("/colors", gettingColors);
server.get("/favcolors/:email", gettingFavColors);
server.post("/addtofav/:email", addToFav);
server.delete("/deletecolor/:email/:id", deleteColor);
server.put("/updatecolor/:email/:id", updateColor);

server.get("/", (req, res) => {
  res.status(200).send("All Good ...");
});

server.listen(PORT, () => {
  console.log(`Listining on port : ${PORT}`);
});
