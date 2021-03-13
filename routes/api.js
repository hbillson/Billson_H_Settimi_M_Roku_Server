const express = require('express');
const fetch = require("node-fetch");

const router = express.Router();
const connect = require("../config/sqlConfig");

var allitems = {};
var currentitems = {};

const mediaController = {
    all(req, res, next) {
        let type = req.params.type;
        let version = req.params.version;
        var k = 0;
        let url ="https://imdb8.p.rapidapi.com/title/get-best-picture-winners";
        headers = {
            "x-rapidapi-key": "6d810c5c17mshac4a8e74973b5f5p170738jsn1558e894e034",
            "x-rapidapi-host": "imdb8.p.rapidapi.com"}
        ;
        
        if(type == "tv") {
            url = "https://imdb8.p.rapidapi.com/title/get-top-rated-tv-shows";
        }
                fetch(url, {
                    "method": "GET",
                   "headers": headers
             }) 
             .then(response => response.json())
             .then(data => {
                getID(data);
             })
             .catch((err) => console.log(err));
    
             function getID(list) {
                //getting the details for each title'

                if(type == "movies") {
                    for(var i = 0; i < 50; i++) {
                        let movie_id = list[i];
                        movie_id = movie_id.substring(7);
                        movie_id = movie_id.substring(0, movie_id.length-1);
                        getDetails(movie_id);
                    }
                } else if (type == "tv") {
                    for(var i = 0; i < 50; i++) {
                        let show_id = list[i].id;
                        show_id = show_id.substring(7);
                        show_id = show_id.substring(0, show_id.length-1);
                        getDetails(show_id);
                    }
                }
    
             }
    
             function getDetails(item) {
                 
                 let url = `http://www.omdbapi.com/?i=${item}&apikey=7ca22fdc&`;
                fetch(url, {
                    "method": "GET"
                })
                .then(response => response.json())
                .then(data => {
                    loadMedia(data);
                })
                .catch((err) => console.log(err));
             }

    function loadMedia(item) {
        k = k+1;
        if(version == "kids" && item.Rated == "G" || item.Rated =="PG" || item.Rated == "PG-13" || item.Rated == "TV-PG" || item.Rated == "TV-G" || item.Rated == "TV-Y") {
                allitems[k] = item;
        } else if (version == "parents") {
            allitems[k] = item;
        }
    }
    res.json(allitems);
    },

    byDecade(req, res) {
        var min_year = "";
        var max_year = "";
        let decade = req.params.decade;
        let m = 0;
        if (decade == "nineties") {
            min_year = "1990";
            max_year = "1999";
        }
        else if (decade == "eighties") {
            min_year = "1980";
            max_year = "1989";
        }
        else if (decade == "seventies") {
            min_year = "1970";
            max_year = "1979";
        }
        else if (decade == "sixties") {
            min_year = "1960";
            max_year = "1969";
        }
        else if (decade == "fifties") {
            console.log("yup fifties");
            min_year = "1950";
            max_year = "1959";
        }
        Object.keys(allitems).forEach(function(key) {
            let year = allitems[key].Year;
            if(year <= max_year && year >= min_year) {
                currentitems[m] = allitems[key];
                m = m + 1;
            }
        })
        res.json(currentitems);

    }
};


router.get("/", (req, res) => {
    res.json({message: "you hit the api route"});
});

router.get("/users", (req, res) => {
    res.json({message: "all users route"});
})

router.get("/media/:version/:type", mediaController.all)

router.get("/media/:version/:type/:decade", mediaController.byDecade);

module.exports = router;