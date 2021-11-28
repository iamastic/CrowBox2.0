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

// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);

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
    //Serial.println("Entered interrupt");
    //detach the interrupt temporarily
    //detachInterrupt(digitalPinToInterrupt(17));
    //Serial.println("detached interrupt for coin sensor");

    g_crOSCore.EnqueueCoin();
}

//this function does absolutely nothing
void IRAM_ATTR FlushOutInterrupts() {
  Serial.println("Doing nothing");
}


//----------------------------------------------------------
// Simple function to pipe the provided string to serial
//----------------------------------------------------------
void CCrowboxCore::DebugPrint( const char *pString )
{
#if defined( CROS_USE_SERIAL_DEBUG )
  Serial.println( pString );
#endif// CROS_USE_SERIAL_DEBUG
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
void CCrowboxCore::ReportSystemError( cros_error_code_t errorCode )
{
  digitalWrite( OUTPUT_PIN_LED, LOW );

  while( 1 )
  {
    for( int i = 0 ; i < errorCode ; ++i )
    {
      digitalWrite( OUTPUT_PIN_LED, HIGH );
      delay( 500 );
      digitalWrite( OUTPUT_PIN_LED, LOW );
      delay( 500 );
    }

    // Delay for a little longer then blink out the sequence again
    delay( 1000 );
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

  //memory at start
      Serial.println("Memory At Setup ");
      Serial.println(xPortGetFreeHeapSize());

/* #if defined( CROS_USE_SERIAL_DEBUG )
    Serial.begin( CROS_SERIAL_BAUD_RATE ); 
#endif *///CROS_USE_SERIAL_DEBUG

    DebugPrint( "Setup() method CALLED...\n" );
  

    //set the User's Email and Password
    USER_EMAIL = "imhaq7@gmail.com";
    USER_PASSWORD = "password";

    // Assign the api key (required)
    config.api_key = API_KEY;


    // Assign the user sign in credentials
    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;

    //assign the database url to config 
    config.database_url = FIREBASE_HOST;


    // Assign the callback function for the long running token generation task
    config.token_status_callback = tokenStatusCallback; 
    //see addons/TokenHelper.h

    // Assign the maximum retry of token generation
    config.max_token_generation_retry = 5;

    // Initialize the library with the Firebase authen and config
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    //optional - but good to allow firebase to retry any errors
    Firebase.RTDB.setMaxRetry(&crowOnPerch, 3);
    Firebase.RTDB.setMaxRetry(&coinDeposit, 3);
    Firebase.RTDB.setMaxRetry(&trainingPhase, 3);
    Firebase.RTDB.setMaxRetry(&publicCrowOnPerchGet, 3);
    Firebase.RTDB.setMaxRetry(&publicCrowOnPerchSet, 3);
    Firebase.RTDB.setMaxRetry(&publicCoinsDeposited, 3);
    Firebase.RTDB.setMaxRetry(&location, 3);
    Firebase.RTDB.setMaxRetry(&sharingPreference, 3);
    Firebase.RTDB.setMaxRetry(&trainingPhaseLoop, 3);

    //Optional, set number of error resumable queues
    Firebase.RTDB.setMaxErrorQueue(&crowOnPerch, 30);
    Firebase.RTDB.setMaxErrorQueue(&coinDeposit, 30);
    Firebase.RTDB.setMaxErrorQueue(&trainingPhase, 30);
    Firebase.RTDB.setMaxErrorQueue(&publicCrowOnPerchGet, 30);
    Firebase.RTDB.setMaxErrorQueue(&publicCrowOnPerchSet, 30);
    Firebase.RTDB.setMaxErrorQueue(&publicCoinsDeposited, 30);
    Firebase.RTDB.setMaxErrorQueue(&location, 30);
    Firebase.RTDB.setMaxErrorQueue(&sharingPreference, 30);
    Firebase.RTDB.setMaxErrorQueue(&trainingPhaseLoop, 30);


    //min size is 1024
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
    while ((auth.token.uid) == "") {
      Serial.print('.');
      delay(1000);
    }
    // Print user UID
    USER_ID = auth.token.uid.c_str();
    Serial.print("User UID: ");
    Serial.println(USER_ID);

    // Start with no enqueued deposits
    m_numEnqueuedDeposits = 0;

    //set the user's current location to
    userLocation = "null";

    //set the public crows on perch value to 0
    publicCrowOnPerchValue = 0;
       
    // Set up the indicator LED pin, then turn the LED off to
    // save that microscopic amount of power. 
    pinMode( OUTPUT_PIN_LED, OUTPUT );
    digitalWrite( OUTPUT_PIN_LED, LOW );


    // Initialize a NTPClient to get time and date
    timeClient.begin();
    timeClient.setTimeOffset(3600);
    
    //initiate the main variables from firebase
    LoadCurrentTrainingPhaseFromFirebase();

    switch( m_currentTrainingPhase )
    {
      case PHASE_ONE:   DebugPrint("Loaded PHASE ONE from Firebase\n" );    break;
      case PHASE_TWO:   DebugPrint("Loaded PHASE TWO from Firebase\n" );    break;
      case PHASE_THREE: DebugPrint("Loaded PHASE THREE from Firebase\n" );  break;
      case PHASE_FOUR:  DebugPrint("Loaded PHASE FOUR from Firebase\n" );   break;
      default:
        DebugPrint("Loaded garbage training phase from Firebase!");
        ReportSystemError( kError_BadTrainingPhase );
        break;
    }

    // Set up the pin that is attached to the pushbutton
    // which is used to cycle the training phase
    pinMode( INPUT_PIN_PHASE_SELECT, INPUT_PULLUP );
    
    // Set up the PERCH switch
    pinMode( INPUT_PIN_PERCH, INPUT_PULLUP );
    
    // Set up the COIN detect switch AND its interrupt
    pinMode( INPUT_PIN_COIN, INPUT_PULLUP );
    attachInterrupt( digitalPinToInterrupt(INPUT_PIN_COIN), Interrupt_CoinDeposit, FALLING );

    // Set up the Food Level Sensor 
    pinMode(INPUT_FOOD_SENSOR, INPUT);
    // Initialise the "detected" variable for the food level
    // i.e. is there food in the basket? Starts with "false"
    isFoodThere = false;

    pinMode(INPUT_COINSLEVEL_SENSOR, INPUT);
    isCoinsThere = false;

    DebugPrint( "  Servo initialization and lid parking...\n" );
    
    // Attach the servo device to the pin which controls the servo position
    AttachBasketServo();
    
    // Do this little dance to put the servo into a known good state and position
    m_basketServo.write( SERVO_POS_MIDPOINT );
    delay( 1500 );
    m_basketServo.write( SERVO_POS_OPEN );
    m_basketState = BASKET_STATE_OPEN;  
    delay( 1500 );
    
    // Direct the door to close right now. 
    CloseRewardBasket();

    // Set the sentinel that protects us from contact bounce on coin deposits.
    // Do this by setting it to the current time plus a little bit of slop.
    m_uptimeLastCoinDetected = millis() + 100;

    // Ensure video is not being recorded
    StopRecordingVideo();

    //set the current time for training phase
    trainingPhaseTime = millis();

    //set the current time for the troubleshoot period
    troubleshootTime = millis();
    
    // Ensure everything has settled out before proceeding. 
    delay( 1000 );

    DebugPrint( "  Up and running!\n\n" );
}

//----------------------------------------------------------
//----------------------------------------------------------
void CCrowboxCore::Loop() 
{
    //Let's print the heap memory 
  /*   Serial.println("Memory Remaining: ");
    Serial.println(xPortGetFreeHeapSize()); */

    // Take a quick sample of the uptime in milliseconds. We'll use this value
    // near the end of this function to determine how long this call to Loop()
    // will take.

    //Ensure the date and time client updates
    while(!timeClient.update()) {
      timeClient.forceUpdate();
    }
    unsigned long msWhenLoopBegan = millis();

    // If the basket is scheduled to close on a timer and it is time to close 
    // the basket, then close it. Placing this code here makes automated closing 
    // of the basket a system-level service that takes place no matter which phase
    // of training is currently being observed.
    if( IsRewardBasketOpen() && m_uptimeScheduledBasketClose != TIME_NEVER ) 
    {
        // If the basket is open and a close command is scheduled
        // then check to see if it's time to shut the basket
        if( GetUptimeSeconds() >= m_uptimeScheduledBasketClose )
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
    switch( GetCurrentTrainingPhase() )
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
        ReportSystemError( kError_BadTrainingPhase );
      break;
    }  

    // FOR FUTURE EXPANSION:
    // Run the logic for video recording. Note that the way this logic 
    // is arranged, calling RecordVideo() while the system is already 
    // recording video will magically extend the duration  
    if( m_isRecordingVideo )
    {
        // Should we turn off?
        if( GetUptimeSeconds() >= m_uptimeStopRecordingVideo )
        {
            StopRecordingVideo();
        }
    }
    
    //check the current training stage every 1 minute to avoid 
    //too many requests to firebase database
    if((millis() - trainingPhaseTime) >= 60000) {
      Serial.println("1 Minute is up, checking training phase");
      trainingPhaseTime = millis();
      CheckTrainingPhaseSwitch();
      trainingPhaseLoop.clear();
    }


    //Check the Troubleshoot setup every 30 minutes 
    //CHANGE TO 30 MINS!!
    if((millis() - troubleshootTime) >= 10000) {
      Serial.println("10 seconds over, checking box status in troubleshoot");
      troubleshootTime = millis();
      TroubleShoot();
    }


    // Now we do some time arithmetic to figure out how long this loop took to
    // execute. If it's less than IDEAL_LOOP_MS, then we make the system 
    // delay() for the balance. We intentionlly slow how often the software loop
    // can run mainly to hedge against problems with contact bounce from the 
    // perch switches and birds hopping around erratically. It's cheaper and 
    // easier than a hardware debouncing solution. 
    unsigned long msLoopDuration = millis() - msWhenLoopBegan;
    if( msLoopDuration < CROS_IDEAL_LOOP_MS )
    {
        unsigned long slackTime = CROS_IDEAL_LOOP_MS - msLoopDuration;
        delay( slackTime );
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
  //Serial.println("Entered GetUpTimeSeconds");
  // Grab the current Arduino uptime in milliseconds
  unsigned long currentTimeMS = millis();
  
  // Convert down to seconds. Use a double to protect
  // precision and range.
  double currentTimeSeconds = (double)currentTimeMS;
  currentTimeSeconds /= 1000.0;
  
  // Downconvert to a float and return
  //Serial.println("Returning from GetUpTimeSeconds");
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
  return (m_uptimeWhenBirdLanded > m_uptimeWhenBirdDeparted );
}

//----------------------------------------------------------
// NOTE: If  you call this and no bird is actually here,
// you'll get garbage. Well, you'll get TIME_NEVER.
// Make sure there's a bird present before you call.
//----------------------------------------------------------
cros_time_t CCrowboxCore::HowLongHasBirdBeenHere()
{
  if( m_uptimeWhenBirdLanded == TIME_NEVER )
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
  if( m_uptimeWhenBirdDeparted == TIME_NEVER )
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
    //Serial.println("Entered Enqueue Coin");

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

    if ((millis() - m_uptimeLastCoinDetected) < 1000) {
      return false;
    }
    //Serial.println("Increasing the coin deposit");

    m_numEnqueuedDeposits++;    
    
    //Serial.println("Done increasing coin deposit");

    m_uptimeLastCoinDetected = millis();

    //Serial.println("Returning true from Enqueue Coin");
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
void CCrowboxCore::BlinkLED( int numTimes )
{
    for(  unsigned char i = 0 ; i < numTimes ; ++i )
    {
      // Turn the LED on for a moment
      digitalWrite( OUTPUT_PIN_LED, HIGH );
      delay( 500 );

      // Now off for a moment
      digitalWrite( OUTPUT_PIN_LED, LOW );
      delay( 500 );
    }

    // Make sure the LED is off when we are done.
    digitalWrite( OUTPUT_PIN_LED, LOW );
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
  if( !m_basketServo.attached() )
  {
    m_basketServo.attach( OUTPUT_PIN_SERVO );
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
  if( m_basketServo.attached() )
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
    DebugPrint( "  Reward Basket OPENING....\n");

    // Don't bother with executing the state change if we are
    // already in the wished state.
    if( !IsRewardBasketOpen() )
    {
        // Make sure the servo is attached to the signal pin. The last operation
        // involving the servo may have detached it.
        AttachBasketServo();
        
        // For now we just whip the door open!
        m_basketServo.write( SERVO_POS_OPEN );
        
        // Give it time to finish. One second is more than enough time but
        // we need to ensure the servo finishes moving before detaching
        // the servo so we pad the time a little bit.
        delay( 1000 ); 
        DetachBasketServo(); 
    }
    
    // Now we know the basket is open.
    m_basketState = BASKET_STATE_OPEN;
    
    DebugPrint( "Reward Basket is now OPEN!\n" );
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
  DebugPrint( "  Reward Basket CLOSING...\n");
  
  if( IsRewardBasketOpen() )
  {
    // Ensure the basket servo is attached
    AttachBasketServo();
    
    // We can't know the true position of the servo when this
    // method is called so we start by sending the servo to 
    // "full open" position and then delay() long enough for
    // the servo to track to this position from wherever it was
    // before. It's probably already open, but we have to be sure
    // so we have to put it there ourselves.
    m_basketServo.write( SERVO_POS_OPEN );
    delay( 1000 );
  
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
  
    while( servoPosition > SERVO_POS_CLOSED )
    {
      servoPosition -= servoStepSize;
      m_basketServo.write( servoPosition );
      delay( BASKET_CLOSE_STEP_DELAY_MS );
      DebugPrint("...basket step...");
    }   
  }

  // Stuff the final closed position
  m_basketServo.write( SERVO_POS_CLOSED );
  delay( 400 );
  m_basketState = BASKET_STATE_CLOSED;
  
  // Any time the sliding basket lid reaches the 'fully open' or 'fully closed'
  // state, we detach the servo from the signal pin. This is an attempt to remedy 
  // situations where some CrowBox users have observed their servos to continue 
  // clicking or whining after the servo has finished moving. Detaching the servo
  // will eliminate the signal that the Arduino is constantly sending to the servo.
  DetachBasketServo();
  
  DebugPrint( "Reward basket closed and locked\n" );
}

//----------------------------------------------------------
// Reads the perch switch hardware directly. This means signal
// is subject to noise from bounce. CrOS is designed to 
// tolerate rapid fluctuations in this switch, so it's not
// necessary to have debouncing hardware.
//----------------------------------------------------------
bool CCrowboxCore::Poll_IsPerchPressed()
{
  int result = digitalRead( INPUT_PIN_PERCH );
  return result == LOW;
}

//----------------------------------------------------------
// Call this method and provide a delay (in seconds). The 
// reward basket will automatically close that many seconds
// later.
//----------------------------------------------------------
void CCrowboxCore::ScheduleBasketCloseWithDelay( cros_time_t delayInSeconds )
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
  if( !IsRewardBasketOpen() )
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
  if( IsABirdOnThePerch() )
  {
    // We know a bird is here. We next check the physical state of
    // the perch and if it is NOT pressed, the bird has gone and 
    // we need to handle that.
    if( !Poll_IsPerchPressed() )
    {
      DebugPrint( "A customer has left the perch!\n" );
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
    if( Poll_IsPerchPressed() )
    {
      // EDGE CASE: A new bird has arrived!
      DebugPrint( "A customer has landed on the perch!\n" );
      m_uptimeWhenBirdLanded = GetUptimeSeconds();
      RecordVideo( VIDEO_RECORD_DURATION_ARRIVAL );    
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
  if( IsABirdOnThePerch() )
  {
    // We know a bird is here. We next check the physical state of
    // the perch and if it is NOT pressed, the bird has gone and 
    // we need to handle that.
    if( !Poll_IsPerchPressed() )
    {
      DebugPrint( "Customer has left the perch!\n" );      
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
    if( Poll_IsPerchPressed() )
    {
      // EDGE CASE: A new bird has arrived!
      DebugPrint( "A customer has landed on the perch!\n" );
      numberOfCrowsLanded++;
      /* Firebase.setInt(crowOnPerch, "crowbox/crow_on_perch", 
      numberOfCrowsLanded); */

      m_uptimeWhenBirdLanded = GetUptimeSeconds();

      RecordVideo( VIDEO_RECORD_DURATION_ARRIVAL );    

      // Provide access to the reward basket
      OpenRewardBasket();        

      // Close the basket after a delay. This accomodates birds who stand
      // on the perch and feed from the basket, but does not give them
      // unlimited time to remove unlimited food from the basket and throw
      // it somewhere else for later retrieval.
      ScheduleBasketCloseWithDelay( BASKET_REMAIN_OPEN_DURATION );
       
        Serial.println("Memory Remaining At Start of Phase 2: ");
        Serial.println(xPortGetFreeHeapSize());

      //for private data
      GetCurrentDate();
      LoadNumberOfCrowsLandedOnPerchFromFirebase();
      Serial.println("Memory Remaining After Loading Num Crows Landed On Perch of Phase 2: ");
      Serial.println(xPortGetFreeHeapSize());

      //will this clear up some memory?
      //RTDB.clear();
      

      WriteNumberOfCrowsOnPerchToFirebase(); 
      Serial.println("Memory Remaining After Writing num crows on perch in Phase 2: ");
      Serial.println(xPortGetFreeHeapSize());

      //clear memory used by this firebase object
      crowOnPerch.clear();

      //for public data
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
  
      
      Serial.println("Memory Remaining At End of Phase 2: ");
      Serial.println(xPortGetFreeHeapSize());
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
  //Serial.println("Entered Phase 3");
  if( m_numEnqueuedDeposits > 0 && !IsRewardBasketOpen() )
  {
    Serial.println("Coin has been deteced");

    RemoveEnqueuedCoin();// Un-count this deposit since we're paying it off now.

    OpenRewardBasket();// We're giving out food access in exchange for the deposit

    // Set it up to close.
    ScheduleBasketCloseWithDelay( BASKET_REMAIN_OPEN_DURATION );

    GetCurrentDate();
    //now, we need to check if this date and its data exists
    //in the firebase database. We need to load it and also 
    //increment it within this function
    LoadNumberOfCoinsDepositedFromFirebase();
    coinDeposit.clear();

    //then, we need to write this data back to firebase
    WriteNumberOfCoinsDepositedToFirebase();
    coinDeposit.clear();

    //for public data
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

          
    Serial.println("Memory Remaining At End of Phase 3: ");
    Serial.println(xPortGetFreeHeapSize());

  }
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
void CCrowboxCore::CheckTrainingPhaseSwitch()
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
  //WriteCurrentTrainingPhaseToEEPROM();
  //Write it to Firebase Database
  //WriteCurrentTrainingPhaseToFirebase();

    
      Serial.println("Memory Remaining At Start of Check Training Switch: ");
      Serial.println(xPortGetFreeHeapSize());

  int newTrainingStage = 0;

  if (Firebase.RTDB.getInt(&trainingPhaseLoop, "Users/"+USER_ID+"/Crowbox/current_training_stage")) {  
    newTrainingStage = trainingPhaseLoop.to<int>();
   
    Serial.println("Got Training Stage");
        Serial.println("Memory Remaining At End of Check Training Switch: ");
      Serial.println(xPortGetFreeHeapSize());
    
  } else {
      Serial.println("FAILED to receive Training Phase from Firebase");
      Serial.println("REASON: " + trainingPhaseLoop.errorReason());
      Serial.println("------------------------------------");
      Serial.println();
  }

  if ((newTrainingStage >=1) && (newTrainingStage <=4)) {
    if (newTrainingStage != m_currentTrainingPhase) {
      
      Serial.println("Memory Remaining At End of Check Training Switch: ");
      Serial.println(xPortGetFreeHeapSize());
      //restart esp32
      ESP.restart();
    }
  } else {
      Serial.println("Memory Remaining At End of Check Training Switch: ");
      Serial.println(xPortGetFreeHeapSize());
      Serial.println("New training stage is outside valid range");
  }
}

//----------------------------------------------------------
// Push ahead to the next training phase. If we pass phase
// four, wrap to phase one.
//----------------------------------------------------------
void CCrowboxCore::AdvanceCurrentTrainingPhase()
{
  if( ++m_currentTrainingPhase > PHASE_FOUR )
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
bool CCrowboxCore::ValidateEEPROMData()
{
  EEPROM.begin(512);
  const char *pHeaderCharacter = CROS_EEPROM_HEADER_STRING;

  /* MY ADDITION */
  for( int addr = 0 ; addr < 4 ; ++addr )
  {
    if( *pHeaderCharacter != EEPROM.read(addr) )
    {
      // We found a character in the EEPROM data which does
      // not match the CrOS header. 
      DebugPrint( "EEPROM data header is invalid\n" );
      return false;
    }

    // On to the next character
    pHeaderCharacter++;
  }
  /* END MY ADDITION */

  /* for( int addr = 0 ; addr < 4 ; ++addr )
  {
    if( *pHeaderCharacter != EEPROM[ addr ] )
    {
      // We found a character in the EEPROM data which does
      // not match the CrOS header. 
      DebugPrint( "EEPROM data header is invalid\n" );
      return false;
    }

    // On to the next character
    pHeaderCharacter++;
  } */
  
  // Data header is in order
  DebugPrint( "EEPROM Header Validated\n" );
  return true;
}

//----------------------------------------------------------
// When an Arduino board is brand new, or when it has been
// used in another project which writes EEPROM data, we need
// to write our data header and a temporary training phase 
// (phase one) to the EEPROM to 'make it ours'
//----------------------------------------------------------
void CCrowboxCore::CreateEEPROMData()
{
  DebugPrint( "Creating EEPROM data...\n" );
  const char *pHeaderCharacter = CROS_EEPROM_HEADER_STRING;

  /* MY ADDITION */
  EEPROM.begin(512);
  
  for( int addr = 0 ; addr < 4 ; ++addr )
  {
    //EEPROM[ addr ] = *pHeaderCharacter;

    EEPROM.write(addr, *pHeaderCharacter);
    // On to the next character
    pHeaderCharacter++;
  }
  
  EEPROM.write(CROS_EEPROM_ADDRESS_TRAINING_PHASE, PHASE_ONE);
  EEPROM.commit();
  /* END MY ADDITION */

  DebugPrint( "...Done!\n" );

//----------------------------------------------------------

  /* const char *pHeaderCharacter = CROS_EEPROM_HEADER_STRING;

  for( int addr = 0 ; addr < 4 ; ++addr )
  {
    EEPROM[ addr ] = *pHeaderCharacter;

    // On to the next character
    pHeaderCharacter++;
  } */

  // Immediately after the header we write out a byte with a 
  // value of 1 so that the default for a brand-new Crowbox
  // would be to start in training phase one.
 /*  EEPROM[ CROS_EEPROM_ADDRESS_TRAINING_PHASE ] = PHASE_ONE;

  DebugPrint( "...Done!\n" ); */
}

//----------------------------------------------------------
// Get the training phase we wrote to EEPROM the last time
// it changed.
//----------------------------------------------------------
void CCrowboxCore::LoadCurrentTrainingPhaseFromEEPROM()
{
  /* MY ADDITION */
  EEPROM.begin(512);
  /* END MY ADDITION */

  m_currentTrainingPhase = EEPROM.read( CROS_EEPROM_ADDRESS_TRAINING_PHASE );

    /* MY ADDITION */
  Serial.println("Current training phase is:" + m_currentTrainingPhase);
  /* END MY ADDITION */
}

//----------------------------------------------------------
// Save the current training phase in the EEPROM so that it 
// can be restored next time the Crowbox is rebooted.
//
// We use the EEPROM.update() method here because this will
// only actually write to the eeprom if the write value is
// different than what's already there, which saves us from
// wasting write cycles on the eeprom.
//----------------------------------------------------------
void CCrowboxCore::WriteCurrentTrainingPhaseToEEPROM()
{
  EEPROM.begin(512);
  EEPROM.put( CROS_EEPROM_ADDRESS_TRAINING_PHASE, m_currentTrainingPhase );

  EEPROM.commit();
  DebugPrint(" EEPROM Updated!\n" );
}


void CCrowboxCore::WriteCurrentTrainingPhaseToFirebase()
{
  Serial.println("Writing Training Phase to Firebase");
  Firebase.RTDB.setInt(&trainingPhase,"Users/"+USER_ID+"/Crowbox/current_training_stage", m_currentTrainingPhase);
}


void CCrowboxCore::LoadCurrentTrainingPhaseFromFirebase()
{
  if (Firebase.RTDB.getInt(&trainingPhase, "Users/"+USER_ID+"/Crowbox/current_training_stage")) {  
    
    m_currentTrainingPhase = trainingPhase.to<int>();
    Serial.println("Successfully got training stage");
    Serial.println(m_currentTrainingPhase);
    
  } else {
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
  Firebase.RTDB.setInt(&coinDeposit,"Users/"+USER_ID+"/Crowbox/coins_deposited/"+dayStamp+"/value", numberOfCoinsDeposited);
}
 
void CCrowboxCore::LoadNumberOfCoinsDepositedFromFirebase(){
  Serial.println("Loading Number of Coins Deposited From Firebase");

  if (Firebase.RTDB.getInt(&coinDeposit, "Users/"+USER_ID+"/Crowbox/coins_deposited/"+dayStamp+"/value")){
    
    //get the number of coins
    numberOfCoinsDeposited = coinDeposit.to<int>();
    Serial.println("Successfully got Number of Coins");

    //check if it is a number? not sure if this will work
    if (numberOfCoinsDeposited == NULL) {
      //set it to 1 
      Serial.println("Number of Coins Deposited is Null");
      numberOfCoinsDeposited = 1;
    } else {
      Serial.println("Number of Coins deposited is not null, incrementing");
      numberOfCoinsDeposited++;
      Serial.println(numberOfCoinsDeposited);
    }
  } else {
    Serial.println("Error retreiving data from Firebase");
  }
}

void CCrowboxCore::WriteNumberOfCrowsOnPerchToFirebase()
{
  Serial.println("Writing Number of Crows landed on perch to Firebase");

 Firebase.RTDB.setInt(&crowOnPerch, "Users/"+USER_ID+"/Crowbox/crows_landed_on_perch/"+dayStamp+"/value", numberOfCrowsLanded);
}

void CCrowboxCore::LoadNumberOfCrowsLandedOnPerchFromFirebase(){

  if(Firebase.RTDB.getInt(&crowOnPerch, "Users/"+USER_ID+"/Crowbox/crows_landed_on_perch/"+dayStamp+"/value")) {
    numberOfCrowsLanded = crowOnPerch.to<int>();
    Serial.println("Successfully got Number of Crows landed on perch");

    //check if it is a number or null? 
    if(numberOfCrowsLanded == NULL) {
      //if it is null, then set it to 1
      Serial.println("Number of crows landed on perch is null");
      numberOfCrowsLanded = 1;
    } else {
      Serial.println("Number of crows landed on perch is not null, incrementing");
      numberOfCrowsLanded++;
      Serial.println(numberOfCrowsLanded);
    }
  } else {
      Serial.println("Error retreiving data from Firebase");
  }
}

void CCrowboxCore::GetSharingPreference() {
  //get the sharing preferences to set the string
  if(Firebase.RTDB.getString(&sharingPreference,"Users/"+USER_ID+"/sharing_preference")) {
    toShare = sharingPreference.to<String>();
    Serial.println("Successfully got Sharing Preference");
    Serial.println(toShare);
  } else {
      Serial.println("Error in retrieving sharing preferences");
      Serial.println("REASON: " + sharingPreference.errorReason());
      Serial.println("------------------------------------");
      Serial.println();
  }
}

void CCrowboxCore::GetUserLocation() {

  /* if sharing is turned on  */
  if(toShare == "PUBLIC") {
    /* then get the location of the user */
    if(Firebase.RTDB.getString(&location, "Users/"+USER_ID+"/location")) {
      userLocation = location.to<String>();
      Serial.println("Successfully got Location");
      Serial.println(userLocation);
    } else {
        Serial.println("Error in retrieving location");
        Serial.println("REASON: " + location.errorReason());
        Serial.println("------------------------------------");
        Serial.println();
    }
  } else {
    Serial.println("Error - Sharing Preferences is OFF");
    Serial.println(toShare);
    userLocation = "null";
  }
}

void CCrowboxCore::LoadPublicCrowOnPerchData() {
  /* if the user has indeed entered their current location */
  if(userLocation != "null") {
    Serial.println("User location is not null");
    Serial.println(userLocation);
    
    /* Then fetch its data from firebase rtdb */  
    if(Firebase.RTDB.getInt(&publicCrowOnPerchGet,"Public/Countries/"+userLocation+"/crows_landed_on_perch")) {
      publicCrowOnPerchValue = publicCrowOnPerchGet.to<int>();
      //increment this value
      publicCrowOnPerchValue++;
      Serial.println(publicCrowOnPerchValue);
    } else {
      Serial.println("Error in getting public crow on perch data from firebase");
      Serial.println("REASON: " + publicCrowOnPerchGet.errorReason());
      Serial.println("------------------------------------");
      Serial.println();
    }
  } else {
    Serial.println("User location is null");
    publicCrowOnPerchValue = 0;
  }
}

void CCrowboxCore::WritePublicCrowOnPerchData() {
  Serial.println("Writing public crows on perch to firebase");
  //write the public value to firebase
  if (publicCrowOnPerchValue != 0) {
    Firebase.RTDB.setInt(&publicCrowOnPerchSet,"Public/Countries/"+userLocation+"/crows_landed_on_perch", publicCrowOnPerchValue);
  }
}

void CCrowboxCore::LoadPublicCoinsDepositedData() {
    /* if the user has indeed entered their current location */
    if(userLocation != "null") {
      Serial.println("User location is not null");
      Serial.println(userLocation);

      /* Then fetch its data from firebase rtdb */  
      if(Firebase.RTDB.getInt(&publicCoinsDeposited,"Public/Countries/"+userLocation+"/coins_deposited")) {
        publicCoinsDepositedValue = publicCoinsDeposited.to<int>();
        //increment this value
        publicCoinsDepositedValue++;
        Serial.println(publicCoinsDepositedValue);

      } else {
          Serial.println("Error in loading public coins deposited data to firebase");
          Serial.println("REASON: " + publicCoinsDeposited.errorReason());
          Serial.println("------------------------------------");
          Serial.println();
      }
    } else {
        Serial.println("User location is null");
        publicCoinsDepositedValue = 0;
      }
}

void CCrowboxCore::WritePublicCoinsDepositedData(){
  
  Serial.println("Writing public coins deposited to firebase");
  //write public value to firebase
  if(publicCoinsDepositedValue != 0) {
    if (Firebase.RTDB.setInt(&publicCoinsDeposited,"Public/Countries/"+userLocation+"/coins_deposited", publicCoinsDepositedValue)) {
      Serial.println("Sucessfully wrote public coins deposited to firebase");
    } else {
        Serial.println("Error in writing public coins deposited data to firebase");
        Serial.println("REASON: " + publicCoinsDeposited.errorReason());
        Serial.println("------------------------------------");
        Serial.println();
    }
  } else {
    Serial.println("Public coins deposited is 0?");
    Serial.println(publicCoinsDepositedValue);
  }
}

void CCrowboxCore::GetCurrentDate(){
  //get the current date 
  formattedDate = timeClient.getFormattedDate();
  Serial.println(formattedDate);

  int splitT = formattedDate.indexOf("T");
  dayStamp = formattedDate.substring(0, splitT);
  Serial.println("DATE: ");
  Serial.println(dayStamp);
}



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
    for(  unsigned char i = 0 ; i < m_currentTrainingPhase ; ++i )
    {
      // Turn the LED on for a moment
      digitalWrite( OUTPUT_PIN_LED, HIGH );
      delay( 250 );

      // Now off for a moment
      digitalWrite( OUTPUT_PIN_LED, LOW );
      delay( 250 );
    }

    // Make sure the LED is off when we are done.
    digitalWrite( OUTPUT_PIN_LED, LOW );
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
void CCrowboxCore::RecordVideo( cros_time_t duration )
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

/* SENSOR TROUBLESHOOT HANDLING */

//This function is a wrapper function for 
//all other troubleshoot related functions
void CCrowboxCore::TroubleShoot() {
  CheckFoodLevel();
  CheckCoinsLevel();
}

void CCrowboxCore::CheckFoodLevel() {
  int foodLevel = !digitalRead(INPUT_FOOD_SENSOR);

  if(foodLevel) {
    if (!isFoodThere) {
      //We have a new input i.e. new food has been added
      isFoodThere = true;
      Serial.println("Food has been added - Back to working order");
      //Update the value in firebase to "WORKING"
      Firebase.RTDB.setString(&foodData, "Users/"+USER_ID+"/Crowbox/Status/food", "WORKING");
    } else {
      //Food is still present, nothing has changed since 
      //the last time we checked and everything is working
      Serial.println("Food is present in the basket");
      //We do not need to update anything in firebase here
    }
  } else {
      //There is no/low food in the basket
      //Needs to be refilled
      if (isFoodThere) {isFoodThere = false;} 
      
      Serial.println("Food basket needs to be refilled");
      Firebase.RTDB.setString(&foodData, "Users/"+USER_ID+"/Crowbox/Status/food", "LOW");
  }

  //clear the data to make space!
  foodData.clear();

}

void CCrowboxCore::CheckCoinsLevel() {
int coinsLevel = !digitalRead(INPUT_COINSLEVEL_SENSOR);

  if(coinsLevel) {
    if (!isCoinsThere) {
      //We have a new input i.e. new food has been added
      isCoinsThere = true;
      Serial.println("Coins have been added - Back to working order");
      //Update the value in firebase to "WORKING"
      Firebase.RTDB.setString(&coinsData, "Users/"+USER_ID+"/Crowbox/Status/coins", "WORKING");
    } else {
      //Food is still present, nothing has changed since 
      //the last time we checked and everything is working
      Serial.println("Coins are present in the dispenser");
      //We do not need to update anything in firebase here
    }
  } else {
      //There is no/low food in the basket
      //Needs to be refilled
      if (isCoinsThere) {isCoinsThere = false;} 
      
      Serial.println("Food basket needs to be refilled");
      Firebase.RTDB.setString(&coinsData, "Users/"+USER_ID+"/Crowbox/Status/coins", "LOW");
  }

  //clear the data to make space!
  coinsData.clear();

}