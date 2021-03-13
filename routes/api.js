const express = require('express');
const fetch = require("node-fetch");

const router = express.Router();
const connect = require("../config/sqlConfig");

var newitems = {};
var filtereditems = {};

router.get("/", (req, res) => {
    res.json({message: "you hit the api route"});
});

router.get("/users", (req, res) => {
    res.json({message: "all users route"});
})

router.get("/media/:version/:type/", async function(req, res) {
    let type = req.params.type;
    let version = req.params.version;
    var list = await loadMedia();
    newitems = list;
    res.json(newitems);

    async function loadMedia() {
            let k = 0;
            let url ="https://imdb8.p.rapidapi.com/title/get-best-picture-winners";
            if(type == "tv") {
                url = "https://imdb8.p.rapidapi.com/title/get-most-popular-tv-shows?homeCountry=US&purchaseCountry=US&currentCountry=US";
            }
            let headers = {
                "x-rapidapi-key": "6d810c5c17mshac4a8e74973b5f5p170738jsn1558e894e034",
                "x-rapidapi-host": "imdb8.p.rapidapi.com"
            }
        
            var response = await fetch(url, {
                "method": "GET",
                "headers": headers
            }) 
            .then(response => response.json())
            .then(data => getID(data))
             .catch((err) => console.log(err));

            //console.log(await response);
            return await response;

    
           async function getID(list) {
                //getting the details for each title'
                var deets ={}
                var currentitems = {};
                k = 0;
                if(type == "movies") {
                    for (var i = 0; i < 80; i++) {
                        let movie_id = list[i];
                        movie_id = movie_id.substring(7);
                        movie_id = movie_id.substring(0, movie_id.length-1);
                        deets = await getDetails(movie_id);
                        if(deets) {
                            currentitems[k] = deets;
                            k = k+1;
                        }
                    } 
  
                    return currentitems;
                } else if (type == "tv") {
                    currentitems = {};
                    for (var i = 0; i < 100; i++) {
                        let show_id = list[i];
                        show_id = show_id.substring(7);
                        show_id = show_id.substring(0, show_id.length-1);
                        deets = await getDetails(show_id);
                        if(deets) {
                            currentitems[k] = deets;
                            k = k+1;
                        }
                    }
                    return currentitems;
                }
             }
    
             async function getDetails(item) {
                 let url = `http://www.omdbapi.com/?i=${item}&apikey=7ca22fdc&`;
                     var response = await fetch(url, {
                        "method": "GET",
                        "headers": headers
                    }) 
                    .then(response => response.json())
                    .then(data => filterVersion(data))
                     .catch((err) => console.log(err));

                    return await response;
            }
    
        async function filterVersion(item) {
           var list = checkRated(item);
          // return list;

           function checkRated(item) {
                let kidSafe = false;
                    if(item.Rated == "G" || item.Rated =="PG" || item.Rated == "PG-13" || item.Rated == "TV-PG" || item.Rated == "TV-G" || item.Rated == "TV-Y") {
                        kidSafe = true;
                    } else {
                        kidSafe = false;
                    }
                    if(version == "parents") {
                        return item;
                    }
                    else if(version == "kids" && kidSafe) 
                    {   
                        return item;
                } 

           }
            return await list;
        }}})

        router.get("/media/:version/:type/:decade/", async function(req, res) {
            let decade = req.params.decade 
            console.log(decade);
             var newrange = await addRanges();
             console.log(newrange);
             filtereditems = await filterDecade(newrange)
             res.json(filtereditems);

            function addRanges() {
                let range = {
                    "max_year": "0",
                    "min_year": "0"
                };
                if(decade == "nineties") {
                    range.max_year = "1999";
                    range.min_year = "1990";
                } else if (decade == "eighties") {
                    range.max_year = "1989";
                    range.min_year = "1980";
                } else if (decade == "seventies") {
                    range.max_year = "1979";
                    range.min_year = "1970";
                } else if (decade == "sixties") {
                    range.max_year = "1969";
                    range.min_year = "1960"; 
                } else if (decade == "fifties") {
                    range.max_year = "1959";
                    range.min_year = "1950"; 
                }
                return range;

            }
            function filterDecade(range) {
                let len = Object.entries(newitems).length;
                let items = {};
                for (let i = 0;i < len; i++) {
                    console.log(range);
                    console.log(newitems[i].Year);
                    if(newitems[i].Year >= range.min_year && newitems[i].Year <= range.max_year) {
                        items[i] = newitems[i];
                    }
                }
               return items;
            }
        })


module.exports = router;