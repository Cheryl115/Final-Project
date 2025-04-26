#include <Servo.h>

// Constants for rotary encoder pins
const int clkPin = 2;
const int dtPin = 3;

// Constants for LEDs
const int ledPins[3] = {4, 5, 6};

// Buzzer and servo pins
const int buzzerPin = 10;
const int servoPin = 9;

// Variables to store the current and last encoder position
int currentPos = 0;
int lastPos = 0;
int targetNumbers[3] = {10, 40, 60}; // Replace these with your actual target numbers
int currentNumber = 0;

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
  }
  pinMode(buzzerPin, OUTPUT);
  myServo.attach(servoPin);
  myServo.write(0);
  
  // Setup encoder
  lastPos = digitalRead(clkPin);
  Serial.println(currentPos);
}

void loop() {
  int n = digitalRead(clkPin);
  Serial.println(currentPos);
  if (n != lastPos) { // If the position has changed
    if (digitalRead(dtPin) != n) {
      currentPos++;
    } else {
      currentPos--;
    }
    Serial.println(currentPos);
    lastPos = n;
    lastEncoderTime = millis(); // Reset timer if position changes
    checkProximity();
  }

  // Check if the position has been held
  if ((millis() - lastEncoderTime) >= positionHoldTime && abs(currentPos - targetNumbers[currentNumber]) == 0) {
    confirmPosition();
  }
}

void checkProximity() {
  int distance = abs(currentPos - targetNumbers[currentNumber]);
  if (distance <= 10) {
    // Adjust volume based on proximity
    int volume = map(distance, 0, 10, 255, 0); // Louder as closer to target  } else {
    analogWrite(buzzerPin, volume);
    tone(buzzerPin, 1000, 200); // Beep for 200 ms
  }
}

void confirmPosition() {
  digitalWrite(ledPins[currentNumber], HIGH);
  tone(buzzerPin, 1000, 200); // Beep for 200 ms
  delay(300);
  tone(buzzerPin, 1000, 200); // Beep again
  currentNumber++;
  if (currentNumber == 3) {
    myServo.write(180); // Unlock the safe
  }
}
