## Switching from Google Login to Standard Login

Earlier, in Angular, I allowed the user to sign in and sign up through Google, using their Gmail account. This was to accomplish a simple interface and allow for a one way sign in and sign up system (e.g. you only have one button to click and Google automatically figures out whether you are a new user or an existing user). 

As outlined in one of my previous journals, I introduced User Authentication to the ESP32 through its own library. That library uses the user's email and password combination to check if the user has already been authenticated and is an existing user within the Firebase User Auth System. As a result, the ESP32 was not recognizing the details of users that had previously signed up using Google. In firebase, you have various types of providers as depcited below. 

![various providers](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/Sign%20Up%20via%20Google.PNG). 

However, I noticed that if a user signed up via the google provider, they were not recognized by the email+password combination provider. As a result, I had to switch my methodology to integrate a custom sign up and log in page. This time, users could use any email as well as password combination and were no longer limited to their gmail accounts. Alongside this, they now simply needed to enter in their email and password into the ESP32 code and it will authenticate their crowbox as well. I created two new components called **SignUp** and **Login**. These two displayed simple form fields from Angular MatFormMudle, helping to restrict the content e.g. only valid emails and passwords are hidden. You can also now set your location and name. Here is a snapshot below: 

![signup](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/Sign%20Up.PNG)

