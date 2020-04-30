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
var http = require('http');
var https = require('https');

http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

var ROOT_DIR = "F:\\TZFiles";

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

app.post('/folder', function(req, res) {
    if(req.body.folder === '..') {
        ROOT_DIR = ROOT_DIR.substring(0, ROOT_DIR.lastIndexOf('\\'));
    } else {
        ROOT_DIR += '\\' +  req.body.folder;
    }
    res.send({status: 'OK', newRootDir: ROOT_DIR});
    res.end();
});

app.get('/folder', function(req, res) {
    var responseBody = {files:[], disk:null};
    var files = fs.readdirSync( path.join(ROOT_DIR));
    for (var i=0; i<files.length; i++) {
        var file = ROOT_DIR + '\\' + files[i];
        var stats = fs.statSync(file);
        let bodyItem = {
            filename: files[i],
            size: stats["size"],
            lastDate: stats["mtime"],
            isDir: stats.isDirectory()
        };
        responseBody.files.push(bodyItem);
        console.log(bodyItem);
    } 
    checkDiskSpace(ROOT_DIR).then((diskSpace) => {
        responseBody.disk = diskSpace;
    }).then(() => {
        res.send(responseBody);
        res.end();
    });
});

app.post('/file', async (req, res) => {
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
            avatar.mv(ROOT_DIR + '\\' + avatar.name);

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

app.get('/file/:filename', async (req, res) => {
    let filepath = ROOT_DIR + '\\' + decodeURI(req.params.filename);
    console.log('SENDING FILE: ' + filepath);
    res.download(filepath);
});

app.delete('/file/:filename', async (req, res) => {
    let filepath = ROOT_DIR + '\\' + decodeURI(req.params.filename);
    console.log('Deletting FILE: ' + filepath);
    fs.unlinkSync(filepath);
    res.send({message: 'File deleted succesfuly'});
    res.end();
});

app.listen(3000);
