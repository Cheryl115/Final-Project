// global
// web serial
let pHtmlMsg; //pointer to the msg text
let serialOptions = { baudRate: 9600  }; // define the transimition rate
let serial;

// RFID
let currentUID = "";        // UID from RFID reader
let nocharacterImg;           // if there is no character, this image will be shown
let dialogueText = "";      // Dialogue to show
let messageBoxImg;          // Your message box background
let AlexImg, EvelynImg, MarkImg; // Character Img
let EndingImg; // Image for ending scene

// Dialogue system
let currentDialogueIndex = 0;  // Track which dialogue is currently being shown
let currentDialogueArray = []; // Store array of dialogues for current interaction
let evelynPhotoScanned = 0;   // Track number of times Evelyn's photo was scanned
let alexPhotoScanned = 0;     // Track number of times Alex's photo was scanned
let markPhotoScanned = 0;     // Track number of times Mark's photo was scanned

// images
let bg;
let instructionIcon;

let currentPage = "home"; // Possible values: "home", "dialogue", "enterName", "finalDisplay"

// Buttons
let guessButton; // Button for guessing the murderer

// store dialogue data
let dialogues;

// Add close button to global variables
let closeButton;
let currentCharacterImg;
let currentDialogue = "..."; // Default dialogue text

// Debug mode
let isDebugMode = false;
let debugInfo = { isVisible: false };

// Add these global variables at the top with other global variables
let photoScanHistory = {
  "617f1f19": { 0: -1, 1: -1, 2: -1 }, // Evelyn's photo
  "b17df1f19": { 0: -1, 1: -1, 2: -1 }, // Alex's photo
  "71991b19": { 0: -1, 1: -1, 2: -1 }  // Mark's photo
};

// Add state tracking variables
let isShowingResult = false;
let guessResult = false;
let suspectInput;
let accuseButton;

// Add these global variables at the top with other global variables
let continueButton, tryAgainButton;

function preload(){
  nocharacterImg = loadImage("./images/No_character.png");
  AlexImg = loadImage("./images/Alex.png");
  EvelynImg = loadImage("./images/Evelyn.png");
  MarkImg = loadImage("./images/Mark.png");
  bg = loadImage("./images/background.png");
  instructionIcon = loadImage("./images/instructionIcon.png");
  EndingImg = loadImage("./images/Detective.png");

  // load dialogue data
  loadJSON('./dialogues.json', (data) => {
    dialogues = data;
    console.log("Dialogues loaded!", dialogues);
  });
}

// setup
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize buttons with consistent sizing
  guessButton = new Button(
    width/2 - 100, 
    height/2 + 150, 
    200, // Width to accommodate text + padding
    40,  // Height to accommodate text + padding
    "Guess the Murderer", 
    () => { currentPage = "enterName"; }
  );

  // Initialize close button
  closeButton = new CloseButton(width - 50, 30, 40);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);
  
  // If we have previously approved ports, attempt to connect with them
  // serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  pHtmlMsg = createP("").parent('text-container');

  // Create and style the input field
  suspectInput = createInput('')
    .attribute('placeholder', 'Enter suspect name')
    .style('font-family', 'American Typewriter')
    .style('font-size', '20px')
    .style('padding', '10px')
    .style('width', '300px')
    .style('border-radius', '5px')
    .style('border', '1px solid #ccc')
    .style('margin', '20px auto')
    .position(width/2 - 150, height/2);

  // Hide the input initially
  suspectInput.hide();

  // Create accuse button
  accuseButton = new Button(
    width/2 - 100, // x position
    height/2 + 60, // y position
    200, // width to match other buttons
    40,  // height to match other buttons
    'Accuse',
    () => {
      checkAccusation();
    }
  );
  
  // Add show/hide functionality to accuseButton
  accuseButton._hidden = true; // Initialize as hidden
  accuseButton.hide = function() {
    this._hidden = true;
  };
  
  accuseButton.show = function() {
    this._hidden = false;
  };
  
  accuseButton.display = function() {
    if (!this._hidden) {
      Button.prototype.display.call(this);
    }
  };
  
  // Initialize result buttons with consistent sizing
  continueButton = new ResultButton(
    width/2 - 100,
    height/2 + 50,
    200, // Width to accommodate text + padding
    40,  // Height to accommodate text + padding
    "Continue",
    () => {
      currentPage = "finalDisplay";
      isShowingResult = false;
      suspectInput.value('');
      suspectInput.hide();
      accuseButton.hide();
    }
  );

  tryAgainButton = new ResultButton(
    width/2 - 100,
    height/2 + 50,
    200, // Width to accommodate text + padding
    40,  // Height to accommodate text + padding
    "Look for More Evidence",
    () => {
      currentPage = "home";
      isShowingResult = false;
      suspectInput.value('');
      suspectInput.hide();
      accuseButton.hide();
    }
  );
}

function draw() { 
  // Draw background image
  if (bg) {
    image(bg, 0, 0, width, height);
  } else {
    background(240);
  }
  switch (currentPage) {
    case "home":
      mainPage();
      break;
    case "dialogue":
      dialoguePage();
      break;
    case "enterName":
      guessPage();
      break;
    case "finalDisplay":
      endingPage();
      break;
  }

  // Draw debug info if enabled
  if (debugInfo.isVisible) {
    // Draw debug panel
    fill(0, 0, 0, 200);
    noStroke();
    rect(10, 10, 300, 320);
    
    // Draw debug text
    fill(255);
    textAlign(LEFT, TOP);
    textSize(20);
    let y = 20;
    
    // Debug status
    text("DEBUG MODE " + (isDebugMode ? "ON" : "OFF"), 20, y);
    y += 25;
    
    // Current state
    text("Current Page: " + currentPage, 20, y);
    y += 25;
    text("Photo Scanned Count:", 20, y);
    y += 20;
    text("Evelyn: " + evelynPhotoScanned, 30, y);
    y += 20;
    text("Alex: " + alexPhotoScanned, 30, y);
    y += 20;
    text("Mark: " + markPhotoScanned, 30, y);
    y += 25;

    // Debug controls
    text("Debug Controls:", 20, y);
    y += 20;
    text("D: Toggle Debug Mode", 30, y);
    y += 20;
    text("I: Toggle Debug Info", 30, y);
    y += 20;
    text("→: Next Dialogue", 30, y);
    y += 25;
    
    // RFID Debug Keys
    text("Evelyn (Reader 0):", 20, y);
    y += 20;
    text("1: Photo  2: Diary  3: Letter", 30, y);
    y += 20;
    text("Alex (Reader 1):", 20, y);
    y += 20;
    text("4: Photo  5: Diary  6: Letter", 30, y);
    y += 20;
    text("Mark (Reader 2):", 20, y);
    y += 20;
    text("7: Photo  8: Diary  9: Letter", 30, y);
  }
}

/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
function onSerialErrorOccurred(eventSender, error) {
  //console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html("");
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  //console.log("onSerialConnectionOpened");
  pHtmlMsg.html("");
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
  //console.log("onSerialConnectionClosed");
  pHtmlMsg.html("");
}

/**
 * Callback function serial.js when new web serial data is received
 * 
 * @param {*} eventSender 
 * @param {String} newData new data received over serial
 */
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("");

  // Check if newData is not empty and is a string
  if (newData && typeof newData === 'string' && newData.trim().length > 0) {
    currentPage = "dialogue";
    let inString = newData.trim(); // Remove any extra whitespace
    try {
      let data = JSON.parse(inString);  // Try to parse the incoming string as JSON
      console.log('Reader ID:', data.readerId); // Log the Reader ID
      console.log('UID:', data.uid); // Log the UID

      // Set character image based on reader ID
      switch(data.readerId) {
        case 0:
          currentCharacterImg = EvelynImg;
          break;
        case 1:
          currentCharacterImg = AlexImg;
          break;
        case 2:
          currentCharacterImg = MarkImg;
          break;
        default:
          currentCharacterImg = nocharacterImg;
      }

      // Handle photo UIDs
      if (['617f1f19', 'b17df1f19', '71991b19'].includes(data.uid)) {
        let dialogueList = [];
        let isNewScan = false;

        // Check if this is a new scan for this character
        if (photoScanHistory[data.uid][data.readerId] === -1) {
          isNewScan = true;
          // Record when this photo was first scanned by this character
          switch(data.readerId) {
            case 0:
              photoScanHistory[data.uid][data.readerId] = evelynPhotoScanned;
              evelynPhotoScanned++;
              break;
            case 1:
              photoScanHistory[data.uid][data.readerId] = alexPhotoScanned;
              alexPhotoScanned++;
              break;
            case 2:
              photoScanHistory[data.uid][data.readerId] = markPhotoScanned;
              markPhotoScanned++;
              break;
          }
        }

        // Get the scan time for this photo and character
        let scanTime = photoScanHistory[data.uid][data.readerId];
        
        // Add PhotoScannedTime dialogue if it exists
        if (dialogues.PhotoScannedTime && 
            dialogues.PhotoScannedTime[scanTime] && 
            dialogues.PhotoScannedTime[scanTime][data.readerId]) {
          dialogueList.push(dialogues.PhotoScannedTime[scanTime][data.readerId]);
        }

        // Add the mapped dialogue if it exists
        if (dialogues[data.uid] && dialogues[data.uid][data.readerId]) {
          dialogueList.push(dialogues[data.uid][data.readerId]);
        }

        // Set the dialogue array
        currentDialogueArray = dialogueList.length > 0 ? dialogueList : ["..."];
      } else {
        // Handle non-photo UIDs
        if (dialogues[data.uid] && dialogues[data.uid][data.readerId]) {
          let dialogueData = dialogues[data.uid][data.readerId];
          if (Array.isArray(dialogueData)) {
            currentDialogueArray = dialogueData;
          } else if (typeof dialogueData === 'object') {
            // If it's an object with numbered keys (0, 1, 2), convert to array
            currentDialogueArray = Object.values(dialogueData);
          } else {
            currentDialogueArray = [dialogueData];
          }
        } else {
          currentDialogueArray = ["..."];
        }
      }

      // Set current dialogue
      if (currentDialogueArray && currentDialogueArray.length > 0) {
        currentDialogueIndex = 0;
        currentDialogue = currentDialogueArray[currentDialogueIndex];
        console.log('Set dialogue for reader', data.readerId, ':', currentDialogue);
      } else {
        console.log('No dialogue found for UID:', data.uid, 'and reader:', data.readerId);
        currentDialogueArray = ["..."];
        currentDialogueIndex = 0;
        currentDialogue = "...";
      }

    } catch(err) {
      console.error('Error parsing JSON:', inString, err);
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

// send a message to Arduino to pause the reading function if a dialog is triggered.
function pauseReaders() {
  serial.write('PAUSE\n'); // Ensure '\n' to match Arduino's readStringUntil
}
// send a message to Arduino to resume the reading function if there's no dialog playing on the screen.
function resumeReaders() {
  serial.write('RESUME\n');
}

function mainPage() {
  // Instruction area
  let topBoxY = height/2 - 200;
  let boxHeight = 200; // Height for icon and text
  
  // Black box for instructions
  fill(0, 0, 0, 200);
  rect(width/2 - 420, topBoxY, 840, boxHeight, 20);

  // Icon for instruction (white)
  if (instructionIcon) {
    let iconSize = 60;
    tint(255);
    // Adjust icon position to be inside the box
    image(instructionIcon, width/2 - 30, topBoxY + 30, iconSize, iconSize);
    noTint(); // Reset tint
  }

  // Text for instruction
  fill(255);
  textFont('American Typewriter');
  textSize(20);
  textAlign(CENTER, CENTER);
  // Adjust text position to be below the icon
  text("Initiate interviews by placing relevant items before each suspect.", width/2, topBoxY + 130);

  // "Or" divider with lines
  stroke(255);
  strokeWeight(0.5);
  let lineWidth = 400;
  let lineY = height/2 + 80; // More space after the black box
  line(width/2 - lineWidth/2, lineY, width/2 - 50, lineY); // Left line
  line(width/2 + 50, lineY, width/2 + lineWidth/2, lineY); // Right line
  
  noStroke();
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("Or", width/2, lineY);

  // Display the guess button
  guessButton.display();
}

function dialoguePage() {
  // Draw character standee
  if (currentCharacterImg) {
    let imgHeight = height * 0.5; // 50% of screen height
    let imgWidth = (currentCharacterImg.width * imgHeight) / currentCharacterImg.height;
    image(currentCharacterImg, width/2 - imgWidth/2, height * 0.1, imgWidth, imgHeight);
  }

  // Draw message box
  fill(252,247,241);
  stroke(139, 69, 19); // Brown border
  strokeWeight(4);
  rect(width * 0.1, height * 0.6, width * 0.8, height * 0.3, 20);

  // Draw dialogue text
  noStroke();
  fill(0);
  textSize(20);
  textFont('American Typewriter');
  textAlign(LEFT, TOP);
  text(currentDialogue, width * 0.15, height * 0.65, width * 0.7, height * 0.2);

  // Draw navigation arrows if there are more dialogues
  if (currentDialogueArray && currentDialogueArray.length > 1) {
    // Right arrow (next dialogue)
    if (currentDialogueIndex < currentDialogueArray.length - 1) {
      fill(0);
      noStroke();
      let arrowX = width * 0.85;
      let arrowY = height * 0.9 - 40; // 40px from bottom edge
      let arrowSize = 20;
      
      // Draw arrow
      push();
      translate(arrowX, arrowY);
      rotate(PI/2);
      triangle(0, 0, -arrowSize/2, arrowSize, arrowSize/2, arrowSize);
      pop();
    }
    
    // Left arrow (previous dialogue)
    if (currentDialogueIndex > 0) {
      fill(0);
      noStroke();
      let arrowX = width * 0.15;
      let arrowY = height * 0.9 - 40; // 40px from bottom edge
      let arrowSize = 20;
      
      // Draw arrow
      push();
      translate(arrowX, arrowY);
      rotate(-PI/2);
      triangle(0, 0, -arrowSize/2, arrowSize, arrowSize/2, arrowSize);
      pop();
    }
  }

  // Display close button with right edge aligned to message box and top edge aligned with character image
  closeButton.x = width * 0.9 - closeButton.size;
  closeButton.y = height * 0.1;
  closeButton.display();
}

function guessPage() {
  // Define central box dimensions and position
  let boxWidth = 840;
  let boxHeight = 420;
  let boxX = width/2 - boxWidth/2;
  let boxY = height/2 - boxHeight/2;

  // Draw the central content box
  fill(0, 0, 0, 200);
  rect(boxX, boxY, boxWidth, boxHeight, 20);

  // Draw content based on state
  fill(255);
  textFont('American Typewriter');
  textAlign(CENTER, CENTER);

  if (isShowingResult) {
    // Show result state
    textSize(24);
    if (guessResult) {
      text("You Got the Murderer!", width/2, boxY + 80);
      continueButton.x = width/2 - 100;
      continueButton.y = boxY + 200;
      continueButton.display();
    } else {
      text("This is Not Right", width/2, boxY + 80);
      tryAgainButton.x = width/2 - 100;
      tryAgainButton.y = boxY + 200;
      tryAgainButton.display();
    }
  } else {
    // Show input state
    textSize(24);
    text("Enter the Murderer's Name", width/2, boxY + 80);

    // Draw description
    textSize(20);
    let descriptionY = boxY + 120;
    text("Please type in the name of the suspect you believe is the murderer below. Choose", width/2, descriptionY);
    text("carefully—every detail you've discovered has led to this moment. Once you're ready,", width/2, descriptionY + 30);
    text("press 'Accuse' to submit your final verdict and see if you've cracked the case.", width/2, descriptionY + 60);

    // Show input and button
    let inputY = descriptionY + 120;
    let buttonY = inputY + 80;
    suspectInput.position(width/2 - 150, inputY);
    suspectInput.show();
    
    // Update accuse button position and show it
    accuseButton.x = width/2 - 100;
    accuseButton.y = buttonY;
    accuseButton.show();
    accuseButton.display();
  }

  // Position close button at the exact top-right corner of the box
  closeButton.x = boxX + boxWidth - 40;
  closeButton.y = boxY + 40;
  closeButton.display();
}

function checkAccusation() {
  let guess = suspectInput.value().trim().toLowerCase();
  guessResult = guess === "alex";
  isShowingResult = true;
  
  // Hide input and accuse button
  suspectInput.hide();
  accuseButton.hide();
}

function mousePressed() {
  if (currentPage === "home") {
    guessButton.handleClick();
  } else if (currentPage === "dialogue") {
    closeButton.handleClick();
  } else if (currentPage === "enterName") {
    if (isShowingResult) {
      if (guessResult) {
        continueButton.handleClick();
      } else {
        tryAgainButton.handleClick();
      }
    } else {
      // Handle close button and accuse button clicks
      closeButton.handleClick();
      if (!accuseButton._hidden) {
        accuseButton.handleClick();
      }
    }
  }
}

function endingPage(){
  // Draw character standee
  currentCharacterImg = EndingImg;
  if (currentCharacterImg) {
    let imgHeight = height * 0.5; // 50% of screen height
    let imgWidth = (currentCharacterImg.width * imgHeight) / currentCharacterImg.height;
    image(currentCharacterImg, width/2 - imgWidth/2, height * 0.1, imgWidth, imgHeight);
  }

  // Draw message box
  fill(252,247,241);
  stroke(139, 69, 19); // Brown border
  strokeWeight(4);
  rect(width * 0.1, height * 0.6, width * 0.8, height * 0.3, 20);

  // Draw dialogue text
  currentDialogue = "“The real killer is Alex, the son. Desperate to escape his crumbling family, he meticulously plotted his father's murder, framing his mother to inherit the wealth. However, despite his carefully planned scheme, his subtle emotional slip-ups and contradictions ultimately exposed his guilt, revealing the heartbreaking truth behind this tragic family case.”"
  noStroke();
  fill(0);
  textSize(20);
  textFont('American Typewriter');
  textAlign(LEFT, TOP);
  text(currentDialogue, width * 0.15, height * 0.65, width * 0.7, height * 0.2);
}

function keyPressed() {
  // Debug mode toggle (press 'D')
  if (key === 'd' || key === 'D') {
    isDebugMode = !isDebugMode;
    debugInfo.isVisible = isDebugMode;
    console.log("Debug mode:", isDebugMode ? "ON" : "OFF");
  }

  // Debug commands (only work when debug mode is ON)
  if (isDebugMode) {
    let debugData;
    
    // Evelyn (Reader ID: 0) interactions
    if (key === '1') {
      debugData = { readerId: 0, uid: "617f1f19" }; // Evelyn's photo
      console.log("Debug: Simulating Evelyn's photo scan");
    } else if (key === '2') {
      debugData = { readerId: 0, uid: "a1991b19" }; // Evelyn's diary
      console.log("Debug: Simulating Evelyn's diary scan");
    } else if (key === '3') {
      debugData = { readerId: 0, uid: "c1991b19" }; // Evelyn's letter
      console.log("Debug: Simulating Evelyn's letter scan");
    }
    
    // Alex (Reader ID: 1) interactions
    else if (key === '4') {
      debugData = { readerId: 1, uid: "617f1f19" }; // Alex's photo
      console.log("Debug: Simulating Alex's photo scan");
    } else if (key === '5') {
      debugData = { readerId: 1, uid: "a1991b19" }; // Alex's diary
      console.log("Debug: Simulating Alex's diary scan");
    } else if (key === '6') {
      debugData = { readerId: 1, uid: "c1991b19" }; // Alex's letter
      console.log("Debug: Simulating Alex's letter scan");
    }
    
    // Mark (Reader ID: 2) interactions
    else if (key === '7') {
      debugData = { readerId: 2, uid: "617f1f19" }; // Mark's photo
      console.log("Debug: Simulating Mark's photo scan");
    } else if (key === '8') {
      debugData = { readerId: 2, uid: "a1991b19" }; // Mark's diary
      console.log("Debug: Simulating Mark's diary scan");
    } else if (key === '9') {
      debugData = { readerId: 2, uid: "c1991b19" }; // Mark's letter
      console.log("Debug: Simulating Mark's letter scan");
    }

    // If a debug interaction was selected, simulate the RFID read
    if (debugData) {
      onSerialDataReceived(null, JSON.stringify(debugData));
    }

    // Press 'I' to show debug info
    if (key === 'i' || key === 'I') {
      debugInfo.isVisible = !debugInfo.isVisible;
    }
  }

  // Dialogue navigation
  if (currentPage === "dialogue") {
    if (keyCode === RIGHT_ARROW) {
      if (currentDialogueIndex < currentDialogueArray.length - 1) {
        currentDialogueIndex++;
        currentDialogue = currentDialogueArray[currentDialogueIndex];
      }
    } else if (keyCode === LEFT_ARROW) {
      if (currentDialogueIndex > 0) {
        currentDialogueIndex--;
        currentDialogue = currentDialogueArray[currentDialogueIndex];
      }
    }
  }
}

// Add to windowResized function if you have one, or create it
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Update input and button positions
  if (suspectInput) {
    suspectInput.position(width/2 - 150, height/2);
  }
  if (accuseButton) {
    accuseButton.position(width/2 - 50, height/2 + 60);
  }
  
  // Update result button positions
  if (continueButton) {
    continueButton.x = width/2 - 100;
    continueButton.y = height/2 + 50;
  }
  if (tryAgainButton) {
    tryAgainButton.x = width/2 - 100;
    tryAgainButton.y = height/2 + 50;
  }
}


