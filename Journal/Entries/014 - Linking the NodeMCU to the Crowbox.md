## Linking the NodeMCU to the Crowbox
### 11/10/21

To link the NodeMCU ESP8266 to the Crowbox, I first needed to rewire everything in the exact manner as the Arduino was wired. I ensured that all the GPIOs used in the Arduino remained the same when connecting to the NodeMCU ESP8266. Upon connecting this, I decided to upload the Crowbox code as it is, without making any changes. I did this to check what errors were bound to pop up, so that I may know exactly what needs fixing. The only error that popped up was regarding the EEPROM. The EEPROM is an internal storage mechanism in the Arduino. The NodeMCU ESP8266 does not have an EEPROM per se, rather it works on flash memory. This memory can be accessed in a similar method. I had to include particular lines of code in order to access the "EEPROM" on the NodeMCU. For example: 

```C
EEPROM.begin(N);
```

Where ```N``` is a number to allocate a certain amount of memory; in this case I used 512. 

The original Crowbox OS wrote to the EEPROM using this method: 
```C
EEPROM[ addr ] = *pHeaderCharacter;
```

Where ```*pHeaderCharacter``` is a String. I had to change this for the NodeMCU to: 

```C
EEPROM.write(addr, *pHeaderCharacter);
```

Where ```addr``` is the address at which to write in the EEPROM. 

Another change that needed to be made in order for this to work was how to update a memory slot in the EEPROM/Flash Memory. The Crowbox OS uses:

```C
EEPROM.update( CROS_EEPROM_ADDRESS_TRAINING_PHASE, m_currentTrainingPhase );
```

The NodeMCU EEPROM library does not offer the ```update()``` function. As such, I had to replace it with ```put()```, and everything else remained the same. 
Finally, after every write to the EEPROM/Flash Memory, the NodeMCU requires the following line to confirm the write: 

```C
EEPROM.commit();
```

Now, when I uploaded the code, I did not receive any errors and the code was uplaoded successfully. After connecting the servo to power, nothing happend. The servo did not work. However, the NodeMCU was receiving information from the perch switches as well as the coin sensor. I realised there must be some issue related to the servo only. I disconnected everything but the servo and decided to test simple code, attempting to turn the servo 180 degrees clockwise and anti clockwise after every 4 seconds. When testing this, I learnt that the servo was only moving around 90 degrees. Roughly half of what I expected it to move. The servo worked perfectly when connected to the Arduino. I then decided to connect the NodeMCU to the same power supply as the servo (instead of the USB connection), but to no avail. 

I did a bit of research and noted that a few other people were facing similar issues to me. There was no apparent solution online, however. I decided to test the same code on my NodeMCU ESP32. The ESP32 is a newer and more powerful version of the ESP8266. Furthermore, unlike the ESP8266 which uses the ```Servo.h``` library to control the servo, the ESP32 uses the ```ESP32Servo.h``` library. The tests were a success and the ESP32 was able to fully control the Servo. I then realised that this must be a library issue. As such, for the time being, I have switched to using the ESP32 instead of the ESP8266.

Here is the wiring setup for the NodeMCU ESP32 and the servo: 

* The Servo is connected via GND and POWER to a 5V2A power supply from a wall socket. 
* The Signal wire of the servo goes into P2 of the NodeMCU ESP32
* The ESP32 GND is connected to the same GND as the Servo. 
* The ESP32 is connected to power via the USB cable into my laptop. 

![ESP32 and Servo](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/NodeMCU%20ESP32%20%2B%20Servo.jpg)

After switching to the NodeMCU ESP32, I continued with adapting the Crowbox code to work with this microcontroller. I reconnected all of the wires to the GPIO pins, trying to keep it as closely similar to the original Crowbox set up. 

Here are the original GPIO connections for the CrowBox and the Arduino

```C++
#define OUTPUT_PIN_LED          13
#define OUTPUT_PIN_SERVO        9      
#define INPUT_PIN_PERCH         2
#define INPUT_PIN_COIN          3
#define INPUT_PIN_PHASE_SELECT  4
```

The orientation of the GPIO pins on the NodeMCU are very different to that of the Arduino. As a result, I had to redesign the layout, and my focus now was to keep all the wires as close to each other on one side to avoid any unnecessary overlapping and tangling. Here are the GPIO pins set up for the NodeMCU ESP32:

```C++
#define OUTPUT_PIN_LED          2
#define OUTPUT_PIN_SERVO        15      
#define INPUT_PIN_PERCH         16
#define INPUT_PIN_COIN          17
#define INPUT_PIN_PHASE_SELECT  4
```

One very important difference is that of the ```OUTPUT_PIN_LED```, which is the LED placed on the Microcontroller that can be controlled by the designer. On the Arduino, this is controlled through pin 13, whereas on the NodeMCU, it is controlled via GPIO 2.

After setting everything up, I ran the box and the microcontroller through a Function Test. This would involve testing each stage's functions at least 5 times. Stage 1 and 2 worked as intended. During Stage 3, whenever a coin was deposited, the sliding lid took a while to open. Once it did open, it spun a couple of times, and then immediately closed. I realised this must be an issue with either the servo or the code. However, the servo could not be at fault as I had tested it extensively with sample code as well as during Stage 2, in which it performed perfectly. I decided to turn on the debugging features of the crowbox (to turn on the debugging features which are enclosed with an ifdef, one must simply define the serial port). 

The coin sensor is set up as so: 
* A coin strikes the two copper covered plates 
* A signal is sent by the voltage going from HIGH to LOW 
* An interrupt is attached to the GPIO pin to catch this change in signal, resulting in the code to open the sliding lid to execute

The interrupt is set up by first attaching it to the pin: 
```C++
attachInterrupt( digitalPinToInterrupt(INPUT_PIN_COIN), Interrupt_CoinDeposit, FALLING );
```

Where ```INPUT_PIN_COIN``` is the GPIO 17, ```Interrupt_CoinDeposit``` is the function called when this interrupt occurs and `FALLING` is 


