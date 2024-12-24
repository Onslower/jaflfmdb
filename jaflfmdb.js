const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const username = urlParams.get('username')
console.log(username);

// get your own last.fm api key from https://www.last.fm/api/account/create

const recenttracks_url = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json&extended=true&api_key=" + LASTFM_API_KEY + "&limit=1&user=" + username
let lastTrackMbid = "";
let lastTrackName = "";

const fetchData = async () => {
    const recenttracks_response = await fetch(recenttracks_url);
    const recenttracks_json = await recenttracks_response.json(); //extract JSON from the http response

    var last_track = recenttracks_json.recenttracks.track[0];
    var track = last_track.name;
    var artist = last_track.artist.name;
    var album = last_track.album["#text"];
    var album_imageLink = last_track.image[3]["#text"].replace("300x300", "");
    const currentTrackMbid = last_track.mbid;

    if (lastTrackName != track || lastTrackMbid != currentTrackMbid)
    {
        console.log(recenttracks_url);
        console.log(recenttracks_json);

        lastTrackMbid = currentTrackMbid;
        lastTrackName = track;

        document.getElementById("track").innerHTML = track;
        document.getElementById("album").innerHTML = album;
        document.getElementById("artist").innerHTML = artist;
        document.getElementById("albumimg").src=album_imageLink;

        document.title = track + " - " + artist;

        const userInfoJson = await getUser(username);
        console.log(userInfoJson);
        const lastFmUser = userInfoJson.user.name;
        const avatarImgLink = userInfoJson.user.image[0]["#text"];
        const playcount = userInfoJson.user.playcount;
        const artist_count = userInfoJson.user.artist_count;
        const track_count = userInfoJson.user.track_count;
        const album_count = userInfoJson.user.album_count;
        
        document.getElementById("lastfmuser").innerHTML = lastFmUser;
        document.getElementById("avatarimg").src=avatarImgLink;
        document.getElementById("playcount").innerHTML = playcount;
        document.getElementById("artist_count").innerHTML = artist_count;
        document.getElementById("track_count").innerHTML = track_count;
        document.getElementById("album_count").innerHTML = album_count;

        var artist_url = "https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&format=json&artist=" + encodeURIComponent(artist) + "&api_key=" + LASTFM_API_KEY + "&user=" + username
        console.log(artist_url);
        const artist_response = await fetch(artist_url);
        const artist_json = await artist_response.json();
        console.log(artist_json);

        var artist_imageLink = artist_json.artist.image[5]["#text"].replace("300x300", "");
        var artist_bio = artist_json.artist.bio.content;
        var artist_listeners = artist_json.artist.stats.listeners;
        var artist_playcount = artist_json.artist.stats.playcount;
        var artist_userplaycount = artist_json.artist.stats.userplaycount;
        var artist_userplaycount_percentage = artist_userplaycount / artist_playcount * 100;
        var artist_userplaycount_percentage_rounded = Math.round(artist_userplaycount_percentage * 10000) / 10000;

        var album_url = "https://ws.audioscrobbler.com/2.0/?method=album.getinfo&format=json&artist=" + encodeURIComponent(artist) + "&album=" + encodeURIComponent(album) + "&api_key=" + LASTFM_API_KEY + "&user=" + username
        console.log(album_url);
        const album_response = await fetch(album_url);
        const album_json = await album_response.json();
        console.log(album_json);
        var album_userplaycount = album_json.album.userplaycount;


        var track_url = "https://ws.audioscrobbler.com/2.0/?method=track.getinfo&format=json&artist=" + encodeURIComponent(artist) + "&track=" + encodeURIComponent(track) + "&api_key=" + LASTFM_API_KEY + "&user=" + username
        console.log(track_url);
        const track_response = await fetch(track_url);
        const track_json = await track_response.json();
        console.log(track_json);

        var track_userplaycount = track_json.track.userplaycount;

        var tags = [];

        var tracktags = track_json.track.toptags.tag;
        console.log(tracktags);

        var container = document.getElementById("tagcontainer");
        container.innerHTML = "";
        tracktags.forEach(function (tag) {
            tags.push(tag.name.toLowerCase().trim());
        });

        if (tags.length == 0)
        {
            var artisttags = artist_json.artist.tags.tag;
            console.log(artisttags);

            artisttags.forEach(function (tag) {
                tags.push(tag.name.toLowerCase().trim());
            });
        }

        tags.forEach(function (tag) {
            var div = document.createElement("div");
            div.innerText = tag;
            div.classList.add("artisttag");
            container.append(div);
        });

        console.log(tags);

                
        document.getElementById("thebody").style.backgroundImage = "url(./images/simple_pixel_tile.png), url('./images/vignette_001.png'), url(" + artist_imageLink + ")";
        
        document.getElementById("artistbio").innerHTML = artist_bio;

        document.getElementById("artist_url").innerHTML = artist_url;
        document.getElementById("recenttracks_url").innerHTML = recenttracks_url;

        document.getElementById("artist_listeners").innerHTML = artist_listeners;
        document.getElementById("artist_playcount").innerHTML = artist_playcount;
        document.getElementById("artist_userplaycount").innerHTML = artist_userplaycount;
        document.getElementById("artist_userplaycount_percentage").innerHTML = artist_userplaycount_percentage_rounded;

        document.getElementById("album_userplaycount").innerHTML = album_userplaycount;

        document.getElementById("track_userplaycount").innerHTML = track_userplaycount;

    }
}

async function getUser(username) {
    const userInfoUrl = "https://ws.audioscrobbler.com/2.0/?method=user.getinfo&format=json&api_key=" + LASTFM_API_KEY + "&user=" + username;
    const userInfoResponse = await fetch(userInfoUrl);
    const userInfoJson = await userInfoResponse.json();
    return userInfoJson;
}

$(function() {
    setInterval(fetchData, 5000);
});

window.onload = function() {
    fetchData();
};