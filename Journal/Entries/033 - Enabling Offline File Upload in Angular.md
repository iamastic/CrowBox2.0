## Enabling Offline File Upload in Angular

An additional task that I had originally planned not to work on was to provide users without a NodeMCU ESP32 or WiFi connection to gain access to the website's functions. I.e., to allow them to display their data. Given the time I had to spare, I decided to enable this possibility as well. 

Firstly, I needed to enable a file upload system so that the user may upload their **data.txt** file. To design this, I used a [blog post from the Angular devs](https://blog.angular-university.io/angular-file-upload/) to help me with building the system. It is relatively simple, here is the code I used. 

**For the HTML file**
```html

<div id = "offlineFile">
    <!-- The actual workings of the file system. By setting the input type to file, 
        when pressed, it will automatically ask the user to select a file from their folders. 
        Then, upon the file being selected, the function uploadFile($event) will be called. -->
    <input type="file" class="file-input"
       (change)="uploadFile($event)" #fileUpload>

    <!--This div is just a wrapper div. Basically, due to the limited options 
        of styling for the file input, it is best to make that invisible
        and instead, use a wrapper button that can be designed however you like. -->
    <div class="file-upload">
        {{fileName || "No file uploaded yet."}}

        <button mat-mini-fab color="primary" class="upload-btn"
            (click)="fileUpload.click()">
            <mat-icon>attach_file</mat-icon>
        </button>
    </div>

    <!-- Once the user has selected their file, they will hit the 
        upload button. This will parse the file and read it
        And then it will store the data in firebase. -->
    <div>
        <button (click)="readFile()">Upload</button>
    </div>
</div>
```

**The Typescript functions**

```js
//This function simply accepts the first file uploaded
//and sets the variable 
uploadFile(event:any) {
    this.file = event.target.files[0];    
}

//This function parses and reads the file
//it also calls two other functions to upload the data to firebase
  readFile() {
    //create a new FileReader object and open the file
    let fileReader = new FileReader();
    fileReader.readAsText(this.file);

    //Once the file has loaded and is available...
    fileReader.onload = (e) => {
      //For each line in the file, split it and store it into a temporary array
      let tempData = (<string>fileReader.result).split('\n');
      
      tempData.forEach(line => {
        //Seperate each line by the comma delimiter to get
        //individual values. Store this in a temporary string
        let tempLine = line.split(',');

        //if the first word is crows_landed_on_perch, then store it in the 
        //correct Array
        if(tempLine[0]=== "crows_landed_on_perch") {
          this.offlineCrowsOnPerch(tempLine);
        }
        //Likewise with coins_deposited
        if (tempLine[0]==="coins_deposited") {
          this.offlineCoinsDeposited(tempLine);
        }
      });

      //Once the array is filled up, we update these 
      //values into Firebase!
      this.offlineCrowData.forEach(data => {
        this.crowboxService.updateOfflineCrowsOnPerch(data.date,data.value);
      });

      this.offlineCoinData.forEach(data => {
        this.crowboxService.updateOfflineCoinsDeposited(data.date,data.value);
      })
    };
  }
  
  //This function is supplementary to the above function. 
  //It stores the String Array line into a Data Array Object
  offlineCrowsOnPerch(tempLine:any) {
    //check the date, have we moved on to another day?
    //if so, then add on a new object 
    if(tempLine[1] !== this.offlineCurrentCrowDate) {
      this.offlineCurrentCrowDate = tempLine[1];
      //In here, we will be pushing this object onto 
      //the existing array as it is a brand new date
      let tempDataObject:dataObject = {
        date : this.offlineCurrentCrowDate,
        value : parseInt(tempLine[2])
      }
      this.offlineCrowData.push(tempDataObject);

    } else {
        //If it is the same date, then we need to update
        //rather than push the object
        //We convert the value into an Integer/number
        let tempValue = parseInt(tempLine[2]);
        //Then replace the existing value with the new one 
        //at the same date
        this.offlineCrowData[this.offlineCrowData.length-1].value = tempValue;
      }
  }
  
  //The same is done for coins_deposited
```

The final outcome looked like this: 

![file upload](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/Offline%20File%20Upload.PNG)

And the text files were in this format: 

**data.txt**

```txt
crows_landed_on_perch,2021-11-30,9
crows_landed_on_perch,2021-11-30,14
crows_landed_on_perch,2021-11-30,29
crows_landed_on_perch,2021-12-01,2
crows_landed_on_perch,2021-12-01,6
```
