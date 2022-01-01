// cros_core.cpp
//
// The 'kernal' of the CrOS is called "The Core"
//
// Version 0.99c - October 2018
//
// http://www.thecrowbox.com
//==========================================================
//   Except where otherwise noted, this work is licensed
//   under a Creative Commons Attribution-ShareAlike 4.0
//   International License
//==========================================================
#include <EEPROM.h>
#include "cros_core.h"

/* Integrated by Hamza Qureshi */
//==========================================================
// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);

// define the DHT object
dht11 DHT;
//==========================================================
/* End Integration */

//==========================================================
// Interrupt function called when the coin sensor is struck
// by a coin, bringing the coin pin to LOW (switched to ground).
// Contact bounce (look it up) may cause this interrupt to fire
// multiple times per coin, so the code within EnqueueCoin()`
// is designed to accept only one deposit per second so that
// each coin isn't counted multiple times due to contact bounce.
//==========================================================
void IRAM_ATTR Interrupt_CoinDeposit()
{
  g_crOSCore.EnqueueCoin();
}

//----------------------------------------------------------
// Simple function to pipe the provided string to serial
//----------------------------------------------------------
void CCrowboxCore::DebugPrint(const char *pString)
{
#if defined(CROS_USE_SERIAL_DEBUG)
  Serial.println(pString);
#endif // CROS_USE_SERIAL_DEBUG
}

//----------------------------------------------------------
// Once we get here, we never leave. The arduino stays in a
// state where the indicator LED will blink out the error
// code so that the human operator can get an idea of what
// went wrong. As much idea as the code that called this
// SystemError() method can provide, in the form of a
// cros_error_code_t (see cros_constants.h)
//
// NOTE: Ending up here will freeze the CrowBox in its
// current state and it will not respond until reset.
//----------------------------------------------------------
void CCrowboxCore::ReportSystemError(cros_error_code_t errorCode)
{
  digitalWrite(OUTPUT_PIN_LED, LOW);

  while (1)
  {
    for (int i = 0; i < errorCode; ++i)
    {
      digitalWrite(OUTPUT_PIN_LED, HIGH);
      delay(500);
      digitalWrite(OUTPUT_PIN_LED, LOW);
      delay(500);
    }

    // Delay for a little longer then blink out the sequence again
    delay(1000);
  }
}

//----------------------------------------------------------
// Here in the Core's constructor we initialize the variables
// that we want to make sure are set to known values even
// before the Setup() method is called.
//----------------------------------------------------------
CCrowboxCore::CCrowboxCore()
{
  // Initialize the basket state. For now, we have no idea
  // what state the lid was in when the machine powered
  // down last time so we set state to DONT_KNOW until some
  // other piece of code opens or closes the basket and
  // makes the state official. The basket lid will be properly
  // parked when the Core's Setup() method is called.
  m_basketState = BASKET_STATE_DONT_KNOW;

  // This pair of timers store the Uptime of the most recent
  // arrival (depression of perch) and departure (release of perch).
  m_uptimeWhenBirdLanded = TIME_NEVER;
  m_uptimeWhenBirdDeparted = TIME_NEVER;

  // Initialize this to never for now. It will come to use
  // later as birds come and go.
  m_uptimeScheduledBasketClose = TIME_NEVER;
}

//----------------------------------------------------------
//----------------------------------------------------------
void CCrowboxCore::Setup()
{

  // memory at start
  Serial.println("Memory At Setup ");
  Serial.println(xPortGetFreeHeapSize());

  /* #if defined( CROS_USE_SERIAL_DEBUG )
      Serial.begin( CROS_SERIAL_BAUD_RATE );
  #endif */
  // CROS_USE_SERIAL_DEBUG

  DebugPrint("Setup() method CALLED...\n");

  // set the User's Email and Password
  // USER_EMAIL = "imhaq7@gmail.com";
  // USER_PASSWORD = "password";

  //----------------------------------------------------------
  // This is if the OFFLINE_MODE has not been defined.
  // Here, we will be using the online data storage
  // method: Firebase.
  //----------------------------------------------------------

#ifndef OFFLINE_MODE
  Serial.println("Setup: In ONLINE MODE");

  /* Integrated by Hamza Qureshi */
  //==========================================================
  // Connect to WiFi
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
  config.api_key = API_KEY;

  // Assign the user sign in credentials
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // assign the database url to config
  config.database_url = FIREBASE_HOST;

  // Assign the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback;
  // see addons/TokenHelper.h

  // Assign the maximum retry of token generation
  config.max_token_generation_retry = 5;

  // Initialize the library with the Firebase authen and config
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  // optional - but good to allow firebase to retry any errors
  Firebase.RTDB.setMaxRetry(&crowOnPerch, 3);
  Firebase.RTDB.setMaxRetry(&coinDeposit, 3);
  Firebase.RTDB.setMaxRetry(&trainingPhase, 3);
  Firebase.RTDB.setMaxRetry(&publicCrowOnPerchGet, 3);
  Firebase.RTDB.setMaxRetry(&publicCrowOnPerchSet, 3);
  Firebase.RTDB.setMaxRetry(&publicCoinsDeposited, 3);
  Firebase.RTDB.setMaxRetry(&location, 3);
  Firebase.RTDB.setMaxRetry(&sharingPreference, 3);
  Firebase.RTDB.setMaxRetry(&trainingPhaseLoop, 3);

  // Optional, set number of error resumable queues
  Firebase.RTDB.setMaxErrorQueue(&crowOnPerch, 30);
  Firebase.RTDB.setMaxErrorQueue(&coinDeposit, 30);
  Firebase.RTDB.setMaxErrorQueue(&trainingPhase, 30);
  Firebase.RTDB.setMaxErrorQueue(&publicCrowOnPerchGet, 30);
  Firebase.RTDB.setMaxErrorQueue(&publicCrowOnPerchSet, 30);
  Firebase.RTDB.setMaxErrorQueue(&publicCoinsDeposited, 30);
  Firebase.RTDB.setMaxErrorQueue(&location, 30);
  Firebase.RTDB.setMaxErrorQueue(&sharingPreference, 30);
  Firebase.RTDB.setMaxErrorQueue(&trainingPhaseLoop, 30);

  // min size is 1024
  crowOnPerch.setResponseSize(8192);
  coinDeposit.setResponseSize(8192);
  trainingPhase.setResponseSize(8192);
  publicCrowOnPerchGet.setResponseSize(8192);
  publicCrowOnPerchSet.setResponseSize(8192);
  publicCoinsDeposited.setResponseSize(8192);
  location.setResponseSize(8192);
  sharingPreference.setResponseSize(8192);
  trainingPhaseLoop.setResponseSize(8192);

  // Getting the user UID might take a few seconds
  Serial.println("Getting User UID");
  while ((auth.token.uid) == "")
  {
    Serial.print('.');
    delay(1000);
  }
  // Print user UID
  USER_ID = auth.token.uid.c_str();
  Serial.print("User UID: ");
  Serial.println(USER_ID);

  SetupCrowBox();
  SendBoxNickname();

  // set the user's current location to
  userLocation = "null";

  // set the public crows on perch value to 0
  publicCrowOnPerchValue = 0;

  // set the humidity value to -1
  previousHumidityValue = -1;

  // Initialize a NTPClient to get time and date
  timeClient.begin();
  timeClient.setTimeOffset(3600);

  // initiate the main variables from firebase
  LoadCurrentTrainingPhaseFromFirebase();
  //==========================================================
  /* End Integration */

  switch (m_currentTrainingPhase)
  {
  case PHASE_ONE:
    DebugPrint("Loaded PHASE ONE from Firebase\n");
    break;
  case PHASE_TWO:
    DebugPrint("Loaded PHASE TWO from Firebase\n");
    break;
  case PHASE_THREE:
    DebugPrint("Loaded PHASE THREE from Firebase\n");
    break;
  case PHASE_FOUR:
    DebugPrint("Loaded PHASE FOUR from Firebase\n");
    break;
  default:
    DebugPrint("Loaded garbage training phase from Firebase!");
    ReportSystemError(kError_BadTrainingPhase);
    break;
  }

  /* Integrated by Hamza Qureshi */
  //==========================================================
  // Set up the Food Level Sensor
  pinMode(INPUT_FOOD_SENSOR, INPUT);
  // Initialise the "detected" variable for the food level
  // i.e. is there food in the basket? Starts with "false"
  isFoodThere = false;

  pinMode(INPUT_COINSLEVEL_SENSOR, INPUT);
  isCoinsThere = false;

  // Set up the Servo Current Detector
  pinMode(INPUT_SERVO_CURRENT, INPUT);

  // set the current time for training phase
  trainingPhaseTime = millis();
  // set the current time for the troubleshoot period
  troubleshootTime = millis();
//==========================================================
/* End Integration */
#endif // OFFLINE_MODE

  //----------------------------------------------------------
  // This is if the OFFLINE_MODE has been defined.
  // Here, we will not be using any online data storage
  // such as Firebase. Instead, we will be storing the data in
  // an SD card. Everything will be manually controlled.
  // For example, to change the training stage we need use the
  // physical switch. Essentially, everything will be very
  // similar to the original Crowbox OS.
  //----------------------------------------------------------

#ifdef OFFLINE_MODE
  Serial.println("Setup: In OFFLINE MODE");

  // Create the EEPROM if it does not exist
  //  Ensure that the stored EEPROM data is valid, then load
  //  the current training phase from storage there.
  if (!ValidateEEPROMData())
  {
    // Oops! The EEPROM data is not valid. This probably just
    // means that the Arduino board in use has not been used
    // to operate a crowbox before. So we'll create valid
    // EEPROM data that can be used henceforth.
    CreateEEPROMData();

    // initialise the Offline Data Variables
    offlineDay = 1;
    // store this data within the EEPROM
    WriteCurrentOfflineDayToEEPROM();

    numberOfCrowsLanded = 0;
    StoreCrowsOnPerchInEEPROM();
    numberOfCoinsDeposited = 0;
    StoreCoinsDepositedInEEPROM();

    // Now that we've created EEPROM data for CrOS, let's be
    // sure that it actually worked. If not, that's a fatal
    // error that needs to be reported!
    if (!ValidateEEPROMData())
    {
      ReportSystemError(kError_EEPROM);
    }
  }

  // Load the training Phase from EEPROM
  //  If we reach this point, we're sure the EEPROM data is good
  //  so we'll retrieve the stored data there which tells use which
  //  phase of the training protocol is currently in use.
  LoadCurrentTrainingPhaseFromEEPROM();

  // Load the current day and time for SD card storage
  //  LoadCurrentOfflineTimeFromEEPROM();
  LoadCurrentOfflineDayFromEEPROM();
  // offlineTime = 0;

  LoadCrowsOnPerchFromEEPROM();
  LoadCoinsDepositedFromEEPROM();

  // Switch the training phase top print out
  switch (m_currentTrainingPhase)
  {
  case PHASE_ONE:
    DebugPrint("Loaded PHASE ONE from EEPROM\n");
    break;
  case PHASE_TWO:
    DebugPrint("Loaded PHASE TWO from EEPROM\n");
    break;
  case PHASE_THREE:
    DebugPrint("Loaded PHASE THREE from EEPROM\n");
    break;
  case PHASE_FOUR:
    DebugPrint("Loaded PHASE FOUR from EEPROM\n");
    break;
  default:
    DebugPrint("Loaded garbage training phase from EEPROM!");
    ReportSystemError(kError_BadTrainingPhase);
    break;
  }

  /* Integrated by Hamza Qureshi */
  //==========================================================
  // Initialise the SD card
  pinMode(OUTPUT_PIN_SD_CARD, OUTPUT);

  // SD Card Initialization
  if (SD.begin())
  {
    Serial.println("SD card is ready to use.");
  }
  else
  {
    Serial.println("SD card initialization failed");
    return;
  }
  //==========================================================
  /* End Integration */

#endif // OFFLINE_MODE

  // Start with no enqueued deposits
  m_numEnqueuedDeposits = 0;

  // Set up the indicator LED pin, then turn the LED off to
  // save that microscopic amount of power.
  pinMode(OUTPUT_PIN_LED, OUTPUT);
  digitalWrite(OUTPUT_PIN_LED, LOW);

  // Set up the pin that is attached to the pushbutton
  // which is used to cycle the training phase
  pinMode(INPUT_PIN_PHASE_SELECT, INPUT_PULLUP);

  // Set up the PERCH switch
  pinMode(INPUT_PIN_PERCH, INPUT_PULLUP);

  // Set up the COIN detect switch AND its interrupt
  pinMode(INPUT_PIN_COIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(INPUT_PIN_COIN), Interrupt_CoinDeposit, FALLING);

  DebugPrint("  Servo initialization and lid parking...\n");

  // Attach the servo device to the pin which controls the servo position
  AttachBasketServo();

  // Do this little dance to put the servo into a known good state and position
  m_basketServo.write(SERVO_POS_MIDPOINT);
  delay(1500);
  m_basketServo.write(SERVO_POS_OPEN);
  m_basketState = BASKET_STATE_OPEN;
  delay(1500);

  // Direct the door to close right now.
  CloseRewardBasket();

  // Set the sentinel that protects us from contact bounce on coin deposits.
  // Do this by setting it to the current time plus a little bit of slop.
  m_uptimeLastCoinDetected = millis() + 100;

  // Ensure video is not being recorded
  StopRecordingVideo();

  // Ensure everything has settled out before proceeding.
  delay(1000);

  DebugPrint("  Up and running!\n\n");
}

//----------------------------------------------------------
//----------------------------------------------------------
void CCrowboxCore::Loop()
{
  // Take a quick sample of the uptime in milliseconds. We'll use this value
  // near the end of this function to determine how long this call to Loop()
  // will take.
  unsigned long msWhenLoopBegan = millis();

  // If the basket is scheduled to close on a timer and it is time to close
  // the basket, then close it. Placing this code here makes automated closing
  // of the basket a system-level service that takes place no matter which phase
  // of training is currently being observed.
  if (IsRewardBasketOpen() && m_uptimeScheduledBasketClose != TIME_NEVER)
  {
    // If the basket is open and a close command is scheduled
    // then check to see if it's time to shut the basket
    if (GetUptimeSeconds() >= m_uptimeScheduledBasketClose)
    {
      // Close the basket and de-schedule
      CloseRewardBasket();
      m_uptimeScheduledBasketClose = TIME_NEVER;
    }
  }

  // Now call the correct function to execute the desired behavior
  // of the currently-selected training phase. This isn't the most
  // elegant way to do this, but it is convenient to just place the
  // code that is specific to each phase in the respective discrete
  // function.
  switch (GetCurrentTrainingPhase())
  {
  case PHASE_ONE:
    RunPhaseOneProtocol();
    break;
  case PHASE_TWO:
    RunPhaseTwoProtocol();
    break;
  case PHASE_THREE:
    RunPhaseThreeProtocol();
    break;
  case PHASE_FOUR:
    RunPhaseFourProtocol();
    break;
  default:
    ReportSystemError(kError_BadTrainingPhase);
    break;
  }

/* Integrated by Hamza Qureshi */
//==========================================================
#ifndef OFFLINE_MODE
  // Ensure the date and time client updates
  while (!timeClient.update())
  {
    timeClient.forceUpdate();
  }

  // check the current training stage every 1 minute to avoid
  // too many requests to firebase database
  if ((millis() - trainingPhaseTime) >= 60000)
  {
    Serial.println("1 Minute is up, checking training phase");
    trainingPhaseTime = millis();
    CheckOnlineTrainingPhaseSwitch();
    trainingPhaseLoop.clear();
  }

  // Check the Troubleshoot setup every 30 minutes
  // CHANGE TO 30 MINS!! 1800000
  if ((millis() - troubleshootTime) >= 600000)
  {
    Serial.println("10 seconds over, checking box status in troubleshoot");
    troubleshootTime = millis();
    TroubleShoot();
  }
#endif // OFFLINE_MODE

#ifdef OFFLINE_MODE
  // Check the offline training phase switch
  CheckOfflineTrainingPhaseSwitch();
#endif // OFFLINE_MODE
       //==========================================================
       /* End Integration */

  // Now we do some time arithmetic to figure out how long this loop took to
  // execute. If it's less than IDEAL_LOOP_MS, then we make the system
  // delay() for the balance. We intentionlly slow how often the software loop
  // can run mainly to hedge against problems with contact bounce from the
  // perch switches and birds hopping around erratically. It's cheaper and
  // easier than a hardware debouncing solution.
  unsigned long msLoopDuration = millis() - msWhenLoopBegan;
  if (msLoopDuration < CROS_IDEAL_LOOP_MS)
  {
    unsigned long slackTime = CROS_IDEAL_LOOP_MS - msLoopDuration;
    delay(slackTime);
  }
}

//----------------------------------------------------------
// Uptime is computed and converted to seconds each time
// this method is called.
//
// @@@BUG - The way this is implemented, a CrowBox that runs
// continuously for around 40 days will run into problems
// when the float value rolls over. This is easily avoided
// by manually resetting the CrowBox each time the food or
// coins needs to be refilled.
//----------------------------------------------------------
cros_time_t CCrowboxCore::GetUptimeSeconds()
{
  // Serial.println("Entered GetUpTimeSeconds");
  //  Grab the current Arduino uptime in milliseconds
  unsigned long currentTimeMS = millis();

  // Convert down to seconds. Use a double to protect
  // precision and range.
  double currentTimeSeconds = (double)currentTimeMS;
  currentTimeSeconds /= 1000.0;

  // Downconvert to a float and return
  // Serial.println("Returning from GetUpTimeSeconds");
  return ((cros_time_t)currentTimeSeconds);
}

//----------------------------------------------------------
// Simple logic- if the timer that tells us the last time
// a bird landed is more recent than the timer that tells us
// the last time a bird departed, then there is a bird present
// right now.
//----------------------------------------------------------
bool CCrowboxCore::IsABirdOnThePerch()
{
  return (m_uptimeWhenBirdLanded > m_uptimeWhenBirdDeparted);
}

//----------------------------------------------------------
// NOTE: If  you call this and no bird is actually here,
// you'll get garbage. Well, you'll get TIME_NEVER.
// Make sure there's a bird present before you call.
//----------------------------------------------------------
cros_time_t CCrowboxCore::HowLongHasBirdBeenHere()
{
  if (m_uptimeWhenBirdLanded == TIME_NEVER)
  {
    return TIME_NEVER;
  }

  return GetUptimeSeconds() - m_uptimeWhenBirdLanded;
}

//----------------------------------------------------------
// If you call this while a bird is present, you'll get
// garbage. First make sure there's no bird present
//----------------------------------------------------------
cros_time_t CCrowboxCore::HowLongHasBirdBeenGone()
{
  if (m_uptimeWhenBirdDeparted == TIME_NEVER)
  {
    return TIME_NEVER;
  }

  return GetUptimeSeconds() - m_uptimeWhenBirdDeparted;
}

//----------------------------------------------------------
// When a bird deposits a coin we account for it here by
// incrementing the internal count of enqueued deposits.
// Elsewhere, the training protocol code will notice the
// deposit and take action.
//
// NOTE: This method is usually called by an interrupt
// function, so we're required to keep this code as lean and
// fast as possible. Also, we cannot touch the serial port(s)
// during this time.
//
// Returns true if the coin count was actually affected,
// false if the deposit was ignored because it occurred
// too near in time to the prior deposit. See further notes
// below on contact bounce, and the debouncing strategy.
//----------------------------------------------------------
bool CCrowboxCore::EnqueueCoin()
{
  // Serial.println("Entered Enqueue Coin");
  // Serial.println("Enqueue Coins: ");
  Serial.println(m_numEnqueuedDeposits);

  /*  if( GetUptimeSeconds() - m_uptimeLastCoinDetected < 1.0f )
   {
       // We must only accept one coin deposit per second. Because of the
       // type of switch we use to detect coin deposits (a conductive copper
       // strip), there's a high likelihood of low-frequency
       // contact bounces (10-20hz, etc) after the sensor is first struck
       // by a rolling coin.
       //
       // So, when a coin hits the sensor and this function is called, we
       // will count the coin then ignore the coin sensor for one second.
       // Without this debouncing feature, a single coin might be counted
       // dozens of times as it rolls along the copper rail of the sensor.
       Serial.println("Returning false from Enqueue Coin");

       return false;
   } */

  /* Integrated by Hamza Qureshi */
  //==========================================================
  if ((millis() - m_uptimeLastCoinDetected) < 1000)
  {
    // Serial.println("No Coin inside Enqueue Coins");
    return false;
  }
  //==========================================================
  /* End Integration */

  // Serial.println("Increasing the coin deposit");

  m_numEnqueuedDeposits++;

  // Serial.println("Done increasing coin deposit");

  m_uptimeLastCoinDetected = millis();

  // Serial.println("Returning true from Enqueue Coin");
  return true;
}

//----------------------------------------------------------
// Called when we pay off a deposit by opening the reward
// basket.
//----------------------------------------------------------
void CCrowboxCore::RemoveEnqueuedCoin()
{
  Serial.println("Removing enqueued coin");
  m_numEnqueuedDeposits--;
}

//----------------------------------------------------------
// Used mainly for debugging or conveying information when
// no serial connection is available. Don't ship any code
// that calls this function- it's strictly intended for use
// during development and debugging.
//
// NOTE: This is a BLOCKING operation.
//----------------------------------------------------------
void CCrowboxCore::BlinkLED(int numTimes)
{
  for (unsigned char i = 0; i < numTimes; ++i)
  {
    // Turn the LED on for a moment
    digitalWrite(OUTPUT_PIN_LED, HIGH);
    delay(500);

    // Now off for a moment
    digitalWrite(OUTPUT_PIN_LED, LOW);
    delay(500);
  }

  // Make sure the LED is off when we are done.
  digitalWrite(OUTPUT_PIN_LED, LOW);
}

//----------------------------------------------------------
// Helper function to attach the basket servo
//
// NOTE: This function is safe to call even if the servo is
// already attached. If the servo is attached, this function
// will do nothing.
//----------------------------------------------------------
void CCrowboxCore::AttachBasketServo()
{
  if (!m_basketServo.attached())
  {
    m_basketServo.attach(OUTPUT_PIN_SERVO);
  }
}

//----------------------------------------------------------
// Helper function to detach the basket servo. This is done
// so that the servo can be detached at the end of any
// operation to open or close the sliding lid, to address
// the issue of buzzing/clicking/chattering servos
//
// NOTE: This function is safe to call even if the servo is
// already detached. If the servo is not attached, this
// function will do nothing.
//----------------------------------------------------------
void CCrowboxCore::DetachBasketServo()
{
  if (m_basketServo.attached())
  {
    m_basketServo.detach();
  }
}

//----------------------------------------------------------
// This is a BLOCKING operation. When you call this function
// it doesn't return until the lid over the reward basket
// is fully open.
//----------------------------------------------------------
void CCrowboxCore::OpenRewardBasket()
{
  DebugPrint("  Reward Basket OPENING....\n");

  // Don't bother with executing the state change if we are
  // already in the wished state.
  if (!IsRewardBasketOpen())
  {
    // Make sure the servo is attached to the signal pin. The last operation
    // involving the servo may have detached it.
    AttachBasketServo();

    // For now we just whip the door open!
    m_basketServo.write(SERVO_POS_OPEN);

    // Give it time to finish. One second is more than enough time but
    // we need to ensure the servo finishes moving before detaching
    // the servo so we pad the time a little bit.
    delay(1000);
    DetachBasketServo();
  }

  // Now we know the basket is open.
  m_basketState = BASKET_STATE_OPEN;

  DebugPrint("Reward Basket is now OPEN!\n");
}

//----------------------------------------------------------
// This is a BLOCKING operation. When you call this function
// it doesn't return until the lid over the reward basket
// is fully closed.
//
// As a safety feature, we close the door over a series of
// small steps so that the closing door will bump into any
// part of a bird which happens to still be in the basket,
// which hopefully will startle the creature away. This
// safety feature means it will take several seconds to fully
// close the reward basket, so keep in mind that we'll be
// stuck in this function for a little while.
//----------------------------------------------------------
void CCrowboxCore::CloseRewardBasket()
{
  DebugPrint("  Reward Basket CLOSING...\n");

  if (IsRewardBasketOpen())
  {
    // Ensure the basket servo is attached
    AttachBasketServo();

    // We can't know the true position of the servo when this
    // method is called so we start by sending the servo to
    // "full open" position and then delay() long enough for
    // the servo to track to this position from wherever it was
    // before. It's probably already open, but we have to be sure
    // so we have to put it there ourselves.
    m_basketServo.write(SERVO_POS_OPEN);
    delay(1000);

    // Now we know where the servo is, truly, and can safely set the
    // internal field that tracks position.
    int servoPosition = SERVO_POS_OPEN;

    // We're going to close the basket lid over a series of small steps, a
    // little bit at a time. This gives critters an opportunity to get
    // their body out of the way before any significant pressure is applied.
    // This is a safety feature that protects the animals that may use
    // this CrowBox. DO NOT alter this behavior unless you're absolutely
    // sure of what you're doing!
    int servoStepSize = servoPosition / BASKET_CLOSE_NUM_STEPS;

    while (servoPosition > SERVO_POS_CLOSED)
    {
      // Check the Servo Current and implement
      // a fail safe here

      /* Integrated by Hamza Qureshi */
      //==========================================================
      CheckServoCurrent();
      //==========================================================
      /* End Integration */

      servoPosition -= servoStepSize;
      m_basketServo.write(servoPosition);
      delay(BASKET_CLOSE_STEP_DELAY_MS);
      DebugPrint("...basket step...");
    }
  }

  // Stuff the final closed position
  m_basketServo.write(SERVO_POS_CLOSED);
  delay(400);
  m_basketState = BASKET_STATE_CLOSED;

  // If the lid has finally closed, we can set the
  // troubleshoot system to WORKING
  // HasFoodLidClosed(servoPosition);

/* Integrated by Hamza Qureshi */
//==========================================================
#ifndef OFFLINE_MODE
  Firebase.RTDB.setString(&servofbdo, "Users/" + USER_ID + "/Crowbox/Status/servo", "WORKING");
  servofbdo.clear();
#endif // OFFLINE_MODE
       //==========================================================
       /* End Integration */

  // Any time the sliding basket lid reaches the 'fully open' or 'fully closed'
  // state, we detach the servo from the signal pin. This is an attempt to remedy
  // situations where some CrowBox users have observed their servos to continue
  // clicking or whining after the servo has finished moving. Detaching the servo
  // will eliminate the signal that the Arduino is constantly sending to the servo.
  DetachBasketServo();

  DebugPrint("Reward basket closed and locked\n");
}

//----------------------------------------------------------
// Reads the perch switch hardware directly. This means signal
// is subject to noise from bounce. CrOS is designed to
// tolerate rapid fluctuations in this switch, so it's not
// necessary to have debouncing hardware.
//----------------------------------------------------------
bool CCrowboxCore::Poll_IsPerchPressed()
{
  int result = digitalRead(INPUT_PIN_PERCH);
  return result == LOW;
}

//----------------------------------------------------------
// Call this method and provide a delay (in seconds). The
// reward basket will automatically close that many seconds
// later.
//----------------------------------------------------------
void CCrowboxCore::ScheduleBasketCloseWithDelay(cros_time_t delayInSeconds)
{
  m_uptimeScheduledBasketClose = GetUptimeSeconds() + delayInSeconds;
}

//----------------------------------------------------------
// The Rules of Phase One: "Discovery & Free Feeding"
//
//  -Reward Basket always open
//  -Morsels are freely available while supplies last
//  -Coin deposits are not processed or acknowledged
//
//----------------------------------------------------------
void CCrowboxCore::RunPhaseOneProtocol()
{
  // The PROTOCODE FOR THE PERCH & BIRD. Propagate to above the
  // call to the protocol functions!

  // Above all, we must ensure the basket remains open in Phase One
  if (!IsRewardBasketOpen())
  {
    // Open the basket but do not schedule an auto-close.
    OpenRewardBasket();

    // In fact, make sure we squash the scheduled close order
    // in case there is one. For the record, this is probably
    // an unnecessary level of assurance. No such thing, I say!
    m_uptimeScheduledBasketClose = TIME_NEVER;
  }

  // If a bird is on the perch, logically speaking- This means
  // more than knowing if the perch is depressed, it's about
  // having internal state that indicates that a bird is truly present.
  //
  // Even though the CrowBox doesn't really do anything with this
  // information when observing Phase One of the training protocol,
  // we run this code to keep the timers working properly and to
  // service the camera interface code so that it works in Phase One.
  if (IsABirdOnThePerch())
  {
    // We know a bird is here. We next check the physical state of
    // the perch and if it is NOT pressed, the bird has gone and
    // we need to handle that.
    if (!Poll_IsPerchPressed())
    {
      DebugPrint("A customer has left the perch!\n");
      // Just record the time of departure. The lid will close in
      // a little while, as a result of the call to ScheduleBasketCloseWithDelay()
      // that was issued when this bird arrived.
      m_uptimeWhenBirdDeparted = GetUptimeSeconds();
    }
  }
  else
  {
    // No bird is still here from the last time we checked [the previous
    // call to loop()], so we will look at the actual physical state of the perch.
    // If the perch is pressed, a bird has just landed.
    if (Poll_IsPerchPressed())
    {
      // EDGE CASE: A new bird has arrived!
      DebugPrint("A customer has landed on the perch!\n");
      m_uptimeWhenBirdLanded = GetUptimeSeconds();
      RecordVideo(VIDEO_RECORD_DURATION_ARRIVAL);
    }
  }
}

//----------------------------------------------------------
// The Rules of Phase Two: "Reward on Arrival"
//
//  -Reward basket usually closed
//  -Tripping the perch instantly opens the reward basket
//  -Morsels are freely available for a number of seconds
//  -Reward basket closes in a safe, responsible manner
//
//----------------------------------------------------------
void CCrowboxCore::RunPhaseTwoProtocol()
{
  // If a bird is on the perch, logically speaking- This means
  // more than knowing if the perch is depressed, it's about
  // having internal state that indicates that a bird is truly present.
  if (IsABirdOnThePerch())
  {
    // We know a bird is here. We next check the physical state of
    // the perch and if it is NOT pressed, the bird has gone and
    // we need to handle that.
    if (!Poll_IsPerchPressed())
    {
      DebugPrint("Customer has left the perch!\n");
      // Just record the time of departure. The lid will close in
      // a little while, as a result of the call to ScheduleBasketCloseWithDelay()
      // that was issued when this bird arrived.
      m_uptimeWhenBirdDeparted = GetUptimeSeconds();
    }
  }
  else
  {
    // Still No bird here from the last time we checked [the previous
    // call to loop()], so we will look at the actual physical state of the perch.
    // If the perch is pressed, a bird has just landed.
    if (Poll_IsPerchPressed())
    {
      // EDGE CASE: A new bird has arrived!
      DebugPrint("A customer has landed on the perch!\n");

      m_uptimeWhenBirdLanded = GetUptimeSeconds();

      RecordVideo(VIDEO_RECORD_DURATION_ARRIVAL);

      // Provide access to the reward basket
      OpenRewardBasket();

      // Close the basket after a delay. This accomodates birds who stand
      // on the perch and feed from the basket, but does not give them
      // unlimited time to remove unlimited food from the basket and throw
      // it somewhere else for later retrieval.
      ScheduleBasketCloseWithDelay(BASKET_REMAIN_OPEN_DURATION);

      Serial.println("Memory Remaining At Start of Phase 2: ");
      Serial.println(xPortGetFreeHeapSize());

/* Integrated by Hamza Qureshi */
//==========================================================
/* ONLINE MODE */
#ifndef OFFLINE_MODE
      Serial.println("Training Stage 2 perch pressed - ONLINE MODE!");

      // for private data
      GetCurrentDate();
      LoadNumberOfCrowsLandedOnPerchFromFirebase();
      Serial.println("Memory Remaining After Loading Num Crows Landed On Perch of Phase 2: ");
      Serial.println(xPortGetFreeHeapSize());

      WriteNumberOfCrowsOnPerchToFirebase();
      Serial.println("Memory Remaining After Writing num crows on perch in Phase 2: ");
      Serial.println(xPortGetFreeHeapSize());
      // clear memory used by this firebase object
      crowOnPerch.clear();

      // for public data
      GetSharingPreference();
      Serial.println("Memory Remaining After getting sharing preference in Phase 2: ");
      Serial.println(xPortGetFreeHeapSize());
      sharingPreference.clear();

      GetUserLocation();
      location.clear();

      LoadPublicCrowOnPerchData();
      publicCrowOnPerchGet.clear();

      WritePublicCrowOnPerchData();
      publicCrowOnPerchSet.clear();
#endif // OFFLINE_MODE

/* FOR OFFLINE MODE */
// SD Card Logic goes here to store the data
#ifdef OFFLINE_MODE
      Serial.println("Training Stage 2 perch pressed - OFFLINE MODE!");

      // Have we progressed to the next day? If so,
      // change the day to be stored.
      CheckIfItIsNextDay();
      Serial.println(offlineDay);

      StoreCrowsOnPerchInEEPROM();

      WriteDataToSDCard("crows_landed_on_perch", numberOfCrowsLanded);

#endif // OFFLINE_MODE

      Serial.println("Memory Remaining At End of Phase 2: ");
      Serial.println(xPortGetFreeHeapSize());

      //==========================================================
      /* End Integration */
    }
  }
}

//----------------------------------------------------------
// The rules of Phase Three: "Reward on deposit, coins provided"
//
//  -Reward basket usually closed
//  -'Training Coins' are loaded into the machine
//  -Reward basket opens ONLY if a coin deposit is detected
//  -Morsels are freely available for a number of seconds
//  -Reward basket closes in a safe, responsible manner
//
// In this phase the machine dispenses training coins onto
// the reward lid so that birds may discover and manipulate
// the training coins until they discover how to use coins
// to receive rewards.
//----------------------------------------------------------
void CCrowboxCore::RunPhaseThreeProtocol()
{
  // Serial.println("Entered Phase 3");
  if (m_numEnqueuedDeposits > 0 && !IsRewardBasketOpen())
  {
    Serial.println("Coin has been deteced");
    Serial.println("Enque Coins:");
    Serial.println(m_numEnqueuedDeposits);

    RemoveEnqueuedCoin(); // Un-count this deposit since we're paying it off now.

    OpenRewardBasket(); // We're giving out food access in exchange for the deposit

    // Set it up to close.
    ScheduleBasketCloseWithDelay(BASKET_REMAIN_OPEN_DURATION);

/* Integrated by Hamza Qureshi */
//==========================================================
/* ONLINE MODE */
#ifndef OFFLINE_MODE
    Serial.println("Training Stage 3 Coin deposited - ONLINE MODE!");
    GetCurrentDate();
    // now, we need to check if this date and its data exists
    // in the firebase database. We need to load it and also
    // increment it within this function
    LoadNumberOfCoinsDepositedFromFirebase();
    coinDeposit.clear();

    // then, we need to write this data back to firebase
    WriteNumberOfCoinsDepositedToFirebase();
    coinDeposit.clear();

    // for public data
    GetSharingPreference();
    Serial.println("Memory Remaining After getting sharing preference in Phase 3: ");
    Serial.println(xPortGetFreeHeapSize());
    sharingPreference.clear();

    GetUserLocation();
    location.clear();

    LoadPublicCoinsDepositedData();
    publicCoinsDeposited.clear();

    WritePublicCoinsDepositedData();
    publicCoinsDeposited.clear();
#endif // OFFLINE_MODE

/* FOR OFFLINE MODE */
// SD Card Logic goes here to store the data
#ifdef OFFLINE_MODE
    Serial.println("Training Stage 3 Coin deposited - OFFLINE MODE!");

    // Have we progressed to the next day? If so,
    // change the day to be stored.
    CheckIfItIsNextDay();
    Serial.println(offlineDay);

    // Either the value has been incremented,
    // or it has been reset to 1 (if it is a new day)
    // Nonetheless, we store this in the EEPROM for future use
    StoreCoinsDepositedInEEPROM();
    // Then, we write the data to the SD Card
    WriteDataToSDCard("coins_deposited", numberOfCoinsDeposited);

#endif // OFFLINE_MODE

    Serial.println("Memory Remaining At End of Phase 3: ");
    Serial.println(xPortGetFreeHeapSize());
  }

  //==========================================================
  /* End Integration */
}

//----------------------------------------------------------
// The rules of Phase Four: "Reward on deposit"
//
//  -Reward basket usually closed
//  -'Training Coins' NO LONGER provided by the machine
//  -Reward basket opens ONLY if a coin deposit is detected
//  -Morsels are freely available for a number of seconds
//  -Reward basket closes in a safe, responsible manner
//
// This means the birds must locate and carry a coin to the
// Crowbox, as the Crowbox no longer provides training coins.
// This is the ideal steady operating state for an urban
// Crowbox.
//----------------------------------------------------------
void CCrowboxCore::RunPhaseFourProtocol()
{
  // Right now the only difference between Phase Three and Phase Four
  // protocols involves the hardware configuration of the Crowbox.
  // The software rules of Phase Four are identical to Phase Three,
  // so we just use those.
  RunPhaseThreeProtocol();
}

//----------------------------------------------------------
// This is not ideal. Ideal would be an interrupt-based
// check for changes to this switch. However, we've already
// used the only two digital interrupt pins (2,3) on the
// Arduino UNO for our Crowbox's coin sensor and perch sensor
//
// NOTE: The training phase switch pin (pin4) is pulled UP
// so we need to check to see if it's pulled to ground. If
// yes, the physical switch is pressed.
//----------------------------------------------------------

/* Integrated by Hamza Qureshi */
//==========================================================
void CCrowboxCore::CheckOnlineTrainingPhaseSwitch()
{
  /* if( digitalRead( INPUT_PIN_PHASE_SELECT ) != LOW )
  {
    // Button not depressed- do nothing more.
    return;
  }

  DebugPrint(" Training switch pressed!\n" );

  while( digitalRead( INPUT_PIN_PHASE_SELECT ) == LOW )
  {
    // Waste time until the person releases the switch.
    delay( 10 );
  };

  AdvanceCurrentTrainingPhase();
  ReportCurrentTrainingPhase(); */

  // Write it to the PROM now.
  // WriteCurrentTrainingPhaseToEEPROM();
  // Write it to Firebase Database
  // WriteCurrentTrainingPhaseToFirebase();

  Serial.println("Memory Remaining At Start of Check Training Switch: ");
  Serial.println(xPortGetFreeHeapSize());

  int newTrainingStage = 0;

  if (Firebase.RTDB.getInt(&trainingPhaseLoop, "Users/" + USER_ID + "/Crowbox/current_training_stage"))
  {
    newTrainingStage = trainingPhaseLoop.to<int>();

    Serial.println("Got Training Stage");
    Serial.println("Memory Remaining At End of Check Training Switch: ");
    Serial.println(xPortGetFreeHeapSize());
  }
  else
  {
    Serial.println("FAILED to receive Training Phase from Firebase");
    Serial.println("REASON: " + trainingPhaseLoop.errorReason());
    Serial.println("------------------------------------");
    Serial.println();
  }

  if ((newTrainingStage >= 1) && (newTrainingStage <= 4))
  {
    if (newTrainingStage != m_currentTrainingPhase)
    {

      Serial.println("Memory Remaining At End of Check Training Switch: ");
      Serial.println(xPortGetFreeHeapSize());
      // restart esp32
      ESP.restart();
    }
  }
  else
  {
    Serial.println("Memory Remaining At End of Check Training Switch: ");
    Serial.println(xPortGetFreeHeapSize());
    Serial.println("New training stage is outside valid range");
  }
}
//==========================================================
/* End Integration */

void CCrowboxCore::CheckOfflineTrainingPhaseSwitch()
{
  if (digitalRead(INPUT_PIN_PHASE_SELECT) != LOW)
  {
    // Button not depressed- do nothing more.
    return;
  }

  DebugPrint(" Training switch pressed!\n");

  while (digitalRead(INPUT_PIN_PHASE_SELECT) == LOW)
  {
    // Waste time until the person releases the switch.
    delay(10);
  };

  AdvanceCurrentTrainingPhase();
  ReportCurrentTrainingPhase();

  // Write it to the PROM now.
  WriteCurrentTrainingPhaseToEEPROM();
}

//----------------------------------------------------------
// Push ahead to the next training phase. If we pass phase
// four, wrap to phase one.
//----------------------------------------------------------
void CCrowboxCore::AdvanceCurrentTrainingPhase()
{
  if (++m_currentTrainingPhase > PHASE_FOUR)
  {
    m_currentTrainingPhase = PHASE_ONE;
  }
}

//----------------------------------------------------------
// Check the EEPROM data aboard this Arduino board, looking
// to see if the first four characters contain the CrOS header.
// If they do, great, we know that the last information written
// to the EEPROM were written by CrOS. If not, we'll need to
// nuke the EEPROM and write the header.
//----------------------------------------------------------

/* Adapted by Hamza Qureshi */
//==========================================================
bool CCrowboxCore::ValidateEEPROMData()
{
  EEPROM.begin(512);
  const char *pHeaderCharacter = CROS_EEPROM_HEADER_STRING;

  for (int addr = 0; addr < 4; ++addr)
  {
    if (*pHeaderCharacter != EEPROM.read(addr))
    {
      // We found a character in the EEPROM data which does
      // not match the CrOS header.
      DebugPrint("EEPROM data header is invalid\n");
      return false;
    }

    // On to the next character
    pHeaderCharacter++;
  }

  // Data header is in order
  DebugPrint("EEPROM Header Validated\n");
  return true;
}
//==========================================================
/* End Adaptation */

//----------------------------------------------------------
// When an Arduino board is brand new, or when it has been
// used in another project which writes EEPROM data, we need
// to write our data header and a temporary training phase
// (phase one) to the EEPROM to 'make it ours'
//----------------------------------------------------------

/* Adapted by Hamza Qureshi */
//==========================================================
void CCrowboxCore::CreateEEPROMData()
{
  DebugPrint("Creating EEPROM data...\n");
  const char *pHeaderCharacter = CROS_EEPROM_HEADER_STRING;

  /* MY ADDITION */
  EEPROM.begin(512);

  for (int addr = 0; addr < 4; ++addr)
  {
    // EEPROM[ addr ] = *pHeaderCharacter;

    EEPROM.write(addr, *pHeaderCharacter);
    // On to the next character
    pHeaderCharacter++;
  }

  EEPROM.write(CROS_EEPROM_ADDRESS_TRAINING_PHASE, PHASE_ONE);
  EEPROM.commit();
  /* END MY ADDITION */

  DebugPrint("...Done!\n");
}
//==========================================================
/* End Adaptation */

//----------------------------------------------------------
// Get the training phase we wrote to EEPROM the last time
// it changed.
//----------------------------------------------------------

/* Adapted by Hamza Qureshi */
//==========================================================
void CCrowboxCore::LoadCurrentTrainingPhaseFromEEPROM()
{
  EEPROM.begin(512);

  m_currentTrainingPhase = EEPROM.read(CROS_EEPROM_ADDRESS_TRAINING_PHASE);

  Serial.println("Current training phase is:" + m_currentTrainingPhase);
}
//==========================================================
/* End Adaptation */

//----------------------------------------------------------
// Save the current training phase in the EEPROM so that it
// can be restored next time the Crowbox is rebooted.
//
// We use the EEPROM.update() method here because this will
// only actually write to the eeprom if the write value is
// different than what's already there, which saves us from
// wasting write cycles on the eeprom.
//----------------------------------------------------------

/* Adapted by Hamza Qureshi */
//==========================================================
void CCrowboxCore::WriteCurrentTrainingPhaseToEEPROM()
{
  EEPROM.begin(512);
  EEPROM.put(CROS_EEPROM_ADDRESS_TRAINING_PHASE, m_currentTrainingPhase);

  EEPROM.commit();
  DebugPrint(" EEPROM Updated!\n");
}
//==========================================================
/* End Adaptation */

/* Integrated by Hamza Qureshi */
/* With help from: https://roboticsbackend.com/arduino-store-int-into-eeprom/ */
//==========================================================
void CCrowboxCore::StoreCrowsOnPerchInEEPROM()
{
  EEPROM.begin(512);

  EEPROM.put(CROS_EEPROM_CROWS_ON_PERCH, numberOfCrowsLanded >> 8);
  EEPROM.put(CROS_EEPROM_CROWS_ON_PERCH + 1, numberOfCrowsLanded & 0xFF);
  EEPROM.commit();

  Serial.println("Successfully Written Crows On perch data to EEPROM");
}

void CCrowboxCore::LoadCrowsOnPerchFromEEPROM()
{
  EEPROM.begin(512);
  numberOfCrowsLanded =
      (EEPROM.read(CROS_EEPROM_CROWS_ON_PERCH) << 8) + EEPROM.read(CROS_EEPROM_CROWS_ON_PERCH + 1);

  Serial.println("Successfully Loaded Crows Deposited from EEPROM");
  Serial.println(numberOfCrowsLanded);
}

void CCrowboxCore::StoreCoinsDepositedInEEPROM()
{
  EEPROM.begin(512);

  EEPROM.put(CROS_EEPROM_COINS_DEPOSITED, numberOfCoinsDeposited >> 8);
  EEPROM.put(CROS_EEPROM_COINS_DEPOSITED + 1, numberOfCoinsDeposited & 0xFF);
  EEPROM.commit();

  Serial.println("Successfully Written Coins Deposited data to EEPROM");
}

void CCrowboxCore::LoadCoinsDepositedFromEEPROM()
{
  EEPROM.begin(512);
  numberOfCoinsDeposited =
      (EEPROM.read(CROS_EEPROM_COINS_DEPOSITED) << 8) + EEPROM.read(CROS_EEPROM_COINS_DEPOSITED + 1);

  Serial.println("Successfully Loaded coins deposited from EEPROM");
  Serial.println(numberOfCoinsDeposited);
}

void CCrowboxCore::LoadCurrentOfflineDayFromEEPROM()
{
  EEPROM.begin(512);

  offlineDay =
      ((unsigned long)EEPROM.read(CROS_EEPROM_ADDRESS_CURRENT_DAY) << 24) + ((unsigned long)EEPROM.read(CROS_EEPROM_ADDRESS_CURRENT_DAY + 1) << 16) + ((unsigned long)EEPROM.read(CROS_EEPROM_ADDRESS_CURRENT_DAY + 2) << 8) + ((unsigned long)EEPROM.read(CROS_EEPROM_ADDRESS_CURRENT_DAY + 3));

  Serial.println("Successfully loaded Offline Day from EEPROM");
  Serial.println(offlineDay);
}

void CCrowboxCore::WriteCurrentOfflineDayToEEPROM()
{
  // initiate the EEPROM
  EEPROM.begin(512);

  // Break the time down into 4 bytes
  EEPROM.put(CROS_EEPROM_ADDRESS_CURRENT_DAY, (offlineDay >> 24) & 0xFF);
  EEPROM.put(CROS_EEPROM_ADDRESS_CURRENT_DAY + 1, (offlineDay >> 16) & 0xFF);
  EEPROM.put(CROS_EEPROM_ADDRESS_CURRENT_DAY + 2, (offlineDay >> 8) & 0xFF);
  EEPROM.put(CROS_EEPROM_ADDRESS_CURRENT_DAY + 3, offlineDay & 0xFF);

  EEPROM.commit();
  Serial.println("Successfully Written Offline Day to EEPROM");
}
//==========================================================
/* End Integration */

/* Integrated by Hamza Qureshi */
//==========================================================
void CCrowboxCore::CheckIfItIsNextDay()
{
  if (millis() - offlineTime > OFFLINE_TIME)
  {
    offlineDay++;
    offlineTime = millis();

    // reset this value since it is a new day
    numberOfCrowsLanded = 1;
    numberOfCoinsDeposited = 1;
    WriteCurrentOfflineDayToEEPROM();
  }
  else
  {
    numberOfCrowsLanded++;
    numberOfCoinsDeposited++;
  }
}

void CCrowboxCore::WriteDataToSDCard(String type, int value)
{
  sdCardDataFile = SD.open("/data.txt", FILE_APPEND);
  String line = type;
  line += ',';
  line += String(offlineDay);
  line += ',';
  line += String(value);

  if (sdCardDataFile)
  {
    Serial.println("Sending Data to File");
    sdCardDataFile.println(line);
    sdCardDataFile.close();
    Serial.println("Done Sending Data");
  }
  else
  {
    Serial.println("Error in opening data file when writing");
  }
  //==========================================================
  /* End Integration */

  // Print out what is in the SD card to see
  // This is just a test, delete after
  sdCardDataFile = SD.open("/data.txt");
  if (sdCardDataFile)
  {
    Serial.println("Reading Data From File");

    while (sdCardDataFile.available())
    {
      Serial.write(sdCardDataFile.read());
    }

    sdCardDataFile.close();
    Serial.println("Done Reading Data");
  }
  else
  {
    Serial.println("Error in opening data file when reading");
  }
}

/* Integrated by Hamza Qureshi */
//==========================================================
void CCrowboxCore::WriteCurrentTrainingPhaseToFirebase()
{
  Serial.println("Writing Training Phase to Firebase");
  Firebase.RTDB.setInt(&trainingPhase, "Users/" + USER_ID + "/Crowbox/current_training_stage", m_currentTrainingPhase);
}

void CCrowboxCore::LoadCurrentTrainingPhaseFromFirebase()
{
  if (Firebase.RTDB.getInt(&trainingPhase, "Users/" + USER_ID + "/Crowbox/current_training_stage"))
  {

    m_currentTrainingPhase = trainingPhase.to<int>();
    Serial.println("Successfully got training stage");
    Serial.println(m_currentTrainingPhase);
  }
  else
  {
    Serial.println("FAILED to receive Training Phase from Firebase");
    Serial.println("REASON: " + trainingPhase.errorReason());
    Serial.println("------------------------------------");
    Serial.println();
  }
}

void CCrowboxCore::WriteNumberOfCoinsDepositedToFirebase()
{
  Serial.println("Writing Number of Coins Deposited to Firebase");
  /* Firebase.setInt(coinDeposit,"Users/"+username+"/Crowbox/coins_deposited", numberOfCoinsDeposited); */
  Firebase.RTDB.setInt(&coinDeposit, "Users/" + USER_ID + "/Crowbox/coins_deposited/" + dayStamp + "/value", numberOfCoinsDeposited);
}

void CCrowboxCore::LoadNumberOfCoinsDepositedFromFirebase()
{
  Serial.println("Loading Number of Coins Deposited From Firebase");

  if (Firebase.RTDB.getInt(&coinDeposit, "Users/" + USER_ID + "/Crowbox/coins_deposited/" + dayStamp + "/value"))
  {

    // get the number of coins
    numberOfCoinsDeposited = coinDeposit.to<int>();
    Serial.println("Successfully got Number of Coins");

    // check if it is a number? not sure if this will work
    if (numberOfCoinsDeposited == NULL)
    {
      // set it to 1
      Serial.println("Number of Coins Deposited is Null");
      numberOfCoinsDeposited = 1;
    }
    else
    {
      Serial.println("Number of Coins deposited is not null, incrementing");
      numberOfCoinsDeposited++;
      Serial.println(numberOfCoinsDeposited);
    }
  }
  else
  {
    Serial.println("Error retreiving data from Firebase");
  }
}

void CCrowboxCore::WriteNumberOfCrowsOnPerchToFirebase()
{
  Serial.println("Writing Number of Crows landed on perch to Firebase");

  Firebase.RTDB.setInt(&crowOnPerch, "Users/" + USER_ID + "/Crowbox/crows_landed_on_perch/" + dayStamp + "/value", numberOfCrowsLanded);
}

void CCrowboxCore::LoadNumberOfCrowsLandedOnPerchFromFirebase()
{

  if (Firebase.RTDB.getInt(&crowOnPerch, "Users/" + USER_ID + "/Crowbox/crows_landed_on_perch/" + dayStamp + "/value"))
  {
    numberOfCrowsLanded = crowOnPerch.to<int>();
    Serial.println("Successfully got Number of Crows landed on perch");

    // check if it is a number or null?
    if (numberOfCrowsLanded == NULL)
    {
      // if it is null, then set it to 1
      Serial.println("Number of crows landed on perch is null");
      numberOfCrowsLanded = 1;
    }
    else
    {
      Serial.println("Number of crows landed on perch is not null, incrementing");
      numberOfCrowsLanded++;
      Serial.println(numberOfCrowsLanded);
    }
  }
  else
  {
    Serial.println("Error retreiving data from Firebase");
  }
}

void CCrowboxCore::GetSharingPreference()
{
  // get the sharing preferences to set the string
  if (Firebase.RTDB.getString(&sharingPreference, "Users/" + USER_ID + "/sharing_preference"))
  {
    toShare = sharingPreference.to<String>();
    Serial.println("Successfully got Sharing Preference");
    Serial.println(toShare);
  }
  else
  {
    Serial.println("Error in retrieving sharing preferences");
    Serial.println("REASON: " + sharingPreference.errorReason());
    Serial.println("------------------------------------");
    Serial.println();
  }
}

void CCrowboxCore::GetUserLocation()
{

  /* if sharing is turned on  */
  if (toShare == "PUBLIC")
  {
    /* then get the location of the user */
    if (Firebase.RTDB.getString(&location, "Users/" + USER_ID + "/location"))
    {
      userLocation = location.to<String>();
      Serial.println("Successfully got Location");
      Serial.println(userLocation);
    }
    else
    {
      Serial.println("Error in retrieving location");
      Serial.println("REASON: " + location.errorReason());
      Serial.println("------------------------------------");
      Serial.println();
    }
  }
  else
  {
    Serial.println("Error - Sharing Preferences is OFF");
    Serial.println(toShare);
    userLocation = "null";
  }
}

void CCrowboxCore::LoadPublicCrowOnPerchData()
{
  /* if the user has indeed entered their current location */
  if (userLocation != "null")
  {
    Serial.println("User location is not null");
    Serial.println(userLocation);

    /* Then fetch its data from firebase rtdb */
    if (Firebase.RTDB.getInt(&publicCrowOnPerchGet, "Public/Countries/" + userLocation + "/crows_landed_on_perch"))
    {
      publicCrowOnPerchValue = publicCrowOnPerchGet.to<int>();
      // increment this value
      publicCrowOnPerchValue++;
      Serial.println(publicCrowOnPerchValue);
    }
    else
    {
      Serial.println("Error in getting public crow on perch data from firebase");
      Serial.println("REASON: " + publicCrowOnPerchGet.errorReason());
      Serial.println("------------------------------------");
      Serial.println();
    }
  }
  else
  {
    Serial.println("User location is null");
    publicCrowOnPerchValue = 0;
  }
}

void CCrowboxCore::WritePublicCrowOnPerchData()
{
  Serial.println("Writing public crows on perch to firebase");
  // write the public value to firebase
  if (publicCrowOnPerchValue != 0)
  {
    Firebase.RTDB.setInt(&publicCrowOnPerchSet, "Public/Countries/" + userLocation + "/crows_landed_on_perch", publicCrowOnPerchValue);
  }
}

void CCrowboxCore::LoadPublicCoinsDepositedData()
{
  /* if the user has indeed entered their current location */
  if (userLocation != "null")
  {
    Serial.println("User location is not null");
    Serial.println(userLocation);

    /* Then fetch its data from firebase rtdb */
    if (Firebase.RTDB.getInt(&publicCoinsDeposited, "Public/Countries/" + userLocation + "/coins_deposited"))
    {
      publicCoinsDepositedValue = publicCoinsDeposited.to<int>();
      // increment this value
      publicCoinsDepositedValue++;
      Serial.println(publicCoinsDepositedValue);
    }
    else
    {
      Serial.println("Error in loading public coins deposited data to firebase");
      Serial.println("REASON: " + publicCoinsDeposited.errorReason());
      Serial.println("------------------------------------");
      Serial.println();
    }
  }
  else
  {
    Serial.println("User location is null");
    publicCoinsDepositedValue = 0;
  }
}

void CCrowboxCore::WritePublicCoinsDepositedData()
{

  Serial.println("Writing public coins deposited to firebase");
  // write public value to firebase
  if (publicCoinsDepositedValue != 0)
  {
    if (Firebase.RTDB.setInt(&publicCoinsDeposited, "Public/Countries/" + userLocation + "/coins_deposited", publicCoinsDepositedValue))
    {
      Serial.println("Sucessfully wrote public coins deposited to firebase");
    }
    else
    {
      Serial.println("Error in writing public coins deposited data to firebase");
      Serial.println("REASON: " + publicCoinsDeposited.errorReason());
      Serial.println("------------------------------------");
      Serial.println();
    }
  }
  else
  {
    Serial.println("Public coins deposited is 0?");
    Serial.println(publicCoinsDepositedValue);
  }
}

void CCrowboxCore::GetCurrentDate()
{
  // get the current date
  formattedDate = timeClient.getFormattedDate();
  Serial.println(formattedDate);

  int splitT = formattedDate.indexOf("T");
  dayStamp = formattedDate.substring(0, splitT);
  Serial.println("DATE: ");
  Serial.println(dayStamp);
}

void CCrowboxCore::GetCurrentTime()
{
  Serial.println("Getting current time for WiFi");
  formattedDate = timeClient.getFormattedDate();

  int splitT = formattedDate.indexOf("T");
  ntpTime = formattedDate.substring(splitT + 1, formattedDate.length() - 1);
  Serial.println(ntpTime);
}
//==========================================================
/* End Integration */

//----------------------------------------------------------
// The report the training phase, the LED blinks one time to
// indicate "Phase One", two times for "Phase Two", and so on.
//
// NOTE: This is a blocking operation so it's best if the
// pattern doesn't take very long to emit before the rest of
// the system code can continue running.
//----------------------------------------------------------
void CCrowboxCore::ReportCurrentTrainingPhase()
{
  for (unsigned char i = 0; i < m_currentTrainingPhase; ++i)
  {
    // Turn the LED on for a moment
    digitalWrite(OUTPUT_PIN_LED, HIGH);
    delay(250);

    // Now off for a moment
    digitalWrite(OUTPUT_PIN_LED, LOW);
    delay(250);
  }

  // Make sure the LED is off when we are done.
  digitalWrite(OUTPUT_PIN_LED, LOW);
}

//----------------------------------------------------------
// -The Crowbox is going to ask a camera to record video.
//
// -We send in the desired duration of the video recording.
//
// -If the camera is NOT recording, it will begin.
//
// -If the camera IS recording, we'll just push out the
//  duration so that the recording continues.
//----------------------------------------------------------
void CCrowboxCore::RecordVideo(cros_time_t duration)
{
  // Does nothing presently, but here is where you would
  // interface with your camera, through a relay or perhaps
  // a serial communication message.
}

//----------------------------------------------------------
//----------------------------------------------------------
void CCrowboxCore::StopRecordingVideo()
{
  // Does nothing presently, but here is where you would
  // interface with your camera, through a relay or perhaps
  // a serial communication message.
}

/* Integrated by Hamza Qureshi */
//==========================================================

/* SENSOR TROUBLESHOOT HANDLING */
// This function is a wrapper function for
// all other troubleshoot related functions
void CCrowboxCore::TroubleShoot()
{
  CheckFoodLevel();
  CheckCoinsLevel();
  CheckHumidityLevel();
  SendWifiTime();
}

void CCrowboxCore::CheckFoodLevel()
{
  int foodLevel = !digitalRead(INPUT_FOOD_SENSOR);

  if (foodLevel)
  {
    if (!isFoodThere)
    {
      // We have a new input i.e. new food has been added
      isFoodThere = true;
      Serial.println("Food has been added - Back to working order");
      // Update the value in firebase to "WORKING"
      Firebase.RTDB.setString(&foodData, "Users/" + USER_ID + "/Crowbox/Status/food", "WORKING");
    }
    else
    {
      // Food is still present, nothing has changed since
      // the last time we checked and everything is working
      Serial.println("Food is present in the basket");
      // We do not need to update anything in firebase here
    }
  }
  else
  {
    // There is no/low food in the basket
    // Needs to be refilled
    if (isFoodThere)
    {
      isFoodThere = false;
    }
    Serial.println("Food basket needs to be refilled");
    Firebase.RTDB.setString(&foodData, "Users/" + USER_ID + "/Crowbox/Status/food", "LOW");
  }

  // clear the data to make space!
  foodData.clear();
}

void CCrowboxCore::CheckCoinsLevel()
{
  int coinsLevel = !digitalRead(INPUT_COINSLEVEL_SENSOR);

  if (coinsLevel)
  {
    if (!isCoinsThere)
    {
      // We have a new input i.e. new food has been added
      isCoinsThere = true;
      Serial.println("Coins have been added - Back to working order");
      // Update the value in firebase to "WORKING"
      Firebase.RTDB.setString(&coinsData, "Users/" + USER_ID + "/Crowbox/Status/coins", "WORKING");
    }
    else
    {
      // Food is still present, nothing has changed since
      // the last time we checked and everything is working
      Serial.println("Coins are present in the dispenser");
      // We do not need to update anything in firebase here
    }
  }
  else
  {
    // There is no/low food in the basket
    // Needs to be refilled
    if (isCoinsThere)
    {
      isCoinsThere = false;
    }

    Serial.println("Coins Dispenser needs to be refilled");
    Firebase.RTDB.setString(&coinsData, "Users/" + USER_ID + "/Crowbox/Status/coins", "LOW");
  }

  // clear the data to make space!
  coinsData.clear();
}

void CCrowboxCore::CheckHumidityLevel()
{
  // initialise the DHT value and pin
  DHT.read(INPUT_PIN_HUMIDITY);

  newHumidityValue = DHT.humidity;
  Serial.println("Printing Humidity Value");
  Serial.println(newHumidityValue);

  // Initially, before any values are read
  if (previousHumidityValue < 0)
  {
    Serial.println("Setting initial humidity to WORKING");
    Firebase.RTDB.setString(&humidity, "Users/" + USER_ID + "/Crowbox/Status/humidity", "WORKING");
  }

  // is the value we just received greater than the threshold?
  if (newHumidityValue >= HUMIDITY_THRESHOLD)
  {
    // is the previous value less than the threshold? If it is, then
    // and only then should we update firebase.
    // This is to avoid sending too many requests, one is enough.
    if (previousHumidityValue < HUMIDITY_THRESHOLD)
    {
      Serial.println("Setting WET for humidity");
      Firebase.RTDB.setString(&humidity, "Users/" + USER_ID + "/Crowbox/Status/humidity", "WET");
    }
  }
  else
  {
    // If not, then perhaps we need to reset it back to working.
    // First check if the previous value was greater than the threshold
    // If it is greater, then that means we are going from WET to WORKING
    if (previousHumidityValue >= HUMIDITY_THRESHOLD)
    {
      Serial.println("Setting WORKING for humidity");
      Firebase.RTDB.setString(&humidity, "Users/" + USER_ID + "/Crowbox/Status/humidity", "WORKING");
    }
  }

  // Update the previous value
  previousHumidityValue = newHumidityValue;
  humidity.clear();
}

void CCrowboxCore::SendWifiTime()
{

  GetCurrentTime();

  Serial.println("Sending Wifi Current Time");
  Firebase.RTDB.setString(&wifiConnection, "Users/" + USER_ID + "/Crowbox/Status/currentWifiTime", ntpTime);

  wifiConnection.clear();
}

void CCrowboxCore::CheckServoCurrent()
{
  // Retrieve the current value from the resistor
  servoCurrentValue = analogRead(INPUT_SERVO_CURRENT);
  // If the current value exceeds a certain threshold,
  // e.g. 1000, then open the servo and shut down
  // all functions - also report to the firebase RTDB

  Serial.println("Servo Current Value:");
  Serial.println(servoCurrentValue);

  if (servoCurrentValue >= SERVO_CURRENT_THRESHOLD)
  {

// Report to Firebase RTDB if ONLINE Mode is activated
#ifndef OFFLINE_MODE
    Firebase.RTDB.setString(&servofbdo, "Users/" + USER_ID + "/Crowbox/Status/servo", "JAMMED");
    servofbdo.clear();
#endif // OFFLINE_MODE

    Serial.println("Servo Current over Threshold");

    // Open the Food Lid to allow anything stuck to escape
    OpenRewardBasket();
    exit(0);
  }
}

// This function simply lets the Website know
// that a CrowBox has been setup and connected to
// the user's account
void CCrowboxCore::SetupCrowBox()
{
  Serial.println("Setting up CrowBox");
  Firebase.RTDB.setString(&accountSetup, "Users/" + USER_ID + "/box", "YES");
  accountSetup.clear();
}

void CCrowboxCore::HasFoodLidClosed(int servoPosition)
{
#ifndef OFFLINE_MODE
  if (servoPosition == SERVO_POS_CLOSED)
  {
    Firebase.RTDB.setString(&servofbdo, "Users/" + USER_ID + "/Crowbox/Status/servo", "WORKING");
    servofbdo.clear();
  }
#endif // OFFLINE_MODE
}

void CCrowboxCore::SendBoxNickname()
{
#ifndef OFFLINE_MODE

  Firebase.RTDB.setString(&nicknamefbdo, "Users/" + USER_ID + "/Crowbox/nickname", NICKNAME);
  nicknamefbdo.clear();

#endif // OFFLINE_MODE
}

//==========================================================
/* End Integration */
