
//==========================================================
// cros.ino
//
// The 'kernel' of the CrOS is called "The Core"
// 
// Version 0.99c - October 2018
//
// http://www.thecrowbox.com
//==========================================================
//   Except where otherwise noted, this work is licensed 

//   under a Creative Commons Attribution-ShareAlike 4.0
//   International License
//==========================================================

#include "cros_core.h"
#include "cros_constants.h"
#include "cros_types.h"

//======================================
// Allocate the core object right here 
// on the heap so that the Arduino IDE 
// is more correct about how much memory
// the CrOS software when this is reported
// after a successful compile
//======================================
CCrowboxCore g_crOSCore;
//FirebaseData fireTrainingStage;

//======================================
// Called by the Arduino system one time,
// after the board boots up. CrOS hooks
// to this to call the core's Setup()
// method
//======================================
void setup() 
{
    //MY WORK
    Serial.begin(115200);
    delay(1000);  
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);                               
    Serial.print("Connecting to ");
    Serial.print(WIFI_SSID);
    while (WiFi.status() != WL_CONNECTED) 
    {
      Serial.print(".");
      delay(500);
    }
    Serial.println();
    Serial.print("Connected to ");
    Serial.println(WIFI_SSID);

    
    // Assign the api key (required)
    //config.api_key = API_KEY;

    // Assign the user sign in credentials
    //auth.user.email = USER_EMAIL;
    //auth.user.password = USER_PASSWORD;

    //config.database_url = FIREBASE_HOST;

    
    //Firebase.reconnectWiFi(true);


    // Assign the callback function for the long running token generation task
    //config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h

    // Assign the maximum retry of token generation
    //config.max_token_generation_retry = 5;

    // Initialize the library with the Firebase authen and config
    //Firebase.begin(&config, &auth);
    //connect to firebase


    //END MY WORK

    // Run-Once
    g_crOSCore.Setup(); 
}

//======================================
// Called as often as possible by the
// Arduino system. CrOS hooks to this 
// in order to call the core's Loop()
// method
//======================================
void loop()
{
    // Continuous Run
    g_crOSCore.Loop();
}
