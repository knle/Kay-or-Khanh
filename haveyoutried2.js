let userinput = "";
let showResponse = false;
let font;
let x = 0;
let y = 0;
let cam;
let weatherText = "";
let dataLoaded = false;
let apiKey = "f34efa43d1680051d2ee1e55f2dfcdf2";
let voiceInput;
let activeVideo = null;
let openingprompt;
let openingDone = false;
let handPose;
let hands = [];
let scrollOffset = 0;
let slider1 = 0.5;
let slider2 = 0.5;
let slider3 = 0.5;

// Video responses mapped to keywords
let responses = {
  bored: { path: './goforawalkvideo.mov', video: null },
  tired: { path: './water.mov', video: null },
  lonely: { path: './heartsign.mov', video: null },
  know: { path: './dontknowwhattodo.mov', video: null },
  uninspired: { path: './inspo.mov', video: null },
  anxious: { path: './breathe.mov', video: null },
  like: {path: './likewhat.mov', video: null },
  finished: {path: './proud.mov', video: null },
  done: {path: './proud.mov', video: null },
  thank: {path: './yourewelcome.mov', video: null },
  good: {path: 'https://i.imgur.com/6K8Vtap.mp4', video: null },
  satisfied: {path: './awesome.mov', video: null },
  um: {path: './um.mov', video: null },
  stressed: {path: './stress.mov', video: null },
  overwhelmed: {path: './overwhelmed.mov', video: null },
  things: {path: './things.mov', video: null },
  stop: {path: './stop.mov', video: null },
  ok: {path: './ok.mov', video: null },
  girl: {path: './girl.mov', video: null },
  what: {path: './what.mov', video: null },
  hello: {path: './what.mov', video: null },
  hi: {path: './what.mov', video: null },
    //done: {path: './stress.mov', video: null },
     //done: {path: './stress.mov', video: null },
};

function preload() {
  font = loadFont('./ABCConnect-Flat-Trial.otf');
  //preload openng prompt
openingprompt= createVideo ('./howrufeelingtoday.mov');
openingprompt.hide();


  // Preload and hide response videos
  for (let key in responses) {
    responses[key].video = createVideo([responses[key].path]);
    responses[key].video.hide();
  }

}

async function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(15);
  textFont(font);
  textSize(24);
  fill(255);

  // Voice input
  voiceInput = new p5.SpeechRec();
  voiceInput.continuous = true;
  voiceInput.onResult = gotSpeech;
  voiceInput.start();

  // Camera
  cam = createCapture(VIDEO, () => {
    console.log('Camera is active, now play opening prompt.');
    if (openingprompt) {
      openingprompt.play();
      openingprompt.onended = function() {
        openingprompt.hide();
      }
    }
  });
  cam.size(windowWidth / 2, windowHeight);
  cam.hide();


  // Fetch weather
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        let temp = nf(data.main.temp, 2, 1);
        let desc = data.weather[0].description;
        weatherText = `It's ${temp}°C - ${desc} out`;
        dataLoaded = true;
      } catch (err) {
        console.error("Weather fetch failed:", err);
        weatherText = "Unable to load weather data.";
        dataLoaded = true;
      }
    }, (error) => {
      console.error("Geolocation error:", error.message);
      weatherText = "Location permission denied.";
      dataLoaded = true;
    });
  }

    // Create a slider and place it at the top of the canvas.
    /* slider = createSlider(0, 255);
    slider.position(90, 40);
    slider.size(100);

    slider = createSlider(0, 255);
    slider.position(90, 70);
    slider.size(100);

    slider = createSlider(0, 255);
    slider.position(90, 100);
    slider.size(100);
     */
    
}

function draw() {
  background(255);
  fill(255);
  x += 2;
  y += 1;

  // Show left-side camera feed
  image(cam,0,0, windowWidth / 2, windowHeight);

  // show opening prompt
  image(openingprompt, windowWidth / 2, 0, windowWidth /2, windowHeight);
 

  // Show right-side video response if active
  if (showResponse && activeVideo) {
    image(activeVideo, windowWidth / 2, 0, windowWidth /2, windowHeight);
  }
   //suggested keywords
   
textFont("Arial");
   textSize(15);
   noStroke();
   fill(255);
   for (let key in responses) {
    let k = random(0, windowWidth/2);
    let l = random(0, windowHeight - 100);
    text(key, k, l);
  }


  // Time display
  let h = hour();
  let m = minute();
  let s = second();
  textFont(font);
  textSize(50);
  textWrap(WORD);
  text(h + ":" + m + ":" + s, 650, 100, 1300);

  // User voice input text (middle)
  let rawLines = userinput.split("\n").filter(l => l.trim() !== "");
let wrappedLines = [];

strokeWeight (2);
  stroke(0);
textFont("Arial");
textSize(35);
textWrap(WORD);

for (let i = 0; i < rawLines.length; i++) {
  let words = rawLines[i].split(' ');
  let line = '';
  let tempLines = [];

  for (let j = 0; j < words.length; j++) {
    let testLine = line + words[j] + ' ';
    if (textWidth(testLine) > 400) {
      tempLines.push(line.trim());
      line = words[j] + ' ';
    } else {
      line = testLine;
    }
  }
  tempLines.push(line.trim());
  wrappedLines.push(...tempLines);
}

let lineHeight = 40;
let maxScroll = max(0, wrappedLines.length * lineHeight - (height - 200));
scrollOffset = constrain(scrollOffset, -maxScroll, 0);

let startY = 200 + scrollOffset;
for (let i = 0; i < wrappedLines.length; i++) {
  let yPos = startY + i * lineHeight;
  if (yPos > 0 && yPos < height) {
    text(wrappedLines[i], 600, yPos, 400);
  }
}


  // Weather text
  if (dataLoaded) {
    textFont("Arial");
    noStroke ();
    textSize(20);
    fill(0);
    text(weatherText, 650, 140);
  }

     /* //emotions for scale
     textFont("Arial");
     textSize (15);
     text("Bored", 20, 45);
     text("Uninspired", 200, 45);
     text("Anxious", 20, 75);
     text("Lonely", 200, 75);
     text("Tired", 20, 105);
     text("Frustrated", 200, 105);
 */
}

function gotSpeech() {
  if (voiceInput.resultValue) {
    let spoken = voiceInput.resultString;
    console.log("You said:", spoken);

    // ⬇️ Just append the new line
    userinput += "- " + spoken + "\n";

    showResponse = false;


    for (let key in responses) {
      if (spoken.includes(key)) {
        activeVideo = responses[key].video;
        activeVideo.stop(); // just in case it's mid-play
        activeVideo.hide(); // keep it hidden from HTML layer
        activeVideo.play(); // or use .play() if you don't want it to loop
        rect ()
        showResponse = true;
        break;
      }
    }

    // If no match, stop/hide any active video
    if (!showResponse && activeVideo) {
      activeVideo.stop();
      activeVideo.hide();
      activeVideo = null;
    }
  }

  
}
function mouseWheel(event) {
  scrollOffset -= event.delta; // negative = scroll up
}

