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
            console.log(`api connection successful. getting results for ${req.params.decade}, ${req.params.type}, ${req.params.version}`);
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
            console.log(list);
            res.json(list);

            // res.json(filtereditems);

                // cut start here

            async function loadMedia() {
                    let k = 0;
                    let url = "";
                    if(type == "tv") {
                        url = "https://imdb8.p.rapidapi.com/title/get-most-popular-tv-shows?homeCountry=US&purchaseCountry=US&currentCountry=US";
                    } else if (type == "movies") { 
                        url ="https://imdb8.p.rapidapi.com/title/get-best-picture-winners";
                    } else if (type == "music") {
                        let list = musicSearch();
                        return await list;
                    }
                    var response = await fetch(url, {
                        "method": "GET",
                        "headers": headers
                    }) 
                    .then(response => response.json())
                    .then(data => getID(data))
                    .catch((err) => console.log(err));
                    return await response;
                
                async function musicSearch() {
                    let headers = {
                        "x-rapidapi-key": "6d810c5c17mshac4a8e74973b5f5p170738jsn1558e894e034",
                        "x-rapidapi-host":  "youtube-search-results.p.rapidapi.com"
                    }
                        let q = ``
                        if(decade == "fifties") {
                            q = "1950s+hits+playlist";
                        } else if (decade=="sixties") {
                            q = "1960s+hits+playlist";
                        } else if (decade=="seventies") {
                            q = "1970s+hits+playlist";
                        } else if (decade=="eighties") {
                            q = "1980s+hits+playlist";
                        } else if (decade=="nineties") {
                            q = "1990s+hits+playlist";
                        }


                        url = `https://youtube.googleapis.com/youtube/v3/search?maxResults=1&q=${q}&type=playlist&key=AIzaSyCldbbSMp26ITf_rmQoliAOXky-ZcQUcuw`;
                        var response = await fetch(url, {
                            "method": "GET",
                        }) 
                        .then(response => response.json())
                        .then(data => getSongs(data))
                        .catch((err) => console.log(err));
                        return await response;
                    }
                    
                    async function getSongs(playlist) {
                        playlist = playlist["items"][0]["id"]["playlistId"];
                        //console.log(playlist);
                      url = `https://youtube-v31.p.rapidapi.com/playlistItems?playlistId=${playlist}&part=snippet&maxResults=20`;
                        var response = await fetch(url, {
                         "method": "GET",
                         "headers": { "x-rapidapi-key": "6d810c5c17mshac4a8e74973b5f5p170738jsn1558e894e034",
                         "x-rapidapi-host": "youtube-v31.p.rapidapi.com" }
                     }) 
                     .then(response => response.json())
                     .then(data => getInfo(data))
                     .catch((err) => console.log(err));
                     return await response;
                     }

                        
                async function getInfo(list) {
                    var currentitems = {};
                    // var song = {};

                    for (let i = 1; i<Object.entries(list["items"]).length; i++) {
                        let song = {
                            id: "",
                            title: "",
                            artist: "",
                            cover: "", 
                        }
                        let id = list["items"][i]["snippet"]["resourceId"]["videoId"];
                        let title = list["items"][i]["snippet"]["title"];
                        title = title.replace(/\s*\(.*?\)\s*/g, '');
                        title = title.replace(/\s*\[.*?\]\s*/g, '');
                        title = title.replace("HQ", "");
                        title = title.replace("Audio", "");
                        title = title.replace("HD", "");
                        title = title.replace("Official Video", "");
                        title = title.replace("Official Music Video", "");
                        title = title.replace(/[^a-zA-Z ]/g, "");
                        title = title.trim();
                        title.replace(/[0-9]/g, '');
                        title = encodeURI(title);
                        song.id = id;
                        var deets = await getSongDeets(title);
                        song.cover = deets.cover;
                        song.artist = deets.artist;
                        if(deets.title == "Unknown") {
                            song.title = title
                        } else {
                            song.title = deets.title;
                        }
                         currentitems[i] = song;
                    }
                    return currentitems;
                }

                async function getSongDeets(song) {
                    url = `https://api.discogs.com/database/search?q=${song}&per_page=5&page=1&token=dXtpEukLgaTPuPHWVmajYMxWaqRJWiZOIlhKxNZM`;
                    
                    var response = await fetch(url, {
                        "method": "GET"
                    }
                    ) 
                    .then(response => response.json())
                    .then(data =>deets(data))
                    .catch((err) => console.log(err));
                    //console.log(response);
                    return await response;

                async function deets(song) {
                    //console.log((Object.entries(song["results"]).length));
                    if(Object.entries(song["results"]).length < 1) {
                        console.log("none found :(");
                        var details = {
                            "id": "0",
                            "title": "Unknown",
                            "artist": "Unknown Artist",
                            "cover": "https://cloud.netlifyusercontent.com/assets/344dbf88-fdf9-42bb-adb4-46f01eedd629/6d05daa9-225d-4bf2-9a78-5fcb52abce7a/58.jpg",     
                        }
                        return details;
                    } else  { 
                        for(let i=0; i<Object.entries(song["results"]).length; i++) {
                            let thissong = song["results"][i];
                            console.log(thissong);
                            //console.log(thissong.type);
                            if(thissong["type"] == "release") {
                                let name = thissong["title"];
                                console.log("this is a release!");
                                var temp = name.split("-");
                                let artist = temp[0].trim();
                                let title = temp[1].trim();
                                let cover = thissong["cover_image"];
                                var details = {
                                    "artist": artist,
                                    "title": title,
                                    "cover": cover
                                 }
                                 //console.log(details);
                                return details;
                            } else {
                                console.log("not a release :/");
                            }
                        }

                    }
                 }
                }

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
                    }
                    else {
                        return await filterDecade(filtered);
                    }
                   async function filterDecade(item) {
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