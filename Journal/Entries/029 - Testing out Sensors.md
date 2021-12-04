## Testing out Sensors

One of the objectives of the project is to implement a Troubleshoot/Status Update system. The goal is to enable the Crowbox to automatically take care of itself and/or notify the user of any errors it may face. For example, if the amount of food in the food basket was to be low or empty, the Crowbox is to notify the user to refill the basket. To achieve this, I needed to test out various sensors. 

**The Troubleshoot System**
* Be able to check the amount of food left 
* Be able to check if there are coins in the coin dispenser 
* Be able to check if the Servo is stuck 
* Be able to check if there is a WiFi Connection 
* Be able to check if the Perch Switches are working 
* Check the Water/Humidity status to ensure water proofing

### Food Level 
For this, I ordered a [Infrared Proximity Sensor](https://www.botnroll.com/pt/infravermelhos/2396-modulo-sensor-de-proximidade-obstaculos-.html). Connecting this was simple as it uses GND, VCC (up to 5V) and an input (GPIO) pin. To get this working, here was the code I used: 

```c++
void CCrowboxCore::CheckFoodLevel() {
  int foodLevel = !digitalRead(INPUT_FOOD_SENSOR);

  if(foodLevel) {
    if (!isFoodThere) {
      //We have a new input i.e. new food has been added
      isFoodThere = true;
      //Update the value in firebase to "WORKING"
      Firebase.RTDB.setString(&foodData, "Users/"+USER_ID+"/Crowbox/Status/food", "WORKING");
    } else {
      //Food is still present, nothing has changed since 
      //the last time we checked and everything is working
      //We do not need to update anything in firebase here
    }
  } else {
      //There is no/low food in the basket
      //Needs to be refilled
      if (isFoodThere) {isFoodThere = false;} 
        Firebase.RTDB.setString(&foodData, "Users/"+USER_ID+"/Crowbox/Status/food", "LOW");
  }
  //clear the data to make space!
  foodData.clear();
}
```

### Coins Level 
For the Coins, I initially tried to use a [touch sensor](https://www.botnroll.com/en/sensors/2504-digital-capacitive-touch-sensor-for-arduino.html). According to the [documentation](https://wiki.dfrobot.com/DFRobot_Capacitive_Touch_Sensor_SKU_DFR0030), this sensor works with the human touch as well as with metal. Given that the coins I am using are copper covered steel coins, I expected the sensor to register the existence of coins on it. However, it did not and failed to register the contact of the coins. It did, however, work with human touch. As a result, I resorted to using another IR Sensor (the same one used for the food level) to check if the amount of coins left. The idea is that if there are no coins obstructing the IR sensor's view, then it will update the status of the crowbox to an ERROR and notify the user. 

### The Humidity/Water Sensor 
To check if there is water in leaking into the Crowbox, I decided to make use of the very popular [DHT11](https://www.botnroll.com/en/temperature/471--dht11-temperature-and-humidity-sensor.html) Sensor. Connecting this was also simple as it only made use of GND, VCC and a Digital or Analog on the NodeMCU ESP32 GPIOs. I initially tried to use this sensor by utilising the standard `DHT11.h` library. I quickly noticed, however, that the sensor was not able to receive any input and was returning `NaN` instead of the value (i.e. the Humidity value). Checking the [documentation]() of the sensor, I learnt that the engineers built their own library for this specific device. I imagine this might be an issue down the road if different users from around the world cannot access the exact same sensor, therefore having to use another library that might be incompatible with my code. Nonetheless, here is the code I used: 

```c++
//Include the library that I installed
#include <dht11.h>

//define the DHT object
dht11 DHT;


void CCrowboxCore::CheckHumidityLevel() {
  //initialise the DHT value and pin
  DHT.read(INPUT_PIN_HUMIDITY);
  
  newHumidityValue = DHT.humidity; 

//Initially, before any values are read
  if(previousHumidityValue < 0) {
    Firebase.RTDB.setString(&humidity, "Users/"+USER_ID+"/Crowbox/Status/humidity", "WORKING");
  }

  //is the value we just received greater than the threshold? 
  if(newHumidityValue >= HUMIDITY_THRESHOLD) {
    //is the previous value less than the threshold? If it is, then
    //and only then should we update firebase. 
    //This is to avoid sending too many requests, one is enough. 
    if (previousHumidityValue < HUMIDITY_THRESHOLD) {
      Firebase.RTDB.setString(&humidity, "Users/"+USER_ID+"/Crowbox/Status/humidity", "WET");
    }
  } else {
    //If not, then perhaps we need to reset it back to working. 
    //First check if the previous value was greater than the threshold
    //If it is greater, then that means we are going from WET to WORKING
      if (previousHumidityValue >= HUMIDITY_THRESHOLD) {
        Firebase.RTDB.setString(&humidity, "Users/"+USER_ID+"/Crowbox/Status/humidity", "WORKING");
      }
  }

  //Update the previous value
  previousHumidityValue = newHumidityValue;
  humidity.clear();
}
```

Here is an image of all 3 sensors working in tandem: 

![sensors]()
