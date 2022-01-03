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


/* Integrated by Hamza Qureshi */
//==========================================================
#include <ESP32Servo.h>
#include <WiFi.h>
// new Updated firebase client
#include <Firebase_ESP_Client.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <dht11.h>

/* Users are required to fill these FIVE fields */
#define WIFI_SSID "Vodafone-72DA74"
#define WIFI_PASSWORD "t6vaHAN6bpy5z4qb"
#define USER_EMAIL "john@doe.com"
#define USER_PASSWORD "password"
#define NICKNAME "Backyard Box"

// the project name address from firebase id
// the database url
#define FIREBASE_HOST "crowbox-37e57-default-rtdb.firebaseio.com"
#define API_KEY "AIzaSyBxA1xYz2zbcuOw9f_Xi3OzCVLc_2OzMf8"

// for the SD Card
#include <SD.h>
#include <SPI.h>

//==========================================================
/* End Integration */

#include <Arduino.h>
#include "cros_types.h"
#include "cros_constants.h"
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
    void DebugPrint(const char *pString);
    void ReportSystemError(cros_error_code_t errorCode);

    //--------------------------------------
    // Public Accessor methods
    //--------------------------------------
    cros_time_t GetUptimeSeconds();
    bool IsABirdOnThePerch();
    cros_time_t HowLongHasBirdBeenHere();
    cros_time_t HowLongHasBirdBeenGone();

    /* Integrated by Hamza Qureshi */
    //==========================================================

    // for auth
    FirebaseAuth auth;
    // for configuration
    FirebaseConfig config;

    int numberOfCrowsLanded;
    FirebaseData crowOnPerch;
    int numberOfCoinsDeposited;
    FirebaseData coinDeposit;
    FirebaseData trainingPhase;
    FirebaseData trainingPhaseLoop;

    // For setting up the account
    FirebaseData accountSetup;
    FirebaseData nicknamefbdo;
    // String nickname;

    // Variables to save date
    String formattedDate;
    String dayStamp;

    // the UID, email and password of the user
    String USER_ID;

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
    // Food level
    bool isFoodThere;
    FirebaseData foodData;

    // Wifi Connection
    String ntpTime;
    FirebaseData wifiConnection;

    // Coins Level
    bool isCoinsThere;
    FirebaseData coinsData;

    // Humidity Level
    int newHumidityValue;
    int previousHumidityValue;
    FirebaseData humidity;

    // Servo Current
    int servoCurrentValue;
    FirebaseData servofbdo;

    /* FOR OFFLINE MODE */
    File sdCardDataFile;
    unsigned long offlineDay;
    unsigned long offlineTime;

    //==========================================================
    /* End Integration */

    bool IsRewardBasketOpen() const { return m_basketState == BASKET_STATE_OPEN; }

    unsigned char GetCurrentTrainingPhase() const { return m_currentTrainingPhase; }
    void ReportCurrentTrainingPhase();

    //--------------------------------------
    // Coins & Rewards
    //--------------------------------------
    bool EnqueueCoin();
    void RemoveEnqueuedCoin();

protected:
    //--------------------------------------
    // Native Methods
    //--------------------------------------
    void BlinkLED(int numTimes);
    void AttachBasketServo();
    void DetachBasketServo();

    void OpenRewardBasket();
    void CloseRewardBasket();

    bool Poll_IsPerchPressed();

    void ScheduleBasketCloseWithDelay(cros_time_t delayInSeconds);

    //--------------------------------------
    // Training Protocol
    //--------------------------------------
    void RunPhaseOneProtocol();
    void RunPhaseTwoProtocol();
    void RunPhaseThreeProtocol();
    void RunPhaseFourProtocol();
    void AdvanceCurrentTrainingPhase();

    /* Integrated by Hamza Qureshi */
    //==========================================================
    void CheckOnlineTrainingPhaseSwitch();
    //==========================================================
    /* End Integration */

    /* Adapted by Hamza Qureshi */
    //==========================================================
    void CheckOfflineTrainingPhaseSwitch();
    //==========================================================
    /* End Adaptation  */

    //--------------------------------------
    // EEPROM Methods
    //--------------------------------------

    
    /* Adapted by Hamza Qureshi */
    //==========================================================
    bool ValidateEEPROMData();
    void CreateEEPROMData();
    void LoadCurrentTrainingPhaseFromEEPROM();
    void WriteCurrentTrainingPhaseToEEPROM();
    //==========================================================
    /* End Adaptation  */

   /* Integrated by Hamza Qureshi */
    //==========================================================
    void StoreCrowsOnPerchInEEPROM();
    void StoreCoinsDepositedInEEPROM();
    void LoadCrowsOnPerchFromEEPROM();
    void LoadCoinsDepositedFromEEPROM();
    void LoadCurrentOfflineDayFromEEPROM();
    void WriteCurrentOfflineDayToEEPROM();
    void CheckIfItIsNextDay();
    void WriteDataToSDCard(String type, int value);

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
    void SetupCrowBox();
    void HasFoodLidClosed(int servoPosition);
    void SendBoxNickname();
    
    //--------------------------------------
    // Time methods
    //--------------------------------------
    void GetCurrentDate();
    void GetCurrentTime();

    //--------------------------------------
    // Troubleshoot
    //--------------------------------------
    void TroubleShoot();
    void CheckFoodLevel();
    void CheckCoinsLevel();
    void CheckHumidityLevel();
    void SendWifiTime();
    void CheckServoCurrent();

    //==========================================================
    /* End Integration */

    //--------------------------------------
    // Video
    //--------------------------------------
    void RecordVideo(cros_time_t duration);
    void StopRecordingVideo();


private:
    cros_time_t m_uptimeWhenBirdLanded;
    cros_time_t m_uptimeWhenBirdDeparted;
    cros_time_t m_uptimeScheduledBasketClose;
    // cros_time_t m_uptimeLastCoinDetected;
    unsigned long m_uptimeLastCoinDetected;

    //--------------------------------------
    // This semaphore is used to begin recording video
    // or to extend recording time if already doing so
    //--------------------------------------
    cros_time_t m_uptimeStopRecordingVideo;
    bool m_isRecordingVideo;

    //--------------------------------------
    // Indicates which (1,2,3 or 4) training
    // phase the box is currently observing
    //--------------------------------------
    // unsigned char m_currentTrainingPhase;
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

#endif // CROS_CORE_H
