## Turning an LED On Through a Website
### 13/09/21

In the previous journal entry, I discussed how I was able to turn an LED on and off over WiFi using requests from a realtime Firebase database. My next step was to do the same thing, but through a website. A main objective of this project is to create a website that allows the user to control the Crow Box over WiFi. In order to achieve this, I need to figure out the best technique in doing so. Given my experience in developing a MEAN Stack application, I decided to use Angular as the frontend. 

I generated a new Angular app using the CLI command ```ng new ledFirebase``` and then created a new component called **button** using ```ng g c button```. I added some basic HTML elements, which were two buttons that were linked to functions in my Typescript file, one to turn On the LED and another to turn it off. 
```html
<div>
    <button id = "turnOn" (click)="turnOn()">Turn On</button>
    <button id = "turnOff" (click)="turnOff()">Turn Off</button>
</div>
```

This looks like: 

![OnOff](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/OnOff.PNG)

I used the following [tutorial](https://medium.com/@monalisorathiya8/angular-sending-a-post-request-with-firebase-820f4046c89) to help guide me in linking Angular with my Firebase database. 

I inclued the ```HttpClientModule``` in the ```app.module.ts``` file as well as in the ```imports``` section of the same file. I then imported the client using
```javascript
import { HttpClient } from '@angular/common/http';
```
within my component.ts file. I created an instance of the HttpClient within my ```constructor```: 
```javascript
constructor(private http: HttpClient) { }
```

Using this ```http``` instance, I was then able to submit ```POST``` requests as per the guidance of the tutorial. 
```javascript
  turnOn(){
    this.http.post('https://humiditysensordata-default-rtdb.firebaseio.com/led_status.json', this.on).subscribe(responseData => {
      console.log(responseData);
    });
  }
```

Where ```this.on``` is an array containing the String "ON", as shown here:
```javascript
on:{name: string} = {name : "ON"};
```

Upon submiting this requesting, I noticed a slight error on the firebase database. 

![Angular Firebase error](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/AngularFirebaseError.PNG)

Each time I submitted a ```POST``` request, firebase created a unique ID under which the input string "ON" was placed. This is not what I wanted, as during runtime, the NodeMCU will not be able to discern which unique ID to use and/or retrieve this unique ID. After reading the firebase [documentation](https://firebase.google.com/docs/database/rest/save-data), I realised I needed to simply replace ```POST``` with ```PUT```. Doing so made my code look like: 

```javascript
  turnOn(){
    this.http.put('https://humiditysensordata-default-rtdb.firebaseio.com/led_status.json', this.on).subscribe(responseData => {
      console.log(responseData);
    });
  }
```

I was then able to manipulate the status of just one Node in the Firebase database as shown below. 

![Angular On](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/AngularOn.PNG)

I was now able to successfully alter the data from the click of a button from my Angular site. After uploading the same code to the NodeMCU (as mentioned in the previous Journal), I was able to turn the LED On and Off by clicking the buttons on the website. This works even if the NodeMCU is not connected to the laptop (and is powered by a powerbank or external source). 

Nonetheless, I came across an issue wherein the requests eventually timed out as a result of passing data that is too large. This appears to be a Arduino Library issue and I am currently investigating the reason for this.
