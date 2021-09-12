## Turning an LED On
### 10/09/21

Building a setup where you can turn on an LED by the click of a switch is quite simple with an Arduino Uno. The switch would essentially send a signal to the Arduino Uno (upon being closed) and the Arduino Uno would then set the LED to HIGH, i.e. turning it on. 

My goal was to achieve the same thing, however, to make the switch a button on a website instead of a physical switch. I also want to be able to turn on the LED over WiFi, allowing the setup to be connected to a powerbank rather than my laptop. 

In order to do this, the first step I took was attempting to control the LED from Firebase. Now, I already have Firebase set up and it is able to receive data from the NodeMCU module. Firebase can also send data, and fortunately the NodeMCU can receive data as well as interpret it. 

Using the same [Firebase library](https://github.com/mobizt/Firebase-ESP8266) as last time, I followed the documentation code and was able to receive a String from the Firebase database I had set up. 

For the code, I first set up some variables. 
```C
String fireStatus = "";                                                   
int led = 5;  
FirebaseData firebaseData;
FirebaseData ledStatus;
```
```fireStatus``` would be the empty String to receive the data into. ```led``` denotes the output pin on the NodeMCU, where 5 is equal to GPIO5 which is also equal to D1 on the NodeMCU.


