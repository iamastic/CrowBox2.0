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
