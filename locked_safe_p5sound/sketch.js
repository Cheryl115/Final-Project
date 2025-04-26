// global
// web serial
let pHtmlMsg; //pointer to the msg text
let serialOptions = { baudRate: 9600  }; // define the transimition rate
let serial;

// define the sound
let safeSound;
let unlockSound;

// Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=106350">freesound_community</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=106350">Pixabay</a>

function preload(){
  safeSound = loadSound("./safe_sound.mp3");
  unlockSound = loadSound("./unlocked_sound.mp3");
}

// setup
function setup() {
  // let canvas = createCanvas(800, 600);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);
  
  // If we have previously approved ports, attempt to connect with them
  //erial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  pHtmlMsg = createP("").parent('text-container');
}

function draw() { 
  //background(240);
}

/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
function onSerialErrorOccurred(eventSender, error) {
  //console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  //console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
  //console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
}

/**
 * Callback function serial.js when new web serial data is received
 * 
 * @param {*} eventSender 
 * @param {String} newData new data received over serial
 */
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);
  // Parse the incoming data
  let data = newData.trim();
  if (data.length > 0) {
    let parts = data.split(",Volume:");
    if (parts.length === 2) {
      let event = parts[0];
      let volume = parseFloat(parts[1]) / 100; // Normalize volume from percentage to 0-1 range

      playSoundBasedOnInput(event, volume);
    }
  }
}


/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}

function playSoundBasedOnInput(event, volume) {
  if (event.includes("Moving")) {
    safeSound.setVolume(volume);
    if (!safeSound.isPlaying()) {
      safeSound.play();
    }
  } else if (event.includes("Unlocking Safe")) {
    unlockSound.setVolume(volume); // Assuming full volume for dramatic effect
    unlockSound.play();
  }
}

// for debugging
function unlockSafe() {
  // Simulate an unlocking process
  document.getElementById('status').innerText = 'Safe is unlocked!';
  safeSound.play();
  unlockSound.play(3);
}

