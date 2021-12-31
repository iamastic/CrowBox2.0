## Power

|           Element          |              First Connection            |             Second Connection            |
|:--------------------------:|:----------------------------------------:|:----------------------------------------:|
|     Terminal   Block       |     Rows 27 -   30, Columns F – I                                                   |
|     Terminal   5V (VCC)    |     30-I                                 |     Closest   Red (+) Power Line         |
|     Terminal   GND         |     28-I                                 |     Closest   Blue (-) Power Line        |
|     Terminal   5V (VCC)    |     Red   (+) Power Line on one side     |     Red   (+) Power Line on one side     |
|     Terminal   GND         |     Blue   (-) Power Line on one side    |     Blue   (-) Power Line on one side    |
|     GND                    |     Any   Blue (-) Power Line            |     ESP32   – GND                        |

## Servo

|            Element           |       First Connection      |     Second Connection    |
|:----------------------------:|:---------------------------:|:------------------------:|
|     Terminal 5V (VCC)        |     Red (+) Power Line      |     I-26                 |
|     Terminal GND             |     Blue (-) Power Line     |     I-25                 |
|     Terminal 5V (VCC)        |     G-26                    |     C-26                 |
|     1 Ohm 5 Watt Resistor    |     F-25                    |     E-25                 |
|     Resistor Connection      |     B-25                    |     ESP32 – GPIO 34      |
|     Servo – Red              |     A-26                    |                          |
|     Servo – Brown            |     A-25                    |                          |
|     Servo – Orange           |     ESP32 – GPIO 15         |                          |
