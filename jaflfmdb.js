const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const username = urlParams.get('username')
const useai = urlParams.get('useai')
const useArtist = 1;
const useAlbum = 1;
const useScene = 1;
const useStyle = 1;
const useSeasoning = 1;
const useWhere = 1;

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
        var bla = "lastTrackName: " + lastTrackName;
        bla += "\r\ntrack: " + track;
        bla += "\r\nlastTrackMbid: " + lastTrackMbid
        bla += "\r\ncurrentTrackMbid: " + currentTrackMbid;

        console.log(bla);

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

        const width = window.innerWidth;
        const height = window.innerHeight;
        console.log("Viewport size:", width, height);

        console.log(tags);

        var imageDescription = "";
        imageDescription += getTrack(track);
        imageDescription += getArtist(artist);
        imageDescription += getAlbum(album);
        imageDescription += getScene();
        imageDescription += getStyle();
        imageDescription += getWhere();
        imageDescription += getSeasoning();

        var encodedImageDescription = encodeURIComponent(imageDescription);
        var pollinationsModel = getPollinationsModel();

        console.log(imageDescription + " - using model: " + pollinationsModel);


        var pollinationsUrl = "https://pollinations.ai/p/" + encodedImageDescription + "?seed=" + getSeed() + "&nologo=true&model=" + pollinationsModel + "&width=" + width + "&height=" + height;

        if (useai == true)
        {
            document.getElementById("artwork").innerHTML = imageDescription + " - using model: " + pollinationsModel;
            document.getElementById("goUrl").href=pollinationsUrl;
            document.getElementById("thebody").style.backgroundImage = "url(./images/transparant_1x1.png), url('./images/transparant_1x1.png'), url(" + pollinationsUrl + ")";
        }
        else
        {
            document.getElementById("artwork").innerHTML = "";
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

function getTrack(track)
{
    return getFiltered(track).trimEnd();
}

function getAlbum(album)
{
    if (useAlbum != 1)
        return "";

    return ', ' + getFiltered(album).trimEnd();
}


function getArtist(artist)
{
    if (useArtist != 1)
        return "";

    return ', ' + getFiltered(artist).trimEnd();
}


function getFiltered(filterMe)
{
    // First Remove quotes and double qoutes
    filterMe = filterMe.replace(/['"]/g, "");

    // Chop everything afer ()-[],
    // Because that's usualy where the Live / remaster / featuring mess living
    const chars = "()-[],";
    const escaped = chars.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'); 
    const regex = new RegExp(`[${escaped}]`, 'g');
    const index = filterMe.search(regex);

    if (index > 0)
    {
        filtered = filterMe.substr(0, index);
    }
    else
    {
        filtered = filterMe;
    }

    return filtered;
}

function getPollinationsModel()
{
    const array = [
        "flux",
        // "kontext", limited to users in the seed tier or higher
        "turbo",
        // "gptimage", limited to users in the seed tier or higher
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return randomValue;
}


function getStyle()
{
    const array = [
        // Basic styles
        "3D drawing style",
        "3D tattoo style",
        "8 bit graphics style",
        "Abstract Expressionism style",
        "Academic drawing style",
        "Alien style",
        "Airbrush style",
        "Anime art style",
        "Actionhero style",
        "Art Nouveau style",
        "ASCII Art style",
        "Asterix & Obelix cartoon style",
        "Astrophotography style",
        "Bauhaus style",
        "Back lighting style",
        "Baroque Art style",
        "Biomechanical style",
        "Biomechanical tattoo style",
        "Black and White Photography style",
        "Bob Ross painting style",
        "Caricature drawing style",
        "Celtic style",
        "Chalkboard school style",
        "Chalkboard art style",
        "Classicism art style",
        "Coffeestain art style",
        "Commodore 64 graphics style",
        "Conceptual Art style",
        "Drip Painting style",
        "Expressionism Art style",
        "Antique style",
        "Black and white style",
        "Black and Grey tattoo style",
        "Beavis and Butthead cartoon style",
        "Cartoon style",
        "Chiaroscuro Lighting style",
        "Cinemagraphs photography style",
        "Color Blast photography style",
        "Comic book style",
        "Crosshatching style",
        "Crystal Ball Photography style",
        "Dalle de verre style",
        "Dark surreal art style",
        "Delft Blue style",
        "Digital halftoning style",
        "Disney cartoon style",
        "Don Martin cartoon style",
        "Doom style",
        "Dotwork tattoo style",
        "Doodle style",
        "Dry brushing style",
        "Duotone Photography style",
        "Embossing style",
        "Etch and sketch style",
        "Etching style",
        "Egyptian Hieroglyph style",
        "Facade lighting style",
        "Faded photograph style",
        "Family guy cartoon style",
        "Flat Lay Photography style",
        "Fill Lighting style",
        "Fingerpainting style",
        "Fresco style",
        "Futurama cartoon style",
        "Garfield cartoon style",
        "Geometric Drawing Style",
        "Geometric Tattoo Style",
        "glow in the dark style",
        "gothic art style",
        "Gradation style",
        "graffiti art style",
        "Grattage style",
        "Grisaille style",
        "Guust Flater cartoon style",
        "GTA3 style",
        "GTA4 style",
        "GTA5 style",
        "Half-life style",
        "Halftone art style",
        "Halftone dot black and white style",
        "Halftone dot style",
        "Hanna Barbera style",
        "Hatching style",
        "Hard Lighting style",
        "HDR Photography style",
        "High Key Lighting photography style",
        "Hyperrealism style",
        "Hyperrealism drawing style",
        "Hyperrealism tattoo style",
        "Ice sculpting style",
        "Illusionistic ceiling painting style",
        "Infrared Photography style",
        "Inverse halftoning style",
        "Japanese Tattoo Style",
        "Joe Bar Team cartoon style",
        "Kaleidoscope Photography style",
        "Key Lighting style",
        "Kinetic Art style",
        "Land Art style",
        "large halftone dot style",
        "Large pixel style",
        "Light Painting style",
        "Line drawing style",
        "Lithography style",
        "Looney Tunes cartoon style",
        "Lomography style",
        "Long Exposure Photos style",
        "long shutterspeed style",
        "Low Key Lighting photography style",
        "Macro Photography style",
        "Matrix style",
        "Monochromatic photography style",
        "Moroccan tiles style",
        "Monochrome monitor style",
        "Mosaic art style",
        "Motion Blur Photography style",
        "Motivated Lighting style",
        "Movie poster style",
        "Mural Painting style",
        "Negative fill style",
        "Negative Space tattoo style",
        "Night Photography style",
        "Neoclassicism style",
        "newspaper style",
        "outline style",
        "Old School Tattoo style",
        "Optical illusion style",
        "Origami style",
        "Paint by number style",
        "Pencil shading style",
        "Photorealism style",
        "Pinhole Photography style",
        "Pop Art style",
        "Pointillism style",
        "Predator style",
        "Prison tattoo style",
        "Quake style",
        "Relief art style",
        "Raytrace style",
        "Ren and Stimpy style",
        "Renaissance style",
        "Roadrunner cartoon style",
        "Rick and Morty cartoon style",
        "Sand sculpting style",
        "Scooby Doo cartoon style",
        "Screen printing style",
        "Screentone texture style",
        "Side Lighting style",
        "Simpsons cartoon style",
        "Smoke Art Photography style",
        "Snow sculpture style",
        "Soft Light style",
        "Southpark cartoon style",
        "Spongebob Squarepants cartoon style",
        "Spot Color photography style",
        "Steel Wool Photography style",
        "Stencil and Masking style",
        "Sfumato style",
        "Spray painting style",
        "Super Mario Bros style",
        "Tesselation style",
        "Terminator style",
        "The Far Side cartoon style",
        "Tilt-Shift Photography style",
        "Tim Burton cartoon style",
        "Tintin cartoon style",
        "Tom and Jerry cartoon style",
        "Toy Camera Photography style",
        "Tribal tattoo style",
        "Traditional tattoo style",
        "Ransom note style",
        "Scumbling style",
        "Sepia photography style",
        "Shallow depth of field style",
        "Splatter/Splash Paint style",
        "Soft Focus photography style",
        "Spraypaint template style",
        "Stippling drawing style",
        "Street Art style",
        "Street photography style",
        "Tattoo Drawing Style",
        "Two tone photography style",
        "Unreal tournament style",
        "Wanted poster style",
        "Watercolor painting style",
        "Woodblock printing style",
        "X-ray photo style",
        "Zoom Blur photography style",

        // Artists
        "Andy Warhol style",
        "Banksy style",
        "Chris Moore style",
        "Christopher Foss style",
        "Dan Seagrave style",
        "Derek Riggs style",
        "Eliran Kantor style",
        "H.R. Giger style",
        "Hieronymus Bosch style",
        "Jim Burns style",
        "Johannes Vermeer style",
        "John Berkey style",
        "Leonardo da Vinci style",
        "Mariusz Lewandowski artist style",
        "M.C. Escher style",
        "Michael Whelan style",
        "Michelangelo style",
        "Pablo Picasso style",
        "Piet Mondriaan style",
        "Rembrandt van Rijn style",
        "Robert Gonsalves style",
        "Salvador Dali style",
        "Travis Smith style",
        "Vincent Di Fate style",
        "Vincent Locke style",
        "Vincent Van Gogh style",
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return ', ' + randomValue;
}

function getScene()
{
    if (useScene != 1)
        return "";

    const array = [
        "an abstract drawing",
        "an Abstract Expressionism drawing",
        "an aerial view",
        "an aerial advertising",
        "as a 30mm film negative",
        "as an academic painting",
        "as an advertisement",
        "an audio cassette cover",
        "as LP album art",
        "a birdseye view",
        "a bottom up view",
        "a close-up",
        "as a computer errormessage",
        "on a backdrop",
        "on a banner",
        "on a beer coaster",
        "on a billboard",
        "as a blueprint",
        "as a BSOD",
        "on a book cover",
        "as a breaking news item",
        "on a canvas",
        "on a CD Jewel Case",
        "on a CD disk",
        "as cinema advertising",
        "as a collection of polaroid photos showing",
        "on a comic cover",
        "on continuous stationary",
        "as a damaged photo",
        "on a damaged wall",
        "as digital advertising",
        "as a diorama",
        "a dramatic view",
        "a dramatic perpective",
        "as a drawing on lined paper",
        "as a drawing on graph paper",
        "as a drawing on grid paper",
        "a dreamscape",
        "as a dot matrix printer printout",
        "as a doodle",
        "on a drive-in movie screen",
        "as a drone shot",
        "on a DVD disk",
        "on an easel",
        "as an embroidery",
        "a figure drawing",
        "a fisheye lens view",
        "a floppy disk",
        "a foggy backlit scene",
        "a geometric drawing",
        "as a glossy magazine photograph",
        "as a hyperrealist drawing",
        "as a hyperrealist painting",
        "as Illusionistic realism",
        "an infrared camera view",
        "as a Knex version",
        "on a label",
        "as a large painting in a museum",
        "on a large lcd display",
        "a Lego Technic version",
        "a Lego version",
        "a long focal length photo",
        "as an LP om a turntable",
        "on a movie theater screen",
        "as a group photo",
        "on a glossy magazine cover",
        "as a label on a LP",
        "on a led display",
        "as a Manga",
        "as a manual",
        "as a Marklin version",
        "as a Meccano version",
        "a minecraft version",
        "a miniature display",
        "a ministeck panel",
        "as a missing person leaflet",
        "as a mobile message",
        "as a Model building set",
        "as a Model building kit",
        "as a model figure",
        "a moonlit scene",
        "a mural",
        "as a newspaper article",
        "as a newspaper photograph",
        "as a photograph using framing",
        "as a photograph using leading lines",
        "as a photograph using low angles",
        "as a photograph using negative space",
        "as a photograph using patterns",
        "as a photograph using symmetry",
        "as a photograph using the rule of thirds",
        "as a Photorealist drawing",
        "as a Photorealist painting",
        "a Playmobil version",
        "a portrait drawing",
        "a portrait photograph",
        "on an old damaged placard",
        "on a faded placard",
        "on an old discolored polaroid photo",
        "as an old faded photo",
        "on an old school monochrome lcd display",
        "as an open-air exposition",
        "as outdoor advertising",
        "as paper money",
        "on a partially burned polaroid photo",
        "as a patent print",
        "as a picture disk on a turntable ",
        "on a placard",
        "on a polaroid",
        "as a popup advertisement",
        "on a printout",
        "as a printed band t-shirt",
        "on a projection screen",
        "as a propaganda poster",
        "as a scale model",
        "as a selfie",
        "as several pictures and drawings on a noticeboard",
        "as seen through a telescope",
        "as seen through a visor",
        "as seen through binoculars",
        "as seen through crosshairs",
        "a screenshot",
        "a short focal length photo",
        "a sketch",
        "a sloppy spraypainted banner",
        "as social media advertising",
        "as a silhouette photograph",
        "on a smartphone display",
        "on a smartwatch display",
        "a still life",
        "a realism drawing",
        "as a reflection on an eye",
        "as a reflection in a broken mirror",
        "as a reflection on a broken window",
        "as a reflection in a car mirror",
        "as reflections in a disco ball",
        "as a reflection in a mirror",
        "as reflections in puddles",
        "as a reflection on an sphere",
        "as a reflection in sunglasses",
        "as a reflection on an window",
        "as televison advertising",
        "a tiled wall",
        "as toy soldiers",
        "as toys",
        "a topdown view",
        "as a Trix construction set",
        "on a video tape",
        "as a wanted poster",
        "as a warning sign",
        "Zoomed in",
        "Zoomed out",
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return ', ' + randomValue;
}

function getWhere()
{
    if (useWhere != 1)
        return "";

    const array = [
        // Cities
        "in Amsterdam",
        "in Angkor",
        "in Athens",
        "in Basel",
        "in Barcelona",
        "in Beirut",
        "in Berlin",
        "in Bangkok",
        "in Beijing",
        "in Cape Town",
        "in Casablanca",
        "in Carthage",
        "in Chicago",
        "in Chernobyl",
        "in Cusco",
        "in Edinburgh",
        "in Ephesus",
        "in Essaouira",
        "in Geiranger",
        "in Geneva",
        "in Gruyères",
        "in Havana",
        "in Hong Kong",
        "in Istanbul",
        "in La Paz",
        "in Las Vegas",
        "In London",
        "in Los Angeles",
        "in Los Santos",
        "in Lucerne",
        "in Luxor",
        "in Malaga",
        "in Marrakesh",
        "in Miami",
        "in Moscow",
        "in Naples",
        "in New Dehli",
        "in New York",
        "in Nome",
        "in Paris",
        "in Pisa",
        "in Pompeii",
        "in Rome",
        "in Ronda",
        "in San Francisco",
        "in Seattle",
        "in Seoul",
        "in Schaffhausen",
        "in Sydney",
        "in Trondheim",
        "in Tokyo",
        "in Val-dIsere",
        "in Venice",
        "in Willemstad",
        "in Yakutsk",

        // Countries and regions
        "in Alaska",
        "in Antarctica",
        "in ancient Egypt",
        "in ancient Greece",
        "in ancient Rome",
        "in Austria",
        "in Australia",
        "in Curaçao",
        "in Dubai",
        "in England",
        "in Faroe Islands",
        "in Germany",
        "in Gibraltar",
        "in Greenland",
        "in Iceland",
        "in India",
        "in Iraq",
        "in Iran",
        "in Istanbul",
        "in Japan",
        "in Key West",
        "in Kuala Lumpur",
        "in Madagascar",
        "in Mexico",
        "in Monaco",
        "in New Zealand",
        "in North Korea",
        "in Pakistan",
        "in Qatar",
        "in Scotland",
        "in Siberia",
        "in Singapore",
        "in South Africa",
        "in South Korea",
        "in Svalbard",
        "in Thailand",
        "in the Outback",
        "in Tuscany",
        "in Vietnam",

        // Fictional
        "in Alfheim",
        "in Asgard",
        "in Asteroid City",
        "in Atlantis",
        "in Bedrock",
        "at Bikini Bottom",
        "in Camelot",
        "in Castle Rock",
        "in Chalmuns Spaceport Cantina",
        "at Cybertron",
        "in Duckburg",
        "in El Dorado",
        "in Elysium",
        "in Emerald City",
        "at Excalibur",
        "on flat earth",
        "in Gotham City",
        "in Heaven",
        "in Hell",
        "in Hill Valley",
        "in the first circle of Hell",
        "in the second circle of Hell",
        "in the third circle of Hell",
        "in the fourth circle of Hell",
        "in the fifth circle of Hell",
        "in the sixth circle of Hell",
        "in the seventh circle of Hell",
        "in the eighth circle of Hell",
        "in the ninth circle of Hell",
        "at Hogwarts",
        "in the upside down",
        "in Inception",
        "in Jotunheim",
        "in Liberty City",
        "in Los Santos",
        "in Mag Mell",
        "in Metropolis",
        "in Mega City",
        "in Mos Eisley",
        "in Mos Espa",
        "on Mount Olympus",
        "in Neverland",
        "in Niflheim",
        "in Niflhel",
        "in Paradise City",
        "in Purgatory",
        "in Quahog",
        "in Rivendell",
        "in San Andreas",
        "in San Fiero",
        "in Shangri-La",
        "in Shawshank prison",
        "in South Park",
        "in Springfield",
        "at Styx",
        "in Tech Duinn",
        "in Toontown",
        "in Twin Peaks",
        "in Valhalla",
        "in Vanaheim",
        "in Vice City",
        "in Willy Wonkas factory",
        "in Wonderland",

        // Environments / Biomes
        "in an arctic tundra",
        "on the beach",
        "in a black hole",
        "in a bog",
        "in a boreal forest",
        "in a burned forrest",
        "at a castle",
        "in a chaparral",
        "at the cliffs",
        "in a crater",
        "at a crimescene",
        "in a desert",
        "in a digital world",
        "in a dome",
        "on a dome",
        "in the dunes",
        "in an elfin woodland",
        "at a factory",
        "in the flatlands",
        "in a forest",
        "in a futuristic city",
        "at a German Oktoberfest",
        "in a geodesic dome",
        "in a gorge",
        "in a grassland",
        "at a graveyard",
        "in a gravelpit",
        "in a heath",
        "at a heavy metal concert",
        "at a heavy metal festival",
        "in a Mangrove swamp",
        "in a maze",
        "in a mirror maze",
        "at a Nordic Fjord",
        "in the mountains",
        "in a nuclear wasteland",
        "on a pier",
        "in a post apocalyptic world",
        "in a salt marsh",
        "in the salt flats",
        "in a savanna",
        "in a room a thousand years wide",
        "in a rubberroom",
        "in a taiga",
        "in a Temperate evergreen forest",
        "in a temparate forest",
        "in a temperate woodland and shrubland",
        "in a tube",
        "in a tundra",
        "in a tunnel",
        "in a tropical dry forest",
        "in a tropical rain forest",
        "in the Jungle",
        "in the Sahara",
        "in the sand dunes",
        "at a vantage point",
        "in the void",
        "in the wetlands",
        "in a xeric shrubland",
        "in Zion",

        // At notable places
        "at Alcatraz",
        "at Amboy",
        "at Angor Wat",
        "at Antelope Canyon",
        "at Area 51",
        "at Atchafalaya Swamp",
        "at Badwater basin",
        "at Baalbek",
        "at Bisti De-Na-Zin Wilderness Area",
        "at Starbase",
        "at Cape Canaveral",
        "at Cinque Terre national park",
        "at Death Valley",
        "at Badab-e Surt",
        "at Banff",
        "at Bell Rock Lighthouse",
        "at Black Rock Desert",
        "at Blood Falls Antarctica",
        "at Bonneville Salt Flats",
        "at Borobudur Temple",
        "at Brooklyn Bridge",
        "at Bryce Canyon",
        "at Buckingham Palace",
        "at Cadillac Ranch",
        "at Cairngorms national park",
        "at Caminito del Rey",
        "at Cappadocia",
        "at Casa Milà",
        "at Chartres Cathedral",
        "at Chichen Itza",
        "at Christ the Redeemer",
        "at the Church of Hallgrimur",
        "at Chysler building",
        "at Cologne Cathedral",
        "at Colosseum",
        "at Conoco Tower",
        "at Dallol",
        "at Danakil Depression in Ethiopia Danakil Desert",
        "at Dartmoor national park",
        "at Dead Vlei, Namibia",
        "at Denali National Park",
        "at Doges Palace",
        "at Door to Hell in Turkmenistan",
        "at Drachenburg Castle",
        "at Easter Island",
        "at Eltz Castle",
        "at Empire State Building",
        "at Fiordland national park",
        "at Fly Geyser",
        "at Giants Causeway",
        "at Glacier Bay National Park",
        "at Göreme national park",
        "at Grace Bay Beach",
        "at Graspop",
        "at Grand Teton National Park",
        "at Grand Prismatic Spring in Yellowstone National Park",
        "at Grossglockner",
        "at Guilin and Lijiang river national park",
        "at Guggenheim Museum",
        "at Heidelberg Castle",
        "at Hellfest",
        "at Himeji Castle",
        "at Hohenschwangau Castle",
        "at Hohenzollern Castle",
        "at Horseshoe Bend",
        "at Huacachina",
        "at Iguazu and Igacu national parks",
        "at Ipanema Beach",
        "at Jasper National Park",
        "at John Hancock Center",
        "at Joshua National Tree Park",
        "at Khao Phing Kan",
        "at Khao Sok national park",
        "at Kilauea Volcano, Hawaii",
        "at Komodo National Park",
        "at Kruger national park",
        "at Maldives",
        "at Machu Picchu",
        "at McMurdo station",
        "at Meramec Caverns",
        "at Meteor Crater",
        "at Miami Beach",
        "at Milan Cathedral",
        "at Milford Sound",
        "at Middle Earth",
        "at Monument Valley",
        "at Mono lake - California",
        "at Moritzburg Castle",
        "at Mount Desert Island",
        "at Mount Everest",
        "at Mount Fuji",
        "at Mount Pilatus",
        "at Mount Rainier National Park",
        "at Mount Rushmore",
        "at Mnemba Island",
        "at Neuschwanstein Castle",
        "at Nordkapp",
        "at Lake Bled",
        "at Lake Hillier",
        "at Lake Louise",
        "at Lake Natron",
        "at Lake Tahoe",
        "at Las Salinas de Torrevieja",
        "at Las Salinas Grandes",
        "at Le Mont Saint-Michel",
        "at Lencois Maranhenses Sand Dunes",
        "at Lichtenstein Castle",
        "at Loch Ness",
        "at Notre Dame",
        "at Oatman",
        "at Omaha beach",
        "at Palace of Versailles",
        "at Panama Canal",
        "at Petra",
        "at Petrified Forest",
        "at Plitvice Lakes National Park",
        "at Potala Palace",
        "at Preikestolen",
        "at Rainbow Mountains of Peru",
        "at Rangiroa",
        "at Rauðasandur",
        "at Red Rocks",
        "at Red Rocks Amphitheatre",
        "at Rhossili Bay",
        "at Ruby Beach",
        "at Sagarmatha national park",
        "at Salar de Uyuni",
        "at Salt Flats of Bolivia",
        "at Santorini Caldera",
        "at Santa Monica Pier",
        "at Seljalandsfoss waterfall",
        "at Scala dei Turchi",
        "at Schwerin Castle",
        "at Sigmaringen Castle",
        "at Simien mountains national park",
        "at Skellig Michael",
        "at Snowdonia national park",
        "at Socotra",
        "at Solomon R. Guggenheim museum",
        "at St. Basils Cathedral",
        "at St. Marks Basilica",
        "at Taj Mahal",
        "at Terra Nova National Park",
        "at Terraced Rice Fields of Vietnam",
        "at the Acropolis",
        "at The Alhambra",
        "at the Atomium",
        "at the airport",
        "at the beach",
        "at the Blue Mosque",
        "at the beach during sunset",
        "at the Bibliotheca Alexandrina",
        "at the Burj Al Arab",
        "at the Burj Khalifa",
        "at the CN Tower",
        "at the Crystal Caves of Naica",
        "at the Colossus of Rhodes",
        "at the Dead Sea",
        "at the Eiffel Tower",
        "at the Everglades",
        "at the Flatiron Building",
        "at the Forbidden City",
        "at the Gates",
        "at the Gates of Hell",
        "at the Gateway Arch",
        "at the Grand Canyon",
        "at the Great Barrier Reef",
        "at the Great Mosque of Djenné",
        "at the Great Pyramid of Giza",
        "at the Great Sphinx of Giza",
        "at the Great Wall of China",
        "at the Hagia Sophia",
        "at the Hanging Gardens of Babylon",
        "at the Harbor",
        "at the Hoover dam",
        "at the Isle of Skye",
        "at the killing fields",
        "at The Kremlin",
        "at The Louvre",
        "at the Luxor",
        "at the Golden Gate Bridge",
        "at the Leaning Tower of Pisa",
        "at the movies",
        "at the North Pole",
        "at the North Sea",
        "at the Old Man of Storr",
        "at the Pantheon",
        "at the Parthenon",
        "at the Petronas Towers",
        "at the Porcelain Tower of Nanjing",
        "at the Roman Forum",
        "at the Royal Albert Hall",
        "at the Scottish Highlands",
        "at the Seattle Central Library",
        "at the Selimiye Mosque",
        "at the South Pole",
        "at the Space Needle",
        "at the Statue of Liberty",
        "at the Teotihuacan",
        "at the Houses of Parliament",
        "at the United Nations Headquarters",
        "at the United States Capitol",
        "at the Washington Monument",
        "at the White House",
        "at the Willis Tower",
        "at Sagrada Familia",
        "at sea",
        "at Stonehenge",
        "at St. Peters Basilica",
        "at Sydney Opera House",
        "at Taipei 101",
        "at the Himalayas",
        "at the swamp",
        "at the White cliffs of Dover",
        "at Tikal",
        "at Tornado Alley",
        "at Torres del Paine national park",
        "at Tower Bridge",
        "at Tranquility Base",
        "at Trolltunga",
        "at Tsingy de Bemaraha",
        "at Taos Pueblo",
        "at Uluru",
        "at Vestrahorn",
        "at Victoria Falls",
        "at Wacken Open Air",
        "at Wadi Rum",
        "at Wallstreet",
        "at Waimea Canyon State Park",
        "at Westminster Abbey",
        "at White Sands",
        "at Yellowstone National Park",
        "at Yosimite National Park",
        "at Zabriskie point",
        "at Zhangjiajie National Forest Park",
        "at Zhangye Danxia Landform",
        "at Zion national park",

        // Standard places
        "in the air",
        "in a beehive",
        "in the clouds",
        "in a coalmine",
        "in a cellar",
        "in the desert",
        "in a madhouse",
        "in the mountains",
        "in a nebula",
        "in ruins",
        "in space",
        "in a steel mill",
        "in orbit",
        "near a waterfall",
        "in the wild west",
        "in the woods",
        "in a warzone",

        // Era's
        "during ancient times",
        "during biblical times",
        "during Jurassic times",
        "during the 11th century",
        "during the 12th century",
        "during the 13th century",
        "during the 14th century",
        "during the 15th century",
        "during the 16th century",
        "during the 17th century",
        "during the 18th century",
        "during the 19th century",
        "during the 20th century",
        "during the 21st century",
        "during the American revolution",
        "during the American Civil War",
        "during the cold war",
        "during the French revolution",
        "during the industrial revolution",
        "during the iron age",
        "during the bronze age",
        "during the middle ages",
        "during the Napoleonic era",
        "during the renaissance",
        "during the stone age",
        "during the Vietnam war",
        "during World War 1",
        "during World War 2",
        "in the 1920s",
        "in the 1930s",
        "in the 1940s",
        "in the 1950s",
        "in the 1960s",
        "in the 1970s",
        "in the 1980s",
        "in the 1990s",
        // "on D-Day",
        
        // Film / TV related places
        "in the Shire",
        "on a Borg Cube",
        "on Alderaan",
        "on Andoria",
        "on Arrakis",
        // "on Battlestar Galactica",
        "on Corellia",
        "on Coruscant",
        "on Crait",
        // "on Discovery 1",
        "on Dagobah",
        "on Earth",
        "on Elysium",
        "on Endor",
        "on Geonosis",
        "on Hoth",
        "on Jakku",
        "on Kamino",
        "on Kashyyyk",
        "on Kronos",
        "on Mandalore",
        "on Mustafar",
        "on Naboo",
        "on Remus",
        "on Romulus",
        "on Scarif",
        "on Tatooine",
        "on Trill",
        "on Yavin 4",
        "on Vulcan",
        //"on the Deathstar",
        //"on the Kessel run",
        //"on a Cheyenne Drop Ship",
        //"on a Cylon Raider",
        //"on a Prawn mothership",
        // "on the Event Horizon",
        // "on an Imperial Star Destroyer",
        // "on the Jupiter Mining Corporation spaceship Red Dwarf",
        // "on a Klingon Bird of Prey",
        // "on the Millennium Falcon",
        // "on a Nubian Royal Starship",
        // "on Pandora",
        // "on the Rocinante",
        // "on the Starbug",
        // "on the TARDIS",
        // "on the USCSS Nostromo",
        // "on the USS Enterprise",
        // "on the The Ranger from Interstellar",
        // "on the Razor Crest",
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return ', ' + randomValue;
}

function getSeasoning()
{
    if (useSeasoning != 1)
        return "";

    const array = [
        // Colors
        "black",
        "blue",
        "camouflage",
        "camo pattern",
        "green",
        "grey",
        "orange",
        "dark red",
        "redshifted",
        "vantablack",
        "white",
        "yellow",

        //patterns
        "arrays",
        "branching",
        "bubbles",
        "celtic knots",
        "chains",
        "chaos",
        "checkered",
        "circles",
        "cracks",
        "crystals",
        "diamond plate",
        "dotted",
        "double helix",
        "dunes",
        "Fibonacci",
        "flow",
        "foam",
        "fractals",
        "helix",
        "hexagon tiles",
        "geometric patterns",
        "jigsaw puzzle",
        "polka dots",
        "symmetry",
        "spirals",
        "spots",
        "stripes",
        "tessellations",
        "ripples",
        "tiles",
        "waves",
        "woven",
        "vortex",

        // Material (possibly fictional)
        "aerogel",
        "activated charcoal",
        "adamantium",
        "agate",
        "amber",
        "amethyst",
        "asphalt",
        "bitumen",
        "bloodstone",
        "bombastium",
        "bone",
        "brass",
        "bronze",
        "carbon",
        "ceramic",
        "cheese",
        "chocolate",
        "chrome",
        "chromium",
        "concealed",
        "concrete",
        "copper",
        "coral",
        "cork",
        "corn",
        "dark matter",
        "diamond",
        "dilitium",
        "ebony",
        "ember",
        "emerald",
        "fabric",
        "glass",
        "gold",
        "gravel",
        "hematite",
        "hemp",
        "hydrogel",
        "iron",
        "ivory",
        "jade",
        "kevlar",
        "kryptonite",
        "lava",
        "lead",
        "magma",
        "magnesium",
        "marble",
        "metal",
        "mercury",
        "milk",
        "Mycelium",
        "nanotubes",
        "neutron",
        "nitinol",
        "obsidian",
        "oil",
        "onyx",
        "oobleck",
        "ooze",
        "opal",
        "oxidized copper",
        "paper",
        "pearl",
        "plastic",
        "porcelain",
        "puss",
        "pyrite",
        "quartz",
        "rubber",
        "ruby",
        "rust",
        "sapphire",
        "silver",
        "stainless steel",
        "stanene",
        "steel",
        "stone",
        "sugar",
        "tarmac",
        "tears",
        "tin",
        "titanium",
        "topaz",
        "weed",
        "wooden",
        "zircon",

        /* This doesn't work as good as I hoped
        // The 118 elements (because why not?)
        "Hydrogen",
        "Helium",
        "Lithium",
        "Beryllium",
        "Boron",
        "Carbon",
        "Nitrogen",
        "Oxygen",
        "Fluorine",
        "Neon",
        "Sodium",
        "Magnesium",
        "Aluminum",
        "Silicon",
        "Phosphorus",
        "Sulfur",
        "Chlorine",
        "Argon",
        "Potassium",
        "Calcium",
        "Scandium",
        "Titanium",
        "Vanadium",
        "Chromium",
        "Manganese",
        "Iron",
        "Cobalt",
        "Nickel",
        "Copper",
        "Zinc",
        "Gallium",
        "Germanium",
        "Arsenic",
        "Selenium",
        "Bromine",
        "Krypton",
        "Rubidium",
        "Strontium",
        "Yttrium",
        "Zirconium",
        "Niobium",
        "Molybdenum",
        "Technetium",
        "Ruthenium",
        "Rhodium",
        "Palladium",
        "Silver",
        "Cadmium",
        "Indium",
        "Tin",
        "Antimony",
        "Tellurium",
        "Iodine",
        "Xenon",
        "Cesium",
        "Barium",
        "Lanthanum",
        "Cerium",
        "Praseodymium",
        "Neodymium",
        "Promethium",
        "Samarium",
        "Europium",
        "Gadolinium",
        "Terbium",
        "Dysprosium",
        "Holmium",
        "Erbium",
        "Thulium",
        "Ytterbium",
        "Lutetium",
        "Hafnium",
        "Tantalum",
        "Tungsten",
        "Rhenium",
        "Osmium",
        "Iridium",
        "Platinum",
        "Gold",
        "Mercury",
        "Thallium",
        "Lead",
        "Bismuth",
        "Polonium",
        "Astatine",
        "Radon",
        "Francium",
        "Radium",
        "Actinium",
        "Thorium",
        "Protactinium",
        "Uranium",
        "Neptunium",
        "Plutonium",
        "Americium",
        "Curium",
        "Berkelium",
        "Californium",
        "Einsteinium",
        "Fermium",
        "Mendelevium",
        "Nobelium",
        "Lawrencium",
        "Rutherfordium",
        "Dubnium",
        "Seaborgium",
        "Bohrium",
        "Hassium",
        "Meitnerium",
        "Darmstadtium",
        "Roentgenium",
        "Copernicium",
        "Nihonium",
        "Flerovium",
        "Moscovium",
        "Livermorium",
        "Tennessine",
        "Oganesson",
        */        

        // State or form
        "aether",
        "angular",
        "assimilated",
        "backlit",
        "barbed",
        "beaten",
        "bioluminescent",
        "blackened",
        "bloodsoaked",
        "bombastic",
        "burned",
        "burned in",
        "burning",
        "camouflaged",
        "carved",
        "charred",
        "chopped",
        "circular",
        "collapsed",
        "concave",
        "condensation",
        "conjoined",
        "consumed",
        "cozy",
        "crying",
        "cryogenic",
        "cubed",
        "engraved",
        "entombed",
        "damaged",
        "darkened",
        "decaying",
        "decomposing",
        "deep",
        "dehydrated",
        "destroyed",
        "diabolical",
        "dimpled",
        "dirty",
        "dissolving",
        "distorted",
        "dotted",
        "drained",
        "dripping",
        "dry",
        "dual",
        "dull",
        "dusty",
        "embalmed",
        "engraved",
        "erased",
        "evaporation",
        "exhumed",
        "exposed",
        "fat",
        "ferrofluid",
        "flaming",
        "flaring",
        "floating",
        "flowing",
        "foamy",
        "frosty",
        "frozen",
        "glowing",
        "golden ratio",
        "gradient",
        "haemorrhaging",
        "hammered",
        "hexagonal",
        "hidden",
        "hollow",
        "holographic",
        "hydrophobic",
        "industrial",
        "inversed",
        "knitted",
        "light absorbing",
        "light emitting",
        "liquid",
        "lush",
        "matt",
        "melting",
        "mesh",
        "messy",
        "metallic",
        "metamorphic",
        "moist",
        "molten",
        "moldy",
        "muddy",
        "octagonal",
        "oozy",
        "oozing",
        "overgrown",
        "parallel",
        "peeled",
        "pentagonal",
        "piled",
        "plasma",
        "powder",
        "precipitation",
        "psychedelic",
        "psychotic",
        "quadruple",
        "rain",
        "radiating",
        "radio active",
        "redhot",
        "riddled",
        "rigid",
        "reflecting",
        "reflective",
        "refractive",
        "round",
        "rotting",
        "scattered",
        "screaming",
        "seeping",
        "separated",
        "shabby",
        "shadowed",
        "shallow",
        "shattered",
        "shedding",
        "shiny",
        "silhouette",
        "sliced",
        "slim",
        "slimy",
        "smeared",
        "smoking",
        "sparking",
        "spherical",
        "split",
        "spoiled",
        "square",
        "stacked",
        "stamped",
        "steaming",
        "strained",
        "sublimation",
        "supercritical",
        "super natural",
        "tattered",
        "triangular",
        "triple",
        "vapour",
        "venting",
        "violated",
        "wasted",
        "wet",
        "whitehot",
        "worn",
        "wrapped",

        // Fun, nasty and/or random stuff to spice things up, let's see what happens
        "amputation",
        "Captain Trips",
        "crepuscular rays",
        "dark clouds",
        "dystopian",
        "lensflare",
        "Leprosy",
        "treatening clouds",
        "twilight",
        "whirlpool",

        // Just for Fun 
        "Aurora",
        "Autumn",
        "Abandoned",
        "Canine",
        "Chaos",
        "Charon",
        "Cosmic Rays",
        "Cropcircles",
        "Dawn",
        "Dry Ice",
        "Dusk",
        "Earthquake",
        "Eruption",
        "Eurynomos",
        "Facemelter",
        "Feline",
        "Feminine",
        "Hail",
        "Hypnos",
        "at a reflective lake",
        "near reflective puddles",
        "chased by zombies",
        "inside a computer",
        "on a desolated lifeless planet",
        "inside my head",
        "in the International Space Station",
        "on a lake of fire",
        "at lightspeed",
        "Masculine",
        "Melinoë",
        "on a misty morning with radiating sunbeams",
        "inside my mind",
        "on Mars",
        "on Mount Vesuvius",
        "Nyx",
        "Potholes",
        "Rain",
        "Raining blood",
        "in the sewer",
        "in the shadows",
        "Snow",
        "Spring",
        "statue",
        "statues",
        "Storm",
        "Summer",
        "on the surface of the moon",
        "Tartarus",
        "Thanatos",
        "Tsunami",
        "Twilight",
        "inside a tube",
        "on Venus",
        "on Pluto",
        "surrounded by fields of corn",
        "completely surrounded by no beer",
        "on an Uninhabited island",
        "on a skislope",
        "winter",
        "Zagreus",
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return ', ' + randomValue;
}

$(function() {
    setInterval(fetchData, 5000);
});

window.onload = function() {
    fetchData();
};