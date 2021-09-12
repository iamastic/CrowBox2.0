## Turning an LED On
### 10/09/21

Building a setup where you can turn on an LED by the click of a switch is quite simple with an Arduino Uno. The switch would essentially send a signal to the Arduino Uno (upon being closed) and the Arduino Uno would then set the LED to HIGH, i.e. turning it on. 

My goal was to achieve the same thing, however, to make the switch a button on a website instead of a physical switch. I also want to be able to turn on the LED over WiFi, allowing the setup to be connected to a powerbank rather than my laptop. 

In order to do this, the first step I took was attempting to control the LED from Firebase. Now, I already have Firebase set up and it is able to receive data from the NodeMCU module. Firebase can also send data, and fortunately the NodeMCU can receive data as well as interpret it. 

Here is the setup I used to connect the LED to the NodeMCU:

![LED Setup](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/LED%20Connected%20to%20NodeMCU.jpg)

Using the same [Firebase library](https://github.com/mobizt/Firebase-ESP8266) as last time, I followed the documentation code and was able to receive a String from the Firebase database I had set up. 

For the code, I first set up some variables. 
```C
String fireStatus = "";                                                   
int led = 5;  
FirebaseData firebaseData;
FirebaseData ledStatus;
```
```fireStatus``` would be the empty String to receive the data into. ```led``` denotes the output pin on the NodeMCU, where 5 is equal to GPIO5 which is also equal to D1 on the NodeMCU. ```firebaseData``` is an object to communicate with the firebase database initially, when setting the LED to off as can be seen here:
```C
Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);                  
Firebase.reconnectWiFi(true);                                                               
Firebase.setString(firebaseData, "led_status", "OFF");  
```
In the ```setup()``` function, I first set the String to "OFF". This is to ensure that the LED is OFF at the very beginning. 

In the ```loop()``` function, I then retrieve this String.
```C
Firebase.getString(ledStatus, "led_status");                                  
```

I then interpret this String by converting it into a C String. I store this information in the ```fireStatus``` variable. 
```C
fireStatus = ledStatus.stringData();
```

The logic to turn the LED On or Off is simple and commonly used:
```C
 if (fireStatus == "ON") 
  {                                                          
    Serial.println("Led Turned ON");                                                        
    digitalWrite(led, HIGH);                                                        
  } 
  else if (fireStatus == "OFF") 
  {                                                  
    Serial.println("Led Turned OFF");
    digitalWrite(led, LOW);                                                       
  }
  else 
  {
    Serial.println("Command Error! Please send ON/OFF");
  }
```

After uploading the code to the NodeMCU and ensuring that it is connected to the WiFi, I then typed "ON" into the relevant field on Firebase, as shown below. 

![Firebase Field](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/LED%20Firebase%20ON.PNG)

Upon typing "ON" and sending that information to the NodeMCU (note, I have not set any ```delay()``` in my ```loop()``` function, thus the NodeMCU is looping constantly), the LED turns on. Also, this works when the NodeMCU is connected to the powerbank, further proving that it is operating over WiFi.

![LED is On](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/LED%20turned%20on%20Firebase.jpg)
