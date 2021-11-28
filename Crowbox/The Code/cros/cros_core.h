//==========================================================
// cros_core.h
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
#ifndef CROS_CORE_H
#define CROS_CORE_H


/* MY WORK */
#include <ESP32Servo.h>
#include <WiFi.h> 
//#include <FirebaseESP32.h>
//new Updated firebase client 
#include <Firebase_ESP_Client.h>


#include <NTPClient.h>
#include <WiFiUdp.h>

#define WIFI_SSID "Vodafone-72DA74"                                          
#define WIFI_PASSWORD "t6vaHAN6bpy5z4qb"     

//the project name address from firebase id
//the database url
#define FIREBASE_HOST "crowbox-37e57-default-rtdb.firebaseio.com"            
#define API_KEY "AIzaSyBxA1xYz2zbcuOw9f_Xi3OzCVLc_2OzMf8" 

// the secret key generated from firebase
//no longer needed
//#define FIREBASE_AUTH "pgwTyjv4NBcA8xZ2k0IkTjvsMxKiG6cSXmRSldS6"       

//the UID of the user
/* #define USER_ID "n8hWiynNjVNLaKgQ2TSHUmc0ZSG2"
 */

/* END MY WORK */

#include <Arduino.h>
#include "cros_types.h"
#include "cros_constants.h"

//global variables
   

//==========================================================
// This fancy 'core' of ours is actually
// just an instance of this CCrowboxCore
// object.
//==========================================================
class CCrowboxCore
{
public:
    //--------------------
    // CTor/DTor
    //--------------------
    CCrowboxCore();
    
    //--------------------------------------
    // To promote understanding, these methods
    // bear the same name as the Arduino
    // entry points which call them.
    //--------------------------------------
    void Setup();
    void Loop();

public:
    void DebugPrint( const char *pString );
    void ReportSystemError( cros_error_code_t errorCode );
    
    //--------------------------------------
    // Public Accessor methods
    //--------------------------------------
    cros_time_t GetUptimeSeconds();
    bool        IsABirdOnThePerch();
    cros_time_t HowLongHasBirdBeenHere();
    cros_time_t HowLongHasBirdBeenGone();

    /* MY WORK */
    //for auth
    FirebaseAuth auth;
    //for configuration
    FirebaseConfig config;

    int numberOfCrowsLanded;
    FirebaseData crowOnPerch;
    int numberOfCoinsDeposited;
    FirebaseData coinDeposit;
    FirebaseData trainingPhase;
    FirebaseData trainingPhaseLoop;

    // Variables to save date and time
    String formattedDate;
    String dayStamp;

    //the UID, email and password of the user
    String USER_ID; 
    String USER_PASSWORD;
    String USER_EMAIL;

    unsigned long trainingPhaseTime;

    /* PUBLIC DATA MANAGING */
    int publicCrowOnPerchValue;
    FirebaseData publicCrowOnPerchGet;
    FirebaseData publicCrowOnPerchSet;
    int publicCoinsDepositedValue;
    FirebaseData publicCoinsDeposited;
    FirebaseData location;
    FirebaseData sharingPreference;

    String toShare;
    String userLocation;

    /* TROUBLESHOOT */
    unsigned long troubleshootTime;
    //Food level 
    bool isFoodThere;
    FirebaseData foodData;

    //Coins Level
    bool isCoinsThere; 
    FirebaseData coinsData;


    /* END MY WORK */
    
    bool  IsRewardBasketOpen() const    { return m_basketState == BASKET_STATE_OPEN; }
    
    unsigned char   GetCurrentTrainingPhase() const { return m_currentTrainingPhase; }    
    void            ReportCurrentTrainingPhase();
    
    //--------------------------------------
    // Coins & Rewards
    //--------------------------------------
    bool EnqueueCoin();
    void RemoveEnqueuedCoin();
    
protected:
    //--------------------------------------
    // Native Methods
    //--------------------------------------
    void BlinkLED( int numTimes );
    void AttachBasketServo();
    void DetachBasketServo();
    
    void OpenRewardBasket();
    void CloseRewardBasket();
    
    bool Poll_IsPerchPressed();
    
    void ScheduleBasketCloseWithDelay( cros_time_t delayInSeconds );
    
    //--------------------------------------
    // Training Protocol
    //--------------------------------------
    void RunPhaseOneProtocol();
    void RunPhaseTwoProtocol();
    void RunPhaseThreeProtocol();
    void RunPhaseFourProtocol();
    void AdvanceCurrentTrainingPhase();

    void CheckTrainingPhaseSwitch();

    //--------------------------------------
    // EEPROM Methods
    //--------------------------------------
    bool  ValidateEEPROMData();
    void  CreateEEPROMData();
    void  LoadCurrentTrainingPhaseFromEEPROM();
    void  WriteCurrentTrainingPhaseToEEPROM();

    //--------------------------------------
    // Firebase Methods
    //--------------------------------------
    void WriteCurrentTrainingPhaseToFirebase();
    void LoadCurrentTrainingPhaseFromFirebase();
    void LoadNumberOfCoinsDepositedFromFirebase();
    void LoadNumberOfCrowsLandedOnPerchFromFirebase();
    void WriteNumberOfCoinsDepositedToFirebase();
    void WriteNumberOfCrowsOnPerchToFirebase();
    void GetSharingPreference();
    void GetUserLocation();
    void LoadPublicCrowOnPerchData();
    void WritePublicCrowOnPerchData();
    void LoadPublicCoinsDepositedData();
    void WritePublicCoinsDepositedData();

    //time methods
    void GetCurrentDate();

    //--------------------------------------
    // Video
    //--------------------------------------
    void RecordVideo( cros_time_t duration );
    void StopRecordingVideo();

    
    //--------------------------------------
    // Troubleshoot
    //--------------------------------------
    void TroubleShoot();
    void CheckFoodLevel();
    void CheckCoinsLevel();

private:
    cros_time_t m_uptimeWhenBirdLanded;
    cros_time_t m_uptimeWhenBirdDeparted;
    cros_time_t m_uptimeScheduledBasketClose;
    //cros_time_t m_uptimeLastCoinDetected;
    unsigned long m_uptimeLastCoinDetected;
    
    //--------------------------------------
    // This semaphore is used to begin recording video
    // or to extend recording time if already doing so
    //--------------------------------------
    cros_time_t m_uptimeStopRecordingVideo;
    bool        m_isRecordingVideo;

    //--------------------------------------
    // Indicates which (1,2,3 or 4) training
    // phase the box is currently observing
    //--------------------------------------
    //unsigned char m_currentTrainingPhase;
    int m_currentTrainingPhase;

    //--------------------------------------
    // Used to track the current state of 
    // the basket. Whether it's open or 
    // closed, for instance.
    //--------------------------------------
    int m_basketState;
    
    //--------------------------------------
    // Each time a coin hits the coin deposit
    // sensor, we increment this value. We
    // decrement this each time we open the 
    // reward basket (Ph3+) so if several coins
    // are dropped at about the same time,
    // this will rack up three full cycles of
    // the door in order to square up the debt
    //--------------------------------------
    volatile int m_numEnqueuedDeposits;
    
    //--------------------------------------
    // The servo which controls the lid that
    // covers the reward basket.
    //--------------------------------------
    Servo m_basketServo;
};

extern CCrowboxCore g_crOSCore;

#endif//CROS_CORE_H

