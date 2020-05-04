//Include Everything
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

//Setup express and add a JSON parser to it in order to handle JSON Objects
var app = express();
var jsonParser = bodyParser.json({
    extended: false
})
app.use(express.static('public'));
app.use(cors());
app.use(jsonParser);

//Setup Mongoose
var url = "mongodb://localhost:27017/";
var usersSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    birthDate: String,
    username: String,
    password: String,
    email: String
})
var User = mongoose.model("User", usersSchema);

//Add a POST request handler to express to handle login
app.post('/users/login', async function (req, res) {
    //Parse properties from body
    var un = req.body.username;
    var pass = req.body.password;
    await mongoose.connect('mongodb://localhost:27017/TZFilesAuth', { useNewUrlParser: true });
    let user = await User.findOne({ username: un});
    if (user === null) {
        res.status(404);
        res.send({
            errorCode: 404,
            errorMessage: "User not found!"
        });
        res.end();
    } else {
        const match = await bcrypt.compare(req.body.password, user.password);
        if(match) {
            res.send({
                token: jwt.sign({ username: user.username}, 'E@2f%N$#~?zE)`@_ZzLe)RSLM&SNbhc$,F6a(QA.%pP', {
                    expiresIn: "10m"
                  })
            });
            res.end();
        } else {
            res.status(401);
            res.send({
                errorCode: 401,
                errorMessage: "Wrong Password!"
            });
        res.end();
        }
    }
    await mongoose.disconnect();
    console.log(user);
}); //End of CallBack Hell


app.post('/users/signup', async function (req, res) {
    let password =  await bcrypt.hash(req.body.password, saltRounds);
    var user = {
        firstname: req.body.firstname,
        birthdate: req.body.birthdate,
        email: req.body.email,
        username: req.body.username,
        password: password,
    };

    await mongoose.connect('mongodb://localhost:27017/TZFilesAuth', { useNewUrlParser: true });
    let result = await User.create(user);

    if (result.length === 0) {
        res.status(404);
        res.send({
            errorCode: 404,
            errorMessage: "Something went wrong, try again!"
        });
        res.end();
    } else {
        console.log(result);
        res.setHeader('Content-Type', 'application/json');
        res.send({
            insertedId: result._id,
            ok: 'OK!'
        });
        res.end();
    }
    await mongoose.disconnect();
});

var server = app.listen(9090, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})