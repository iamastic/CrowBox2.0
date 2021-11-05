## Adding the NTP Library
### 01/11/21


In order to offer real time data transmission from the Crowbox to the Website, I had to be able to record the time or date. Since `millis()` calculates the time since the box has been up and running, this is not a suitable function to use in this scenario. I needed to obtain the current date or time. I decided to go with just obtaining the date, rather the time, as given the small scale of the database, I did not want it to get flooded with too many new nodes each and every time a coin is deposited. Instead, I decided to display the number of coins deposited (or crows landing on the perch) per day. In order to do this, I needed to use the `NTPClient`. 
