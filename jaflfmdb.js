const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const username = urlParams.get('username')
const useai = urlParams.get('useai')

console.log(username);
console.log(useai);

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

    let relative_time = null;

    var date = new Date();
    var now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
                date.getUTCDate(), date.getUTCHours(),
                date.getUTCMinutes(), date.getUTCSeconds());

    if (last_track.date) {
        var unix_date = last_track.date.uts
        relative_time = timeDifference(now_utc, unix_date)
    }

    document.getElementById("scrobbling").innerHTML = (relative_time != null) ? "...scrobbled " + relative_time : "...is scrobbling now"

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

        var filteredTrack;

        const chars = "()-[],";
        const escaped = chars.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'); 
        const regex = new RegExp(`[${escaped}]`, 'g');
        const index = track.search(regex);

        if (index > 0)
        {
            filteredTrack = track.substr(0, index);
        }
        else
        {
            filteredTrack = track;
        }

        imageDescription = 'Use "'
        var imageDescription = imageDescription.concat(getStyle(), '" to generate ', getMood(), ' interpretation of "', filteredTrack.trimEnd(), '" ', getLocation());

        var encodedImageDescription = encodeURIComponent(imageDescription);
        console.log(imageDescription);

        if (useai == true)
        {
            document.getElementById("thebody").style.backgroundImage = "url(./images/simple_pixel_tile.png), url('./images/vignette_001.png'), url(https://pollinations.ai/p/" + encodedImageDescription + "?seed=" + getSeed() + "&nologo=true&model=flux)";
        }
        else
        {
            document.getElementById("thebody").style.backgroundImage = "url(./images/simple_pixel_tile.png), url('./images/vignette_001.png'), url(" + artist_imageLink + ")";
        }

        
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

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - (previous * 1000);

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function getSeed()
{
    return randomNumber = Math.floor(Math.random() * 1000000) + 1;
}

function getStyle()
{
    const array = [
        "3D drawing technique",
        "3D tattoo style",
        "8 bit style",
        "Abstract Expressionism style",
        "Academic drawing style",
        "Alien style",
        "Airbrush technique",
        "Art Nouveau style",
        "Actionhero style",
        "Astrophotography style",
        "Bauhaus style",
        "Baroque Art style",
        "Biomechanical style",
        "Biomechanical tattoo style",
        "Black and White Photography technique",
        "Camo style",
        "Classicism Art style",
        "Conceptual Art style",
        "Drip Painting technique",
        "Expressionism Art style",
        "Antique style",
        "Black and white style",
        "Black and Grey tattoo style",
        "Cartoon style",
        "comic book style",
        "Crosshatching technique",
        "Dalle de verre technique",
        "Dotwork tattoo style",
        "Doodle style",
        "Droste Effect style",
        "Dry brushing technique",
        "Embossing technique",
        "Etching technique",
        "Egyptian Hieroglyph style",
        "faded photograph style",
        "Fingerpainting technique",
        "Fresco technique",
        "Geometric Drawing Style",
        "Geometric Tattoo Style",
        "glow in the dark style",
        "gothic art style",
        "Gradation technique",
        "graffiti art style",
        "Grattage technique",
        "Grisaille technique",
        "Hatching technique",
        "HDR Photography technique",
        "Hyperrealism style",
        "Hyperrealism drawing style",
        "Hyperrealism tattoo style",
        "Ice sculpting style",
        "Illusionistic ceiling painting technique",
        "Infrared Photography technique",
        "Japanese Tattoo Style",
        "Kinetic Art style",
        "Land Art style",
        "Lithography technique",
        "Long Exposure Photos technique",
        "long shutterspeed style",
        "line drawing style",
        "Macro Photography technique",
        "Matrix style",
        "Mosaic art technique",
        "Motion Blur Photography technique",
        "Mural Painting technique",
        "Negative Space tattoo style",
        "Night Photography technique",
        "Neoclassicism style",
        "newspaper style",
        "outline style",
        "Old School Tattoo Style",
        "Paint by number technique",
        "Pencil shading technique",
        "Photorealism style",
        "Pop Art style",
        "Pointillism technique",
        "Prison tattoo style",
        "Relief art technique",
        "raytrace style",
        "Renaissance style",
        "Sand sculpting style",
        "Screen printing technique",
        "Screentone texture technique",
        "Smoke Art Photography technique",
        "Stencil and Masking technique",
        "Sfumato technique",
        "Spray painting technique",
        "Tesselation technique",
        "Terminator style",
        "Tilt-Shift Photography technique",
        "Tribal tattoo style",
        "Traditional tattoo style",
        "Ransom note style",
        "Scumbling style",
        "Sepia photography style",
        "Shallow depth of field style",
        "Splatter/Splash Paint technique",
        "Etch and sketch style",
        "Spraypaint template style",
        "Stippling drawing style",
        "Street Art style",
        "Street photography style",
        "Tattoo Drawing Style",
        "Two tone photography style",
        "Wanted poster style",
        "Watercolor painting style",
        "Woodblock printing technique",
//        "Derek Riggs style",
//        "Dan Seagrave style",
//        "Vincent Locke style",
//        "Travis Smith style",
//        "Eliran Kantor style",
//        "Mariusz Lewandowski style",
//        "Andy Warhol style",
//        "Banksy style",
//        "H.R. Giger style",
//        "Hieronymus Bosch style",
//        "Johannes Vermeer style",
//        "Leonardo da Vinci style",
//        "M.C. Escher style",
//        "Michael Whelan style",
//        "Michelangelo style",
//        "Vincent Van Gogh style",
//        "Pablo Picasso style",
//        "Piet Mondriaan style",
//        "Rembrandt van Rijn style",
//        "Salvador Dali style",
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return randomValue;
}

function getMood()
{
    const array = [
        "an abstract",
        "an aggressive",
        "an amazing",
        "an ancient",
        "an antisocial",
        "an angry",
        "an artistic",
        "an atomic",
        "a backlit",
        "a bioluminescent",
        "a bleading",
        "a bleak",
        "a blessed",
        "a bloody",
        "a blood splattered",
        "a blurry",
        "a blue",
        "a boiling",
        "a broken",
        "a burning",
        "a burned",
        "a burnt",
        "a buried",
        "a brittle",
        "a cadaverous",
        "a carneous",
        "a catastrophic",
        "a chaotic",
        "a chromatic",
        "a circulair",
        "a comfortable",
        "a cold",
        "a colossal",
        "a comatose",
        "a copper",
        "a creepy",
        "a criminal",
        "a crimson",
        "a crooked",
        "a crumbling",
        "a crushed",
        "a crushing",
        "a crystal",
        "a cyberpunk",
        "a cursed",
        "a damned",
        "a dark",
        "a dead",
        "a deadly",
        "a deep",
        "a decayed",
        "a deceased",
        "a deceptive",
        "a deformed",
        "a demonic",
        "a disillusioned",
        "a desolated",
        "a destroyed",
        "a destructed",
        "a detonating",
        "a dirty",
        "a disgusting",
        "a distorted",
        "a divine",
        "a doomed",
        "a dreamy",
        "a dripping",
        "a dry",
        "a dying",
        "a dusty",
        "an embryonic",
        "an emerald",
        "an empty",
        "an enchanted",
        "an ephemeral",
        "an eternal",
        "an evil",
        "an expendable",
        "an exploding",
        "a fast",
        "a fatal",
        "a flaming",
        "a fearless",
        "a fermented",
        "a forensic",
        "a freezing",
        "a frozen",
        "a funny",
        "a futuristic",
        "a geeky",
        "a ghostly",
        "a glowing",
        "a golden",
        "a guilty",
        "a great",
        "a green",
        "a grinning",
        "a grotesque",
        "a gruesome",
        "a happy",
        "a haunting",
        "a hazy",
        "a hexagon",
        "a high",
        "a hidden",
        "a hopeless",
        "a hot",
        "a incarnated",
        "an inhuman",
        "an insane",
        "an intergalactic",
        "an intoxicated",
        "a killing",
        "a killed",
        "a lava",
        "a lethargic",
        "a liquid",
        "a lifeless",
        "a living",
        "a loud",
        "a lonely",
        "a lost",
        "a maniacally",
        "a mean",
        "a mechanic",
        "a metal",
        "a misty",
        "a mirrored",
        "a moody",
        "a molten",
        "a monochrome",
        "a morbid",
        "a muddy",
        "a mysterious",
        "a natural",
        "a necrophobic",
        "a nerdy",
        "a neon",
        "a nuclear",
        "an old",
        "an orange",
        "an ordinary",
        "a parallel",
        "a pathetic",
        "a plasma",
        "a plastic",
        "a polarized",
        "a polished",
        "a psychedelic",
        "a purple",
        "a rainy",
        "a ravenous",
        "a red",
        "a religious",
        "a round",
        "a rotten",
        "a rude",
        "a ruined",
        "a rusty",
        "a sad",
        "a sadistic",
        "a satanic",
        "a savage",
        "a scientific",
        "a sealed",
        "a shiny",
        "a shocked",
        "a shocking",
        "a shrouded",
        "a slimy",
        "a silent",
        "a smoky",
        "a snowy",
        "a solvent",
        "a spiritual",
        "a steampunk",
        "a sticky",
        "a stoned",
        "a stone",
        "a strange",
        "a stupid",
        "a submerged",
        "a suffocating",
        "a suggestive",
        "a suicidal",
        "a sunny",
        "a surprised",
        "a surreal",
        "a square",
        "a tenacious",
        "a terrified",
        "a teutonic",
        "a thrashed",
        "a threatening",
        "a trashed",
        "a tragic",
        "a tripping",
        "a twisted",
        "an ugly",
        "an unbreakable",
        "an underwater",
        "an unsettling",
        "an unnatural",
        "a violent",
        "a wasted",
        "a wet",
        "a yellow",
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return randomValue;
}

function getLocation()
{
    const array = [
        "in Amsterdam",
        "in ancient Egypt",
        "in ancient Greece",
        "in ancient Rome",
        "in Barcelona",
        "in England during the middleages",
        "in Chicago",
        "in Dubai",
        "in Gibraltar",
        "in Hell",
        "in Japan",
        "in Las Vegas",
        "in Los Angeles",
        "in Mexico",
        "in Miami",
        "in New York",
        "in New Zealand",
        "in Iceland",
        "in Paris",
        "in Pisa",
        "in Pompeii",
        "in Purgatory",
        "in San Francisco",
        "in Scotland",
        "in South Africa",
        "in Sydney",
        "in Thailand",
        "in a burned forrest",
        "in a digital world",
        "in a forrest",
        "in a futuristic city",
        "in a post apocalyptic world",
        "in a room a thousand miles wide",
        "in the Jungle",
        "in the Sahara",
        "at Area 51",
        "at Starbase",
        "at Cape Canaveral",
        "at Death Valley",
        "at a castle",
        "at a crimescene",
        "at a factory",
        "at a farm",
        "at a heavy metal concert",
        "at a heavy metal festival",
        "at a German Oktoberfest",
        "at a graveyard",
        "at a Nordic Fjord",
        "at a ZOO",
        "at an erupting volcano",
        "at great hights",
        "a nuclear falout site",
        "at the Antartic",
        "at the airport",
        "at the beach",
        "at the beach during sunset",
        "at the Grand Canyon",
        "at the Harbor",
        "at the highway",
        "at the killing fields",
        "at the White House",
        "at a landing strip",
        "at a moonbase",
        "at lightspeed",
        "at the Golden Gate Bridge",
        "at the movies",
        "at the ocean floor",
        "at the racing track",
        "at the swimmingpool",
        "at sea during a violent storm",
        "at the summit of Mount Everest",
        "at the surface of the sun",
        "at the swamp",
        "at route 66",
        "at school",
        "during a barfight",
        "during a basejump",
        "during a carchase",
        "during a civilization collapse",
        "during a cruise",
        "during a disaster",
        "during a facemeld",
        "during a flood",
        "during a firestorm",
        "during a meltdown",
        "during a robbery",
        "during a rocket launch",
        "during a stampede",
        "during a tornado",
        "during a tsunami",
        "during a world wide pandemic",
        "during a spacewar",
        "during a Tatooine sunset",
        "during an alien invasion",
        "during an imminent impact",
        "during Jurassic times",
        "during liftoff",
        "during re-entry",
        "during the American Civil War",
        "during the middle ages",
        "during the Vietnam war",
        "during WW1",
        "during WW2",
        "in a bomber",
        "in a bunker",
        "in a bus",
        "in a car",
        "in a carcrash",
        "in a communistic state",
        "in a dragons lair",
        "in a dungeon",
        "in a lab",
        "in a plane",
        "in a planecrash",
        "in a powerboat",
        "in a shredder",
        "in a stealth plane",
        "in a submarine",
        "in a truck",
        "in a tank",
        "in a tunnel",
        "in a warplane",
        "in a wormhole",
        "in an elevator shaft",
        "in an emergency room of a hospital",
        "in freefall",
        "in my house on Mars",
        "in prison",
        "in the 1920's",
        "in the 1930's",
        "in the 1940's",
        "in the 1950's",
        "in the 1960's",
        "in the 1970's",
        "in the 1980's",
        "in the 1990's",
        "in the air",
        "in the clouds",
        "in the desert",
        "in the mountains",
        "in the International Space Station",
        "in the sewer",
        "in the shadows",
        "in the wild west",
        "in the woods during a storm",
        "in space",
        "in a jar of flies",
        "in a warzone",
        "in a coalmine",
        "in a beehive",
        "in a cellar",
        "in a madhouse",
        "in a torture dungeon",
        "in a stadium",
        "in a steel mill",
        "in a testtube",
        "in a Zeppelin",
        "in an execution chamber",
        "in orbit",
        "in orbit near Saturn",
        "inside a desktop computer",
        "inside a tube",
        "inside my head",
        "inside my mind",
        "near a nuclear explosion",
        "near a waterfall",
        "on a lake of fire",
        "on a desolated lifeless planet",
        "on a dragonship",
        "on an oil rigg",
        "on a sinking ship",
        "on a skislope",
        "on a raft",
        "on a warship",
        "on Tatooine",
        "on the Deathstar",
        "on the surface of the moon",
        "on Mount Vesuvius",
        "surrounded by fields of corn",
        "under the bridge",
        "while kayaking",
        "while skydiving",
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return randomValue;
}


$(function() {
    setInterval(fetchData, 5000);
});

window.onload = function() {
    fetchData();
};