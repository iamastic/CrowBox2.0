## Firebase
### 07/09/21

An objective of this project is to create a MEAN stack application to go alongside the Crow Box. The idea is that the Crow Box will send data to the Mongodb database, and this data will be read and displayed on the website run by Angular for the frontend. However, as I explored further into the world of realtime data collection, I noted that Firebase is at the forefront of realtime data gathering. Firebase also works well with Angular and as such, may be able to replace Mongodb. As a result, I decided to experiment with connecting the NodeMCU as well as the Capacitive Soil Moisture sensor to a realtime Firebase database and record the data (instead of using ThingSpeak). This would essentially mean that the user would not need to worry about creating an accoun on any external API. Rather, they only alterations they would need to make are for inputting their SSID and Password to connect to their local internet. 

In order to connect to Firebase, the WiFi connection for the NodeMCU remains the exact same as the ThingSpeak one. In order to connect to Firebase, however, I needed to install a particular [library](https://github.com/mobizt/Firebase-ESP8266). This library enables communication between the NodeMCU and firebase. Using this library, I then set up a FirebaseData object as well as a FirebaseJson object. 
```C
FirebaseData firebaseData;
FirebaseJson json;
```

I then stored the data from the sensor in the form of a String 
```C
output_value= analogRead(sensor_pin);
output_value = map(output_value,550,0,0,100);     
Serial.print("Humidity: ");  Serial.print(output_value);
String fireHumid = String(output_value) + String("%"); 
```

And pushed the data to firebase
```C
Firebase.setString(firebaseData, "Humidity", fireHumid)
```

I then waited 30 seconds to send another sensor reading. 
Here was the output on firebase:
![Firebase Output](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/Firebase.PNG)
