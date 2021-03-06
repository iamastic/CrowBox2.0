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

Where ```INPUT_PIN_COIN``` is the GPIO 17, ```Interrupt_CoinDeposit``` is the function called when this interrupt occurs and `FALLING` is to indicate that the interrupt will ocurr when the voltage goes from HIGH to LOW.

The `Interrupt_CoinDeposit` looks like: 

```C++
void Interrupt_CoinDeposit()
{
    g_crOSCore.EnqueueCoin();
}
```

The [offical ESP32 documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/memory-types.html) recommends placing this Interrupt Handler function within the IRAM (or Instruction RAM). This is to ensure that the code is executed faster and also seperate from the other ordinary functions of the code. To do this, I simply had to add `IRAM_ATTR` to the function header as so: 

```C++
void IRAM_ATTR Interrupt_CoinDeposit()
{
    g_crOSCore.EnqueueCoin();
}
```

This, however, did not fix my problem. Something else was causing the Crowbox to reboot each time a coin collides with the two plates and an interrupt is fired off. I was getting the following errors each time I sent a coin down the chute: 

`Guru Meditation Error: Core 1 panic'ed (Coprocessor exception)` and `Core 1 was running in ISR context`. I realised that the error must be coming from the functionc called by the ISR: `g_crOSCore.EnqueueCoin();`

The original crowbox function looked like:

```C++
bool CCrowboxCore::EnqueueCoin()              
{
    if( GetUptimeSeconds() - m_uptimeLastCoinDetected < 1.0f )
    {
        return false;
    }
    
    m_numEnqueuedDeposits++;    
    m_uptimeLastCoinDetected = GetUptimeSeconds();
    return true;
}
```

The function `GetUptimeSeconds()` returns a float and `m_uptimeLastCoinDetected` is also a float. If the time is between the two is below 1 second, this means that some contact bounce has been recorded. In order to avoid counting the same coin more than once, a 1 second buffer was provided i.e. if the last time the sensor recorded a coin was less than 1 second ago, then it is the same coin, so do nothing. In the ESP32, it is not possible to work with floats within the Interrupt Function. The reason behind this is the time complexity it takes for the function to complete exceeds the maxmimum time and space when using calculations to do with floats. To solve this problem, instead of measuring the time since the last coin collision (to ensure that the same coin is not counted more than once due to contact bounce), I detached the interrupt within the interrupt function. 

This logic runs as follows: 
* The coin colliding with the two copper plates invokes the interrupt function. 
* Within the interrupt function, I first detach the interrupt. This is done to ensure that the contact bounce does not result in another interrupt being called.

The code is now: 

```c++
void IRAM_ATTR Interrupt_CoinDeposit()
{
    //detach the interrupt temporarily
    detachInterrupt(digitalPinToInterrupt(17));
    g_crOSCore.EnqueueCoin();
}
```
* Then, in `g_crOSCore.EnqueueCoin()`, I simply increase the number of coins deposited and return true. 

In the `RunPhaseThreeProtocol()`, when the Crowbox is in Stage 3, the logic for handling the coin being deposited is run. In this code, the number of coins deposited is checked and if it is greater than 0, then that means that there is a surplus of coins, and as a result, the food basket needs to open. In this function, if there is a surplus of coins deposited, I set a brief delay and then reattach the original Interrupt. I then subtract from the number of coins deposited (to bring it back to 0) and open the food basket for roughly 20 seconds before shutting it. 

Initially, this code worked fine. By detaching the interrupt from the original contact, I expected all the remaining contacts due to contact bounce to not be registered. Then, once everything had been registered and we have returned from the interrupt function, I reattach the interrupt to begin seeking for the next coin's contact. This, however, did not work. I learnt that when you reattach an interrupt to the same GPIO pin, all the pending interrupts are executed even if the interrupt has been detached. As a result, upon reattaching the interrupt, the box would immediately fire off and the food lid would open a couple more times due to the contact bounce being registered as pending interrupts.  

To solve this problem, I decided to create a blank function called `FlushOutInterrupts()`. When I reattached the interrupt, I set the aforementioned function as the ISR. This works by allowing the pending interrupts to run, but they essentially do nothing. After this, I detach and reattach the interrupt to the correct function. As there are no longer any pending interrupts, this works seamlessly. This is, however, not the ideal solution to the problem. After writing about this issue on the ESP32 forum as well as the Arduino Forum, I have been advised to attempt using `unsigned long` instead of `floats` as they are more precise and are commonly used to handle time variables in Arduinos. 
