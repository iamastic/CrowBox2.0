## Memory issues using ESP32Firebase Library

I faced an issue regarding the memory allocation of FirebaseData objects using the ESP32Firebase Client library. Please view the discussion thread to solve this problem [here](https://github.com/mobizt/Firebase-ESP-Client/discussions/193). 

In the end, I solved the problem by using `fbdo.clear()` where `fbdo` is the FirebaseData Object in question. Each time I was done with a FirebaseData object, I called the `clear()` function to empty out the data and free up memory space. The system now works perfectly and there are no connection timeouts.
