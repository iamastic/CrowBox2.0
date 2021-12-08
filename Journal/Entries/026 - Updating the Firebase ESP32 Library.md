## Updating the Firebase ESP32 Library

Earlier, the library I used for the ESP32 to communicate with Firebase was [this one](https://github.com/mobizt/Firebase-ESP32). The owner of this library created a new but simila library with updated functions such as the use of Cloud Firestore, which may be found [here](https://github.com/mobizt/Firebase-ESP-Client). Initially, I wanted to revolve the database around Firebase's newer DB which was Firestore. However, given that there was no library that supported a communication stream between the ESP32 and Firestore, I resorted to using the RTDB instead. Now, despite the introduction of the new library, I did not want to switch over to firestore as I had already done a significant amount of work and designing e.g. the data schema for the RTDB JSON/tree structure. Nonetheless, since the newer library was going to eb better supported and updated (e.g. for security fixes) than the previous one, I decided to make the switch over. 

**Here are the Key Changes**

To start, I had to include a new library name: 
`#include <Firebase_ESP_Client.h>` instead of `<FirebaseESP32.h>`. 

Next, all the firebase functions moved to a different class. From `Firebase.setString()` to `Firebase.RTDB.setString()`

Then, since all of the Firebase Functions now used pointers to the FirebaseData Objects, I had to make one slight change to be able to send over the addresses rather than the actual object:

From: `Firebase.RTDB.setString(coinsData, "Users/"+USER_ID+"/Crowbox/Status/coins", "LOW");` to 
`Firebase.RTDB.setString(&coinsData, "Users/"+USER_ID+"/Crowbox/Status/coins", "LOW");`

Where `coinsData` is of type `FirebaseData`. 

