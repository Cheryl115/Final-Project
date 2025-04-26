
// Define the pins that Trig and Echo are connected to
const int trigPin = 9;  
const int echoPin = 10; 

// Define the LEDs
const int ledPins[3] = {2, 4, 7};


// duration and distance, hold the length of the sound wave and how far away the object is.
float duration, distance;

void setup() {
  // declare Trig pin as an output, and Echo pin as an input
	pinMode(trigPin, OUTPUT);  
	pinMode(echoPin, INPUT); 
  for (int i = 0; i < 3; i++) {
    pinMode(ledPins[i], OUTPUT);
  } 
	Serial.begin(9600);
}

void loop() {
  // set the trigPin low for 2 microseconds just to make sure that the pin in low first.
	digitalWrite(trigPin, LOW);  
	delayMicroseconds(2);  
  // set it high for 10 microseconds, which sends out an 8 cycle sonic burst from the transmitter, which then bounces of an object and hits the receiver
	digitalWrite(trigPin, HIGH);  
	delayMicroseconds(10);  
	digitalWrite(trigPin, LOW);

  //store the time in the duration variable.  
  duration = pulseIn(echoPin, HIGH);
  // caculate the distance with the equation speed = distance/time, time = .0343 c/μS
  // devide it by 2 cause the sound wave travel to the object and back
  distance = (duration*.0343)/2;  
  Serial.print("Distance: ");  
	Serial.println(distance);  
  
  // if player use their hand to cover the easy mode option, light all LEDs that is placed becide the interactive objects
  if (distance < 5){
    for (int i = 0; i < 3; i++) {
      digitalWrite(ledPins[i], HIGH);
    }
  }
  else{
    for (int i = 0; i < 3; i++) {
      digitalWrite(ledPins[i], LOW);
    }
  }

  delay(100);  
}

// Reference
// https://projecthub.arduino.cc/Isaac100/getting-started-with-the-hc-sr04-ultrasonic-sensor-7cabe1