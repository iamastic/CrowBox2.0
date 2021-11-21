## Adding the NTP Library
### 01/11/21


In order to offer real time data transmission from the Crowbox to the Website, I had to be able to record the time or date. Since `millis()` calculates the time since the box has been up and running, this is not a suitable function to use in this scenario. I needed to obtain the current date or time. I decided to go with just obtaining the date, rather the time, as given the small scale of the database, I did not want it to get flooded with too many new nodes each and every time a coin is deposited. Instead, I decided to display the number of coins deposited (or crows landing on the perch) per day. In order to do this, I needed to use the `NTPClient`. 

I used the [NTPClient Library](https://github.com/taranais/NTPClient) to retrieve the date. 

In order to use the library, I included the relevant headers as outlined in the github repository:
```c++
#include <NTPClient.h>
#include <WiFiUdp.h>
```

I then instantiated an object of `WiFiUdp`:
```c++
WiFiUDP ntpUDP;
```

And set up the client to communicate with the server:
```c++
NTPClient timeClient(ntpUDP);
```

To use the `timeClient`, I initiated it within the `setup()` function of the Crowbox OS: `timeClient.begin()`. 
Then, I created a function to retrieve the current data:

```c++
void CCrowboxCore::GetCurrentDate(){
  //get the current date 
  formattedDate = timeClient.getFormattedDate();
  int splitT = formattedDate.indexOf("T");
  dayStamp = formattedDate.substring(0, splitT);
}
```

Where `dayStamp` is a variable of type `String` and stores the current date whenever this function is called. The date is in the format of `yyyy/mm/dd`. The date is then used as the **Key** for the data that I push to the Firebase RTDB. For example, during training stage 2, if a crow lands on the perch, a value of 1 will be added to the total crows that have landed on the perch specific to the current date: 

```c++=
Firebase.RTDB.setInt(&crowOnPerch, "Users/"+USER_ID+"/Crowbox/crows_landed_on_perch/"+dayStamp+"/value", numberOfCrowsLanded);
```
