// set up LEDs
// Constants for LEDs
const int ledPins[3] = {2, 4, 7};

// set up photoresistor
const int pResistor = A0;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  for (int i = 0; i < 3; i++) {
    pinMode(ledPins[i], OUTPUT);
  }
}

void loop() {
  // put your main code here, to run repeatedly:
  int light = analogRead(pResistor);
  Serial.print("light value: ");
  Serial.println(light);
  // turn on the LED light when using flashlight
  if(light > 900){
    for (int i = 0; i < 3; i++) {
      digitalWrite(ledPins[i], HIGH);
    }
  }
  // turn off the LED light if there's no flashlight
  else{
    for (int i = 0; i < 3; i++) {
      digitalWrite(ledPins[i], LOW);
    }
  }
  delay(100);
}


// Reference
// https://projecthub.arduino.cc/tropicalbean/how-to-use-a-photoresistor-1143fd
