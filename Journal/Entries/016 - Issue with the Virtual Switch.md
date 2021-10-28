## Issue with the Virtual Switch
### 16/10/21

After setting up the functions to handle reading and updating data from the database, I ran into a new issue regardin the NodeMCU and its connection to the firebase RTDB. The training phase was originally controlled by a physical switch. Once the user presses the switch, they then have to click the reset button on their Arduino/NodeMCU and the Crowbox will be initiated in the new Training Phase. Everytime the user hits the switch, the training phase is incremented by 1 (starting from 1). Once it reaches 4, it is reset back to 1 again (as there are only 4 training stages). The onboard led blinks the set number of times to indicate which training stage it is currently on. As I am introducing an IoT system into the mix, my objective was to allow the user to read the training stage directly from the website, and with a click of a button, switch between the training stages in any order (so not fixed to incremental changes). 

In order to do this, every time the NodeMCU runs the `loop()` function, it checks the training phase. The function gets the data from the Firebase Database and checks to see if the training phase has change. If it has changed, then it resets the NodeMCU and the device boots with the correct stage. 

```c++
void CCrowboxCore::CheckTrainingPhaseSwitch()
{
  int newTrainingStage = 0;

  if (Firebase.getInt(trainingPhase, "Users/"+username+"/Crowbox/current_training_stage")) {  
    newTrainingStage = trainingPhase.to<int>();
  } else {
    Serial.println("Error retreiving data from Firebase");
  }

  if ((newTrainingStage >=1) && (newTrainingStage <=4)) {
    if (newTrainingStage != m_currentTrainingPhase) {
    //restart esp32
    ESP.restart();
  }
  } else {
    Serial.println("New training stage is outside valid range");
  }
}
```

This worked well initially. Eveytime the user switches the training phase on the website, that data was pushed from the website to firebase, which was then received by the NodeMCU ESP32. The device would then reset and the user is now using the crowbox in their desired training phase. The issue however was that since data was being requested from the firebase server constantly, the data would occassionally fail to send. When this would happen, the serial would print `"Error retreiving data from Firebase"` and fail to proceed with the other tasks. This is an issue that needs to be solved.
