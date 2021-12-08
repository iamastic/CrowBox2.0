## Enabling Offline File Upload in Angular

An additional task that I had originally planned not to work on was to provide users without a NodeMCU ESP32 or WiFi connection to gain access to the website's functions. I.e., to allow them to display their data. Given the time I had to spare, I decided to enable this possibility as well. 

Firstly, I needed to enable a file upload system so that the user may upload their **data.txt** file. To design this, I used a [blog post from the Angular devs](https://blog.angular-university.io/angular-file-upload/) to help me with building the system. It is relatively simple, here is the code I used. 

**For the HTML file**
```html

<div id = "offlineFile">
    //The actual workings of the file system. By setting the input type to file, 
    //when pressed, it will automatically ask the user to select a file from their folders. 
    //Then, upon the file being selected, the function uploadFile($event) will be called.
    <input type="file" class="file-input"
       (change)="uploadFile($event)" #fileUpload>

    //This div is just a wrapper div. Basically, due to the limited options 
    //of styling for the file input, it is best to make that invisible
    //and instead, use a wrapper button that can be designed however you like. 
    <div class="file-upload">
        {{fileName || "No file uploaded yet."}}

        <button mat-mini-fab color="primary" class="upload-btn"
            (click)="fileUpload.click()">
            <mat-icon>attach_file</mat-icon>
        </button>
    </div>

    //Once the user has selected their file, they will hit the 
    //upload button. This will parse the file and read it
    //And then it will store the data in firebase.
    <div>
        <button (click)="readFile()">Upload</button>
    </div>
</div>
```

**The Typescript functions**
```js

```
