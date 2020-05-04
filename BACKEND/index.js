//requiring path and fs modules
const path = require('path');
const fs = require('fs');
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const checkDiskSpace = require('check-disk-space');
const http = require('http');
const https = require('https');
const compression = require('compression');
const jwt = require('jsonwebtoken');


http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

var ORIGINAL_ROOT_DIR = "F:\\";
var ROOT_DIR = "F:\\";

// const directoryPath = path.join(ROOT_DIR);
var app = express();
// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(compression());

//AUTH!
app.use(function (req, res, next) {
    if(req.headers.authorization === undefined) {
        res.status(401);
        res.send({errorCode: 401, errorMessage: 'Unauthorized User!'});
        res.end();
    } else {
        let token = req.headers.authorization.split(' ')[1];
        var decoded = jwt.verify(token, 'E@2f%N$#~?zE)`@_ZzLe)RSLM&SNbhc$,F6a(QA.%pP',  function(err, decoded) {
            if(err) {
                res.status(401);
                res.send({errorCode: 401, errorMessage: 'Unauthorized User!'});
                res.end();
            } else {
                next();
            }
        });
    }
});

app.post('/mkdir', function(req, res) {

    doIt = true;
    fs.readdirSync(path.join(ROOT_DIR)).forEach((file, i) => {
        if(file === req.body.folder) {
            res.status(400);
            res.send({errorCode:400, errorMessage: 'Folder Already exists'});
            doIt = false;
        }
    });
    (doIt) ? fs.mkdirSync(ROOT_DIR + '\\' + req.body.folder) : console.log('Something went wrong');
    if(doIt) { res.send({status: 'OK!', message: 'Folder Created!'}); res.end();}
});

app.delete('/folder/:foldername', function(req, res) {
    try{
        fs.rmdirSync(ROOT_DIR + '\\' + req.body.folder  + '\\' + decodeURI(req.params.foldername));
        res.send({status:'OK', message:'Folder Deleted!'});
        res.end();
    } catch(err) {
        res.status(400);
        res.send({errorCode: 400, errorMessage: err.message});
        res.end();
    }
});

app.post('/folder', function(req, res) {
    var responseBody = {files:[], disk:null};
    fs.readdirSync(path.join(ROOT_DIR + '\\' + req.body.folder)).forEach((file, i) => {
        try {
            var stats = fs.statSync(ROOT_DIR + '\\' + req.body.folder + '\\' + file);
            let bodyItem = {
                filename: file,
                size: stats["size"],
                lastDate: stats["mtime"],
                isDir: stats.isDirectory()
            };
            responseBody.files.push(bodyItem);
        } catch(e) {
            console.log('ERROR ON:', ROOT_DIR + '\\' + req.body.folder + '\\' + file)
        }
    });

    checkDiskSpace(ROOT_DIR).then((diskSpace) => {
        responseBody.disk = diskSpace;
        responseBody.disk.isOriginalRoot = (ORIGINAL_ROOT_DIR === ROOT_DIR) ? true : false;
    }).then(() => {
        res.send(responseBody);
        res.end();
    });
});

app.post('/file', async (req, res) => {
    console.log(req.body);
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let avatar = req.files.avatar;
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            avatar.mv(ROOT_DIR + '\\' + req.body.folder + '\\' + avatar.name);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: avatar.name,
                    mimetype: avatar.mimetype,
                    size: avatar.size
                }
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

app.post('/file/:filename', async (req, res) => {
    let filepath = ROOT_DIR + '\\' + req.body.folder + '\\' + decodeURI(req.params.filename);
    console.log('SENDING FILE: ' + filepath);
    res.download(filepath);
});

app.delete('/file/:filename', async (req, res) => {
    let filepath = ROOT_DIR + '\\' + req.body.folder + '\\' + decodeURI(req.params.filename);
    console.log('Deletting FILE: ' + filepath);
    fs.unlinkSync(filepath);
    res.send({message: 'File deleted succesfuly'});
    res.end();
});

app.listen(3000);
