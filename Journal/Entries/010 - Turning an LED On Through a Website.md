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
I used the following [tutorial](https://medium.com/@monalisorathiya8/angular-sending-a-post-request-with-firebase-820f4046c89) to help guide me in linking Angular with my Firebase database. 

I inclued the ```HttpClientModule``` in the ```app.module.ts``` file as well as in the ```imports``` section of the same file. I then imported the client using
```javascript
import { HttpClient } from '@angular/common/http';
```
within my component.ts file.
