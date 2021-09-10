Sending and receiving the data via email is not suitable for this project. It would require too much effort from the user building the Crow Box e.g. they must create a new independent email account and refactor parts of the code. 

It would be ideal if the user could receive their data and visualise it in realtime. To achieve this, numerous projects use APIs that collect and display data in realtime. One such API is [ThingSpeak](https://thingspeak.com/). Connecting to ThingSpeak is quite simple as well. One must create an account, create a new Channel and enter in the Fields of data they would like to collect (in this scenario, I just needed to collect Humidity Data in %). After this, a Read and Write API Key are generated. 

To connect everything up, I first connected to the WiFi. 
```C
void setup()
{
  Serial.begin(115200);
  delay(10);


  Serial.println("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

}
```

Where ```ssid``` is your Network name and ```pass``` is the password to your WiFi. After this, you collect the data
```C
output_value = analogRead(sensor_pin);
output_value = map(output_value, 550, 0, 0, 100);
```
And map it correctly to obtain the % value. 

Using another [tutorial](https://roboindia.com/tutorials/nodemcu-dht11-thingspeak-data-upload/), I transfered this data to ThingSpeak in the form of a String as shown below. 

```C
String postStr = apiKey;
postStr += "&field1=";
postStr += String(output_value);
postStr += "\r\n\r\n";
client.print("POST /update HTTP/1.1\n");
client.print("Host: api.thingspeak.com\n");
client.print("Connection: close\n");
client.print("X-THINGSPEAKAPIKEY: " + apiKey + "\n");
client.print("Content-Type: application/x-www-form-urlencoded\n");
client.print("Content-Length: ");
client.print(postStr.length());
client.print("\n\n");
client.print(postStr);
```

Where ```client``` is a ```WiFiClient``` object. I set a delay of 30 seconds:
```C
 delay(30000);
```
And soon enough, the data showed up on my ThingSpeak Channel. 
![ThingSpeak Channel Data](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/ThingSpeakChannelData.PNG)

I varied the data by
* Leaving the sensor alone
* Placing it in water
* Covering it with my hand

The data changed in realtime and a lovely graph was produced. Nonetheless, this is not the ideal way to do this. The User still has to jump through many hoops to get to this stage. They must create a ThingSpeak account, create their own channels, retrieve and alter the API keys and then run the code. Furthermore, after doing several tests on various different Channels, I learnt that the ```WiFiClient``` object is unrealiable at times. My connection to the client would take a while to start sometimes (e.g. 3-5 minutes of delay). Sometimes, it would not start at all. Others, on various forums, have related to this issue. It is also concerning that after a given while, the Connection may timeout. This would most defintely impact the Crow Box's ability to record data. 
