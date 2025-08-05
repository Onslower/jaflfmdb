const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const username = urlParams.get('username')
const useai = urlParams.get('useai')
const useArtist = 1;
const useScene = 1;
const useStyle = 1;
const useAdjective = 1;
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
        imageDescription += getScene();
        imageDescription += getAdjective();
        imageDescription += getStyle();
        imageDescription += getWhere();

        var encodedImageDescription = encodeURIComponent(imageDescription);
        console.log(imageDescription);

        if (useai == true)
        {
            document.getElementById("artwork").innerHTML = imageDescription;
            document.getElementById("thebody").style.backgroundImage = "url(./images/simple_pixel_tile.png), url('./images/vignette_001.png'), url(https://pollinations.ai/p/" + encodedImageDescription + "?seed=" + getSeed() + "&nologo=true&model=flux&width=" + width + "&height=" + height + ")";
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

function getArtist(artist)
{
    if (useArtist != 1)
        return "";

    return ', ' + getFiltered(artist).trimEnd();
}


function getFiltered(filterMe)
{
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

function getStyle()
{
    const array = [
        "3D drawing technique",
        "3D tattoo style",
        "8 bit graphics style",
        "Abstract Expressionism style",
        "Academic drawing style",
        "Alien style",
        "Airbrush technique",
        "Anime art style",
        "Art Nouveau style",
        "Actionhero style",
        "Asterix & Obelix cartoon style",
        "Astrophotography style",
        "Bauhaus style",
        "Baroque Art style",
        "Biomechanical style",
        "Biomechanical tattoo style",
        "Black and White Photography technique",
        "Bob Ross painting style",
        "Caricature drawing style",
        "Celtic style",
        "Chalkboard school style",
        "Chalkboard art style",
        "Classicism art style",
        "Coffeestain art style",
        "Commodore 64 graphics style",
        "Conceptual Art style",
        "Drip Painting technique",
        "Expressionism Art style",
        "Antique style",
        "Black and white style",
        "Black and Grey tattoo style",
        "Beavis and Butthead cartoon style",
        "Cartoon style",
        "comic book style",
        "Crosshatching technique",
        "Dalle de verre technique",
        "Dark surreal art style",
        "Delft Blue style",
        "Disney cartoon style",
        "Don Martin cartoon style",
        "Dotwork tattoo style",
        "Doodle style",
        "Droste Effect style",
        "Dry brushing technique",
        "Embossing technique",
        "Etching technique",
        "Egyptian Hieroglyph style",
        "faded photograph style",
        "Family guy cartoon style",
        "Fingerpainting technique",
        "Fresco technique",
        "Futurama cartoon style",
        "Garfield cartoon style",
        "Geometric Drawing Style",
        "Geometric Tattoo Style",
        "glow in the dark style",
        "gothic art style",
        "Gradation technique",
        "graffiti art style",
        "Grattage technique",
        "Grisaille technique",
        "Guust Flater cartoon style",
        "Halftone art style",
        "Hatching technique",
        "HDR Photography technique",
        "Hyperrealism style",
        "Hyperrealism drawing style",
        "Hyperrealism tattoo style",
        "Ice sculpting style",
        "Illusionistic ceiling painting technique",
        "Infrared Photography technique",
        "Japanese Tattoo Style",
        "Joe Bar Team cartoon style",
        "Kinetic Art style",
        "Land Art style",
        "Lithography technique",
        "Looney Tunes cartoon style",
        "Long Exposure Photos technique",
        "long shutterspeed style",
        "line drawing style",
        "Macro Photography technique",
        "Matrix style",
        "Moroccan tiles style",
        "Monochrome monitor style",
        "Mosaic art technique",
        "Motion Blur Photography technique",
        "Movie poster style",
        "Muppet Show style",
        "Mural Painting technique",
        "Negative Space tattoo style",
        "Night Photography technique",
        "Neoclassicism style",
        "newspaper style",
        "outline style",
        "Old School Tattoo Style",
        "Paint by number technique",
        "Paling en Ko cartoon style",
        "Pencil shading technique",
        "Photorealism style",
        "Pop Art style",
        "Pointillism technique",
        "Powerpoint presentation style",
        "Prison tattoo style",
        "Relief art technique",
        "Raytrace style",
        "Renaissance style",
        "Roadrunner cartoon style",
        "Rick and Morty cartoon style",
        "Sand sculpting style",
        "Scarification style",
        "Scooby Doo cartoon style",
        "Screen printing technique",
        "Screentone texture technique",
        "Simpsons cartoon style",
        "Smoke Art Photography technique",
        "Southpark cartoon style",
        "Spongebob Squarepants cartoon style",
        "Stencil and Masking technique",
        "Sfumato technique",
        "Spray painting technique",
        "Suske en Wiske cartoon style",
        "Tesselation technique",
        "Terminator style",
        "The Far Side cartoon style",
        "Tilt-Shift Photography technique",
        "Tim Burton cartoon style",
        "Tintin cartoon style",
        "Tom and Jerry cartoon style",
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
        "X-ray photo style",
        "Derek Riggs style",
        "Dan Seagrave style",
        "Vincent Locke style",
        "Travis Smith style",
        "Eliran Kantor style",
        "Mariusz Lewandowski style",
        "Andy Warhol style",
        "Banksy style",
        "H.R. Giger style",
        "Hieronymus Bosch style",
        "Johannes Vermeer style",
        "Leonardo da Vinci style",
        "M.C. Escher style",
        "Michael Whelan style",
        "Michelangelo style",
        "Vincent Van Gogh style",
        "Pablo Picasso style",
        "Piet Mondriaan style",
        "Rembrandt van Rijn style",
        "Salvador Dali style",
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return ', ' + randomValue;
}

function getScene()
{
    if (useScene != 1)
        return "";

    const array = [
        "as a 30mm film negative",
        "as an advertisement",
        "an audio cassette cover",
        "as LP album art",
        "a birdseye view",
        "a bottom up view",
        "a collection of cropcircles",
        "as a computer errormessage",
        "on a backdrop",
        "on a banner",
        "on a billboard",
        "as a blueprint",
        "as a blue screen of death",
        "on a book cover",
        "as a breaking news item",
        "on a canvas",
        "as a collection of polaroid photos showing",
        "on a CD Jewel Case",
        "as a damaged photo",
        "on a damaged wall",
        "a dreamscape",
        "on a drive-in movie screen",
        "on an easel",
        "a fisheye lens view",
        "a foggy backlit scene",
        "as a glossy magazine photograph",
        "as a Haynes manual",
        "an infrared camera view",
        "as a large painting in a museum",
        "on a large lcd display",
        "as a Late night TV Show item",
        "a lego version",
        "a long focal length photo",
        "on a movie theater screen",
        "on a glossy magazine cover",
        "on a led display",
        "a minecraft version",
        "a miniature display",
        "as a missing person leaflet",
        "as a mobile message",
        "a moonlit scene",
        "a mural",
        "as a newspaper photograph",
        "on an old damaged placard",
        "as an old faded photo",
        "on an old school monochrome lcd display",
        "as an open-air exposition",
        "on a partially burned polaroid photo",
        "as a patent print",
        "on a placard",
        "on a polaroid",
        "as a popup advertisement",
        "on a projection screen",
        "as a propaganda poster",
        "a short focal length photo",
        "a sketch",
        "a sloppy spraypainted banner",
        "a tiled wall",
        "a topdown view",
        "as a train with graffiti",
        "as a wanted poster",
        "as a warning sign",
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return ', ' + randomValue;
}

function getAdjective()
{
    if (useAdjective != 1)
        return "";

    const array = [
        // Colors
        "black",
        "blue",
        "green",
        "grey",
        "orange",
        "redshifted",
        "vantablack",
        "white",
        "yellow",
        // Material
        "aluminium",
        "bronze",
        "carbon",
        "ceramic",
        "chrome",
        "concrete",
        "copper",
        "dehydrated",
        "diamond",
        "ebony",
        "glass",
        "gold",
        "ivory",
        "kevlar",
        "knitted",
        "lead",
        "magnesium",
        "marble",
        "mercury",
        "metal",
        "paper",
        "pearl",
        "plastic",
        "plutonium",
        "rubber",
        "silver",
        "stainless steel",
        "sulfur",
        "titanium",
        "wooden",
        // State
        "backlit",
        "bioluminescent",
        "bloodsoaked",
        "burning",
        "checkered",
        "circular",
        "entombed",
        "dirty",
        "dotted",
        "dusty",
        "fat",
        "flaming",
        "flowing",
        "frozen",
        "glowing",
        "light emitting",
        "liquid",
        "melting",
        "mesh",
        "moist",
        "molten",
        "muddy",
        "plasma",
        "radiating",
        "redhot",
        "riddled",
        "rigid",
        "reflecting",
        "reflective",
        "round",
        "shiny",
        "slim",
        "sparking",
        "smoking",
        "wet",
        "whitehot",
        "worn",
    ];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    return ', ' + randomValue;
}


function getWhere()
{
    if (useWhere != 1)
        return "";

    const array = [
        "in Alaska",
        "in Amsterdam",
        "in ancient Egypt",
        "in ancient Greece",
        "in ancient Rome",
        "in Asgard",
        "in Asteroid City",
        "in Austria",
        "in Australia",
        "in Barcelona",
        "in Beirut",
        "in Berlin",
        "in Bangkok",
        "in Casablanca",
        "in Chicago",
        "in Dubai",
        "in Edinburgh",
        "in England during the middleages",
        "in Emerald City",
        "in Germany",
        "in Gibraltar",
        "in Gotham City",
        "in Greenland",
        "in Havana",
        "in Heaven",
        "in Hell",
        "in the first circle of Hell",
        "in the second circle of Hell",
        "in the third circle of Hell",
        "in the fourth circle of Hell",
        "in the fifth circle of Hell",
        "in the sixth circle of Hell",
        "in the seventh circle of Hell",
        "in the eighth circle of Hell",
        "in the ninth circle of Hell",
        "in the upside down",
        "in Iceland",
        "in IJmuiden",
        "in Inception",
        "in India",
        "in Iraq",
        "in Iran",
        "in Japan",
        "in Kuala Lumpur",
        "in La Paz",
        "in Las Vegas",
        "In London",
        "in Los Angeles",
        "In Los Santos",
        "in Madagascar",
        "in Mega City",
        "in Mexico",
        "in Monaco",
        "in Mos Eisley",
        "in Mos Espa",
        "in Miami",
        "in Neverland",
        "in New Dehli",
        "in New York",
        "in New Zealand",
        "in North Korea",
        "in Pakistan",
        "in Paris",
        "in Pisa",
        "in Pompeii",
        "in Purgatory",
        "in Rivendell",
        "in Ronda",
        "in San Francisco",
        "in Scotland",
        "in Seattle",
        "in Shawshank prison",
        "in Siberia",
        "in South Africa",
        "in South Korea",
        "in South Park",
        "in Sydney",
        "in Thailand",
        "in Tuscany",
        "in Twin Peaks",
        "in Venice",
        "in Yakutsk",
        "in a burned forrest",
        "in a digital world",
        "in a dome",
        "in a geodesic dome",
        "in a forrest",
        "in a futuristic city",
        "in a post apocalyptic world",
        "in a room a thousand miles wide",
        "in a rubberroom",
        "in a tube",
        "in a tunnel",
        "in the Jungle",
        "in the Sahara",
        "in the void",
        "in Zion",
        "at Alcatraz",
        "at Antelope Canyon",
        "at Area 51",
        "at Atchafalaya Swamp",
        "at Bisti De-Na-Zin Wilderness Area",
        "at Starbase",
        "at Cape Canaveral",
        "at Cinque Terre national park",
        "at Death Valley",
        "at a castle",
        "at a crimescene",
        "at a factory",
        "at a heavy metal concert",
        "at a heavy metal festival",
        "at a German Oktoberfest",
        "at a graveyard",
        "at a Nordic Fjord",
        "at Badab-e Surt",
        "at Banff",
        "at Bell Rock Lighthouse",
        "at Blood Falls Antarctica",
        "at Brooklyn Bridge",
        "at Bryce Canyon",
        "at Cairngorms national park",
        "at Cappadocia",
        "at Chichen Itza",
        "at Christ the Redeemer",
        "at Colosseum",
        "at Dallol",
        "at Danakil Depression in Ethiopia Danakil Desert",
        "at Dartmoor national park",
        "at Dead Vlei, Namibia",
        "at Denali National Park",
        "at Door to Hell in Turkmenistan",
        "at Easter Island",
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
        "at Hellfest",
        "at Hogwarts",
        "at Horseshoe Bend",
        "at Huacachina",
        "at Iguazu and Igacu national parks",
        "at Ipanema Beach",
        "at Jasper National Park",
        "at Joshua National Tree Park",
        "at Key West",
        "at Khao Phing Kan",
        "at Khao Sok national park",
        "at Kilauea Volcano, Hawaii",
        "at Komodo National Park",
        "at Kruger national park",
        "at Maldives",
        "at Machu Picchu",
        "at McMurdo station",
        "at Meteor Crater",
        "at Miami Beach",
        "at Milford Sound",
        "at Middle Earth",
        "at Monument Valley",
        "at Mono lake, California",
        "at Mount Desert Island",
        "at Mount Everest",
        "at Mount Fuji",
        "at Mount Pilatus",
        "at Mount Rainier National Park",
        "at Mount Rushmore",
        "at Mnemba Island",
        "at Nordkapp",
        "at Lake Bled",
        "at Lake Hillier",
        "at Lake Louise",
        "at Lake Natron",
        "at Lake Tahoe",
        "at Las Salinas de Torrevieja",
        "at Las Salinas Grandes",
        "at Lencois Maranhenses Sand Dunes",
        "at lightspeed",
        "at Loch Ness",
        "at Panama Canal",
        "at Petra, Jordan",
        "at Plitvice Lakes National Park",
        "at Pulpit Rock",
        "at Rainbow Mountains of Peru",
        "at Rangiroa",
        "at Rauðasandur",
        "at Rhossili Bay",
        "at Ruby Beach",
        "at Sagarmatha national park",
        "at Salar de Uyuni",
        "at Salt Flats of Bolivia",
        "at Santorini Caldera",
        "at Santa Monica Pier",
        "at Seljalandsfoss waterfall",
        "at Scala dei Turchi",
        "at Simien mountains national park",
        "at Skellig Michael",
        "at Snowdonia national park",
        "at Socotra",
        "at St. Louis Arc",
        "at Taj Mahal",
        "at Terra Nova National Park",
        "at Terraced Rice Fields of Vietnam",
        "at the Antarctic",
        "at the Atomium",
        "at the airport",
        "at the beach",
        "at the beach during sunset",
        "at the Crystal Caves of Naica",
        "at the Colossus of Rhodes",
        "at the Dead Sea",
        "at the Everglades",
        "at the Gates",
        "at the Gates of Hell",
        "at the Grand Canyon",
        "at the Great Barrier Reef",
        "at the Great Pyramid of Giza",
        "at the Great Wall of China",
        "at the Hagia Sophia",
        "at the Hanging Gardens of Babylon",
        "at the Harbor",
        "at the Hoover dam",
        "at the highway",
        "at the killing fields",
        "at the Luxor",
        "at the White House",
        "at the Golden Gate Bridge",
        "at the IJselmeer",
        "at the Leaning Tower of Pisa",
        "at the movies",
        "at the North Pole",
        "at the North Sea",
        "at the ocean floor",
        "at the Porcelain Tower of Nanjing",
        "at the Scottish Highlands",
        "at the South Pole",
        "at the Hoge Veluwe",
        "at Schiphol",
        "at sea",
        "at Stonehenge",
        "at the Himalayas",
        "at the swamp",
        "at the White cliffs of Dover",
        "at Tornado Alley",
        "at Torres del Paine national park",
        "at Tranquility Base",
        "at Trolltunga",
        "at Tsingy de Bemaraha",
        "at Uluru",
        "at Vestrahorn",
        "at Victoria Falls",
        "at Wacken Open Air",
        "at Wadi Rum",
        "at Wallstreet",
        "at Waimea Canyon State Park",
        "at White Sands",
        "at Yellowstone National Park",
        "at Yosimite National Park",
        "at Zhangjiajie National Forest Park",
        "at Zhangye Danxia Landform",
        "at Zion national park",
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
        "in the air",
        "in the clouds",
        "in the desert",
        "in the mountains",
        "in the International Space Station",
        "in the sewer",
        "in the shadows",
        "in the wild west",
        "in the woods",
        "in space",
        "in a warzone",
        "in a coalmine",
        "in a beehive",
        "in a cellar",
        "in a madhouse",
        "in a nebula",
        "in a steel mill",
        "in orbit",
        "inside a computer",
        "inside a tube",
        "inside my head",
        "inside my mind",
        "near a nuclear explosion",
        "near a waterfall",
        "on a lake of fire",
        "on a desolated lifeless planet",
        "on Battlestar Galactica",
        "in a Borg Cube",
        "on Discovery One",
        "on a Cheyenne Drop Ship",
        "on a Cylon Raider",
        "on a dragonship",
        "on an Imperial Star Destroyer",
        "on an Uninhabited island",
        "on a Klingon Bird of Prey",
        "on a Nubian Royal Starship",
        "on a Prawn mothership",
        "on a sinking ship",
        "on a skislope",
        "on a warship",
        "on Hoth",
        "on Mars",
        "on Mount Vesuvius",
        "on Pluto",
        "on Tatooine",
        "on the Deathstar",
        "on Elysium",
        "on the Jupiter Mining Corporation spaceship Red Dwarf",
        "on the Event Horizon",
        "on the Millennium Falcon",
        "on the Rocinante",
        "on the Starbug",
        "on the surface of the moon",
        "on the TARDIS",
        "on the USCSS Nostromo",
        "on the USS Enterprise",
        "on the The Ranger from Interstellar",
        "on the Razor Crest",
        "on Venus",
        "surrounded by fields of corn",
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