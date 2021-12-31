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

## Perch Switches

|     Element           |     First Connection        |     Second Connection    |
|-----------------------|-----------------------------|--------------------------|
|     GND               |     Blue (-) Power Line     |     I-21                 |
|     Output            |     I-20                    |     ESP32 – GPIO 16      |
|     Perch Switch 1    |     F-20 & F-21             |                          |
|     Perch Switch 2    |     G-20 & G21              |                          |

## Training Button


|     Element    |     First Connection    |          Second Connection         |
|:--------------:|:-----------------------:|:----------------------------------:|
|     Switch     |     Columns E – F       |     Rows 16 – 18                   |
|     GND        |     E-18                |     Closest Blue (-) Power Line    |
|     Output     |     I-16                |     ESP32 – GPIO 4                 |


## Coin Sensor

|     Element                    |     First Connection           |     Second Connection    |
|--------------------------------|--------------------------------|--------------------------|
|     First Coin Sensor Wire     |     Any Blue (-) Power Line    |                          |
|     Second Coin Sensor Wire    |     ESP32 – GPIO 17            |                          |


## DHT11

|     Element       |     Connections                |
|-------------------|--------------------------------|
|     Green Wire    |     ESP32 – GPIO 27            |
|     Red Wire      |     Any Blue (-) Power Line    |
|     Black Wire    |     Any Red (+) Power Line     |


## Infrared Food Sensor

|     Element    |     First Connection    |     Second Connection              |
|----------------|-------------------------|------------------------------------|
|     Output     |     ESP32 – GPIO 21     |                                    |
|     VCC        |     C-14                |                                    |
|     GND        |     C-15                |                                    |
|     GND        |     A-15                |     Closest Blue (-) Power Line    |
|     VCC        |     A-14                |     Closest Red (+) Power Line     |

## Infrared Coin Sensor

|     Element    |     First Connection    |     Second Connection              |
|----------------|-------------------------|------------------------------------|
|     Output     |     ESP32 – GPIO 22     |                                    |
|     VCC        |     C-13                |                                    |
|     GND        |     C-12                |                                    |
|     GND        |     A-12                |     Closest Blue (-) Power Line    |
|     VCC        |     A-13                |     Closest Red (+) Power Line     |

## SD Card Module

|     SD Card     |     ESP32      |
|-----------------|----------------|
|     GND         |     GND        |
|     VCC         |     3.3V       |
|     MISO        |     GPIO 19    |
|     MOSI        |     GPIO 23    |
|     SCK         |     GPIO 18    |
|     CS          |     GPIO 5     |
