const router = require('express').Router();
const multer = require("multer");
const fs = require('fs');
const request = require('request');
const progress = require('request-progress');

const storage = multer.diskStorage({
  destination: "./files",
  filename: function (req, file, cb) {
    cb(null, file.originalname.replace(/ /g, ""));
  }
});

const upload = multer({ storage: storage });

const URLS = require('../config/config.js').config();

router.post('/', upload.single('doc'), (req, res, next) => {
    if(URLS.indexOf(req.headers.referer) !== -1){
        return res.json({file: req.file.filename});
    }
    else{
        return res.sendStatus(404);
    }
});

router.post('/link', (req, res, next) => {
// link : /histoondemand/mapr_exports/cmd-5a576574f906962c10c79c20-20180215-5a85980bf7cccf6d35b39935-1/cmd-5a576574f906962c10c79c20-20180215-5a85980bf7cccf6d35b39935-1_2017-03-01_1027.zip

    // The options argument is optional so you can omit it 
    progress(request('https://github.com/angular/code.angularjs.org/archive/master.zip'), {
        // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms 
        // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms 
        // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length 
    })
    .on('progress', function (state) {
        // The state is an object that looks like this: 
        // { 
        //     percent: 0.5,               // Overall percent (between 0 to 1) 
        //     speed: 554732,              // The download speed in bytes/sec 
        //     size: { 
        //         total: 90044871,        // The total payload size in bytes 
        //         transferred: 27610959   // The transferred payload size in bytes 
        //     }, 
        //     time: { 
        //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals) 
        //         remaining: 81.403       // The remaining seconds to finish (3 decimals) 
        //     } 
        // } 
        console.log('progress', state);
    })
    .on('error', function (err) {
        // Do something with err 
        console.error(err);
    })
    .on('end', function () {
        // Do something after request finishes 
        console.log("ok");
    })
    .pipe(fs.createWriteStream('2017-03-01_1027.zip'));

});

module.exports = router;