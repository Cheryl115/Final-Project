#include <Servo.h>

// Constants for rotary encoder pins
const int clkPin = 2;
const int dtPin = 3;

// Constants for LEDs
const int ledPins[3] = {4, 5, 6};

// Servo pin
const int servoPin = 9;

// Variables to store the current and last encoder position
int currentPos = 0;
int lastPos = 0;
int targetNumbers[3] = {4, 16, 12}; // Actual target numbers
int currentNumber = 0;
int dialRange = 20; // Number of positions in one full turn
int tolerance = 3; // Tolerance of password 

// Timer variables
unsigned long lastEncoderTime = 0;
unsigned long positionHoldTime = 3000; // 3 seconds

// Servo object
Servo myServo;

void setup() {
  Serial.begin(9600);
  pinMode(clkPin, INPUT);
  pinMode(dtPin, INPUT);
  for (int i = 0; i < 3; i++) {
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], LOW); // Start with all LEDs turned off
  }
  myServo.attach(servoPin);
  myServo.write(0);
  
  // Setup encoder
  lastPos = digitalRead(clkPin);
}

void loop() {
  int n = digitalRead(clkPin);
  if (n != lastPos) { // If the position has changed
    if (digitalRead(dtPin) != n) {
      currentPos++;
    } else {
      currentPos--;
    }
    lastPos = n;
    lastEncoderTime = millis(); // Reset timer if position changes
    checkProximity();
  }

  int dialPosition = ((currentPos % dialRange)+dialRange) % dialRange;

  // Check if the position has been held
  if ((millis() - lastEncoderTime) >= positionHoldTime && abs(dialPosition - targetNumbers[currentNumber]) <= tolerance) {
    digitalWrite(ledPins[currentNumber], HIGH); // Light up the corresponding LED
    currentNumber++;
    Serial.println("Unlocking Safe,Volume:100");
    if (currentNumber == 3) {
      unlockSafe();
    }
  }
}

void checkProximity() {
  int dialPosition = ((currentPos % dialRange)+dialRange) % dialRange;
  int distance = abs(dialPosition - targetNumbers[currentNumber]);
  int volume = map(distance, 0, 10, 100, 0); // Map proximity to volume, louder as closer
  Serial.print("Moving,Volume:");
  Serial.println(volume);
}

void unlockSafe() {
  myServo.write(3600); // Unlock the safe
}
