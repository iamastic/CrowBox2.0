## The NodeMCU
### 01/09/21

The [NodeMCU](https://www.nodemcu.com/index_en.html) is an open source alternative to the Arduino Uno. It provides WiFi capabilities with an in-built ESP8266 and is much cheaper than the baseline Arduino Uno (7.5 Euros whereas the Arduino Uno is 22 Euros). It can be programmed similar to the Arduino within the Arduino IDE and majority of the code is quite similar as well (including the libraries it uses). It is significantly smaller than the Arduino Uno and the only visible drawback is that it has only 1 Analog Input (where as the Uno has 5). This, however, should not be much of an issue as the current iteration of the Crow Box does not rely on any Analog Inputs (only digital). 

In order to get accustomed to using the NodeMCU (the model I am using is the NodeMCU ESP8266-12E), I decided to follow [this](https://www.youtube.com/watch?v=IvzBPXqyUm4&list=PLL0fcTz6W1c2xZpSq53z4UA9phVYJC_4r&index=5&ab_channel=CarolineDunn) tutorial. In this tutorial, they connect the NodeMCU to a Capacitive Soil Moisture Sensor and relay the data wirelessly to an Email Account. Every 30 seconds or so, the user will receive an email with the data. This will be transfered over WiFi and as such, the NodeMCU does not have to be connected to a computer in order to function (must be connected to a power bank or wall outlet).

Building this was quite simple. I have attached an image below of my build. 
![NodeMCU + Capacitive Soil Moisture Sensor](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/NodeMCU%2BSoilSensor.jpg)

The NodeMCU is then connected to the WiFi and upon receiving the data from the sensor, it sends an email to yourself after every N seconds, where N is any number you desire. 
