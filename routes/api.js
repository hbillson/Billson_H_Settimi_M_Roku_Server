const express = require('express');
const fetch = require("node-fetch");

const router = express.Router();
const connect = require("../config/sqlConfig");


router.get("/", (req, res) => {
    res.json({message: "you hit the api route"});
});

router.get("/users", (req, res) => {
    res.json({message: "all users route"});
})

router.get("/media/:version/:type", function(req, res) {
    let type = req.params.type;
    let version = req.params.version;
   // getMedia(type, version, res);
    var currentitems = testFunction();
    function testFunction() {
        return "test";
    }
   res.json({message: `result is ${currentitems}`});
})

function getMedia(type, version, res) {
    var currentitems = function(){ 
        return "testing";
    }
    
    res.json({message: `returning result of ${currentitems}`});
} 

module.exports = router;