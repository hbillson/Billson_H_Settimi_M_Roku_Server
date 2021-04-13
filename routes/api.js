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

router.get("/videos/:q/", async function(req, res) {
    let q = `${req.params.q} Trailer 1080p`;
    console.log(q);

    let url = `https://youtube-search-results.p.rapidapi.com/youtube-search/?q=${q}`;
    var response = await fetch(url, {
        "method": "GET",
        "headers": {	"x-rapidapi-key": "6d810c5c17mshac4a8e74973b5f5p170738jsn1558e894e034",
		"x-rapidapi-host": "youtube-search-results.p.rapidapi.com"}
    }) 
    .then(response => response.json())
    .then (data => getID(data))
    .catch((err) => console.log(err));
    res.json(await response);

    async function getID(item)  {
        let id = item["items"][1]["id"];
        let url = `https://www.youtube.com/embed/${id}`
        return url;
    }
})

        router.get("/media/:version/:type/:decade/", async function(req, res) {
            let decade = req.params.decade 
            let type = req.params.type;
            let version = req.params.version;
            let items = {};
            let i = 0;
            let headers = {
                "x-rapidapi-key": "6d810c5c17mshac4a8e74973b5f5p170738jsn1558e894e034",
                "x-rapidapi-host": "imdb8.p.rapidapi.com"
            }
            var list = await loadMedia();
           // console.log(currentitems);
            console.log(list);
            res.json(list);

            // res.json(filtereditems);

                // cut start here

            async function loadMedia() {
                console.log(`loading ${version} ${type} ${decade}`);
                    let k = 0;
                    let url = "";
                    if(type == "tv") {
                        url = "https://imdb8.p.rapidapi.com/title/get-most-popular-tv-shows?homeCountry=US&purchaseCountry=US&currentCountry=US";
                    } else if (type == "movies") { 
                        url ="https://imdb8.p.rapidapi.com/title/get-best-picture-winners";
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
                    var filtered = await checkRated(item);
                    if(filtered == "no") {
                       // console.log("not selected");
                    }
                    else {
                        return await filterDecade(filtered);
                    }
                   async function filterDecade(item) {
                       //console.log(item);
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
                        if(item.Year >= range.min_year && item.Year <= range.max_year) {
                             return item
                        }
                                           //     let len = Object.entries(newitems).length;
                    //     let items = {};
                    //     for (let i = 0;i < len; i++) {
                    //         if(newitems[i].Year >= range.min_year && newitems[i].Year <= range.max_year) {
                    //             items[i] = newitems[i];
                    //         }
                    //     }
                    //    return items;
                    }
                // return list;
                async function checkRated(item) {
                    let filtereditem = {};

                        if (version == "parents") {
                            filtereditem = item;

                        } else if (version == "kids") {
                            if(item.Rated == "G" || item.Rated =="PG" || item.Rated == "PG-13" || item.Rated == "TV-PG" || item.Rated == "TV-G" || item.Rated == "TV-Y") {
                                filtereditem = item;
                            } else {
                                filtereditem = "no";
                            }
                        }
                        return filtereditem;
                    }                
                }}
             // cut here 

        })


module.exports = router;