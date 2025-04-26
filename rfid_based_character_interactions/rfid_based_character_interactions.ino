/**
 * --------------------------------------------------------------------------------------------------------------------
 * Example sketch/program showing how to read data from more than one PICC to serial.
 * --------------------------------------------------------------------------------------------------------------------
 * This is a MFRC522 library example; for further details and other examples see: https://github.com/miguelbalboa/rfid
 *
 * Example sketch/program showing how to read data from more than one PICC (that is: a RFID Tag or Card) using a
 * MFRC522 based RFID Reader on the Arduino SPI interface.
 *
 * Warning: This may not work! Multiple devices at one SPI are difficult and cause many trouble!! Engineering skill
 *          and knowledge are required!
 *
 * @license Released into the public domain.
 *
 * Typical pin layout used:
 * -----------------------------------------------------------------------------------------
 *             MFRC522      Arduino       Arduino   Arduino    Arduino          Arduino
 *             Reader/PCD   Uno/101       Mega      Nano v3    Leonardo/Micro   Pro Micro
 * Signal      Pin          Pin           Pin       Pin        Pin              Pin
 * -----------------------------------------------------------------------------------------
 * RST/Reset   RST          9             5         D9         RESET/ICSP-5     RST
 * SPI SS 1    SDA(SS)      ** custom, take a unused pin, only HIGH/LOW required **
 * SPI SS 2    SDA(SS)      ** custom, take a unused pin, only HIGH/LOW required **
 * SPI MOSI    MOSI         11 / ICSP-4   51        D11        ICSP-4           16
 * SPI MISO    MISO         12 / ICSP-1   50        D12        ICSP-1           14
 * SPI SCK     SCK          13 / ICSP-3   52        D13        ICSP-3           15
 *
 * More pin layouts for other boards can be found here: https://github.com/miguelbalboa/rfid#pin-layout
 *
 */

#include <SPI.h>
#include <MFRC522.h>

#define RST_PIN         5   // Configurable, see typical pin layout above
#define SS_1_PIN        10  // Slave Select pin for reader 1
#define SS_2_PIN        9   // Slave Select pin for reader 2
#define SS_3_PIN        8   // Slave Select pin for reader 3

#define NR_OF_READERS   3

byte ssPins[] = {SS_1_PIN, SS_2_PIN, SS_3_PIN};

MFRC522 mfrc522[NR_OF_READERS];   // Create MFRC522 instance.

bool paused = false; // pause if there's things running on p5.js

/**
 * Initialize.
 */
void setup() {

  Serial.begin(9600); // Initialize serial communications with the PC
  while (!Serial);    // Do nothing if no serial port is opened (added for Arduinos based on ATMEGA32U4)

  SPI.begin();        // Init SPI bus

  for (uint8_t reader = 0; reader < NR_OF_READERS; reader++) {
    mfrc522[reader].PCD_Init(ssPins[reader], RST_PIN); // Init each MFRC522 card
    Serial.print(F("Reader "));
    Serial.print(reader);
    Serial.print(F(": "));
    mfrc522[reader].PCD_DumpVersionToSerial();
  }
}

/**
 * Main loop.
 */
void loop() {
  // Receive data from web serial
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    if (command == "PAUSE") {
      paused = true;
    } else if (command == "RESUME") {
      paused = false;
    }
  }

  if (!paused){
    for (uint8_t reader = 0; reader < NR_OF_READERS; reader++) {
      // Look for new cards
      if (mfrc522[reader].PICC_IsNewCardPresent() && mfrc522[reader].PICC_ReadCardSerial()) {
        // Prepare JSON output
        String json = "{";
        json += "\"readerId\":" + String(reader) + ",";
        json += "\"uid\":\"";
        for (byte i = 0; i < mfrc522[reader].uid.size; i++) {
          json += (mfrc522[reader].uid.uidByte[i] < 0x10 ? "0" : "");
          json += String(mfrc522[reader].uid.uidByte[i], HEX);
        }
        json += "\"}";
        
        Serial.println(json); // Output the JSON string

        mfrc522[reader].PICC_HaltA(); // Halt PICC
        mfrc522[reader].PCD_StopCrypto1(); // Stop encryption on PCD
      }
    } //for(uint8_t reader
  }
}

// Reference
// Modify from example code "ReadUidMultiReader.ino"