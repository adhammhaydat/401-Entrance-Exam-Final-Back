'use strict';
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const { default: axios } = require('axios');
require('dotenv').config();
const server = express();
server.use(cors());
server.use(express.json());
const PORT = process.env.PORT;

mongoose.connect(`${process.env.MONGO_DB_ATLAS}`, { useNewUrlParser: true, useUnifiedTopology: true });


const ColorSchema = new mongoose.Schema({
    title: String,
    imageUrl: String,
});

const UserSchema = new mongoose.Schema({
    email: String,
    colors: [ColorSchema]
});

const UsersModel = mongoose.model('User', UserSchema);



function SeedUsersData() {
    let ibrahim = new UsersModel(
        {
            email: 'ibrahimkuderat@gmail.com',
            colors: [
                {
                    title: 'Black',
                    imageUrl: 'http://www.colourlovers.com/img/000000/100/100/Black.png'
                }
            ]
        }
    )

    let razan = new UsersModel(
        {
            email: 'quraanrazan282@gmail.com',
            colors: [
                {
                    title: 'Black',
                    imageUrl: 'http://www.colourlovers.com/img/000000/100/100/Black.png'
                },
                {
                    title: 'dutch teal',
                    imageUrl: 'http://www.colourlovers.com/img/1693A5/100/100/dutch_teal.png'
                }
            ]
        }
    )

    ibrahim.save();
    razan.save();
}

// This For Getting All Data From API


class Color {
    constructor(title, imageUrl) {
        this.title = title,
     this.imageUrl = imageUrl
    }
}

server.get('/allcolors', async (req, res) => {
    let dataFromAPI = await axios.get('https://ltuc-asac-api.herokuapp.com/allColorData');
    let data = dataFromAPI.data.map(color => {
        return new Color(color.title, color.imageUrl)
    })
    res.status(200).send(data)
})

///////////////////////////////////////////////

// This For User Colors
server.get('/favcolors/:email', gettingFavColors);
server.post('/addtofav/:email', addToFav);
server.delete('/deletecolor/:email', deleteColor);
server.put('/updatecolor/:email' , updateColor)


function gettingFavColors(req, res) {
    let userEmail = req.params.email;

    UsersModel.find({ email: userEmail }, (error, Data) => {
        if (error) {
            res.status(404).send(error)
        }
        else {
            res.status(200).send(Data[0].colors)
        }
    })
}

function addToFav(req, res) {
    let userEmail = req.params.email;
    const { title, imageUrl } = req.body;
    UsersModel.find({ email: userEmail }, (error, Data) => {
        if (error) {
            res.status(404).send(error)
        }
        else {
            Data[0].colors.push(
                {
                    title: title,
                    imageUrl: imageUrl
                }
            )
            Data[0].save();
        }
    })
}

function deleteColor(req, res) {
    let userEmail = req.params.email;
    let colorIndex = Number(req.query.index);
    UsersModel.find({ email: userEmail }, (error, Data) => {
        if (error) {
            res.status(404).send(error)
        }
        else {
            let filtered = Data[0].colors.filter((color, index) => {
              if (index !== colorIndex) { return color }
            })
            Data[0].colors = filtered;
            Data[0].save();
            res.status(200).send(Data[0].colors)
        }
    })
}

function updateColor (req , res) {
    let userEmail = req.params.email;
    let colorIndex = Number(req.query.index);
    const { title , imageUrl } = req.body;

    UsersModel.find({ email: userEmail }, (error, Data) => {
        if (error) {
            res.status(404).send(error)
        }
        else {
           Data[0].colors.splice(colorIndex , 1 , {
            title : title ,
            imageUrl : imageUrl
           })
           Data[0].save();
           res.status(200).send(Data[0].colors)
        }
    })
}






server.get('/', (req, res) => {
    res.status(200).send('All Good ...')
})

server.listen(PORT, () => {
    console.log(`Listining on port : ${PORT}`);
})