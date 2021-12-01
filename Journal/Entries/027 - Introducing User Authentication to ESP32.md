## Introducing User Authentication to ESP32

Introducing User Authentication was an interesting procedure. Earlier, I used the API Key and Database URL alongside a Database Secret provided by Firebase to gain access and allow the ESP32 to submit information. This, however, is not very secure as anyone with the key and secret can access the RTDB. Thus, I had to integrate a User Authentication System. To do this, I had to include a couple of new libraries: 

The main one is `#include "addons/TokenHelper.h"` which is supposed to generate a token for the user that signs in.

Then, two new objects were declared to handle the authentication: 
```c++
FirebaseAuth auth;
FirebaseConfig config;
```

These two objects would focus on setting things up and then initialising the process i.e. signing the user in. The only thing requried from the user is their `USER_EMAIL` and `USER_PASSWORD`, both of which are of type `String`. The user must have already created an account via the website prior to signing in through the ESP32. 
To sign in, here is the code: 

```c++
config.api_key = API_KEY;
auth.user.email = USER_EMAIL;
auth.user.password = USER_PASSWORD;
config.database_url = FIREBASE_HOST; //the Database URL 
config.token_status_callback = tokenStatusCallback; 
config.max_token_generation_retry = 5;

Firebase.begin(&config, &auth);
Firebase.reconnectWiFi(true);
```

The above code would sign the user in. In order to get the User's Unique ID: 

```c++
while ((auth.token.uid) == "") {
      Serial.print('.');
      delay(1000);
}

USER_ID = auth.token.uid.c_str();
```
