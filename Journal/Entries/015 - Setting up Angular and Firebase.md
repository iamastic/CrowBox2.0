## Setting up Angular and Firebase
### 13/10/21

Here are the steps I followed to set up Firebase library within Angular. This is to work with the Real Time Database (rtdb). I used the following two guides: [Guide 1](https://developers.google.com/codelabs/building-a-web-app-with-angular-and-firebase#9) and [Guide 2](https://www.bezkoder.com/angular-11-firebase-crud/). 

1) Add Firebase library to Angular: ```ng add @angular/fire```
2) Select correct project
3) Install and save bootstrap: ```npm install --save bootstrap```
4) Copy to styles.css:  ```@import "~../node_modules/bootstrap/dist/css/bootstrap.min.css" OR @import '~bootstrap/dist/css/bootstrap.min.css';```
5) Copy and paste your firebase config into environments.ts file
6) Add to app.module.ts: 

```js
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
```

7) In app.module.ts, import: 
```js
AngularFireModule.initializeApp(environment.firebase),
AngularFireDatabaseModule,
```

8) Import AngularFireDatavase and AngularFireList
```js
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

```

9) Set the path name for the database objects e.g.
```
  crowboxDataPath = 'Users/';

```

10) Create a reference for the lists:
```
  crowboxReference!: AngularFireList<CrowboxData>;

```

11) Inject the AngularFireDatabase within the constructor of your `service.ts` file
```
  constructor(private db: AngularFireDatabase) { }

```

12) Set the list reference within the constructor:
```
    this.tutorialsRef = db.list(this.dbPath);
```

13) Created two functions to handle returning as well as updating values in the Crowbox Database. The first function simply returns the reference of the Crowbox list

```js
  getAll(): AngularFireList<CrowboxData>{
    return this.crowboxReference;
  }
```
And the second function updates a value in the database when provided with a relevant database path. 

```js
  updateUserRef(key:string, value:any): Promise<void> {
    return this.userReference.update(key, value);
  }
```
Where `this.userReference` is of type `AngularFireList<CrowboxData>`. 

14) In order to get all the data, I must first inject the service into my component file. I do this by injecting it into the constructor:

```js
  constructor(private cbservice: CrowboxdbService) {
  }
```

15) Now the service is fully accessible to the `component.ts` file, I can access the functions. The first step is to create a function that is able to retrieve a snapshot of entire list of the data. A snapshot essentially grabs the list alongside its metadata. This will be usefule as we need the unique keys of the data to be able to read, write and update. While following the [Angular Fire](https://github.com/angular/angularfire/blob/master/docs/rtdb/lists.md) library, I used this function to get the data and the metadata:

```js 
retrieveCrowboxData(): Observable<any> {
    this.updateTrainingStage = this.cbservice.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.key, ...c.payload.val()  })
        )
      )
    );

    return this.updateTrainingStage;
  }
```

16) In order to use this function, as it returns an Observable, I need to subscribe to it. The issue I faced, however, is that a majority of my data is nested. As a result, there are more than 2 nodes, making it a deeper than ordinary data structure for a JSON tree. [The Firebase documentation](https://firebase.google.com/docs/database/web/structure-data) suggest a flat data structure and to avoid nested data. This is something I am looking to incorporate into the second draft of the data model I built. However, for now, I wanted to figure out a way to access the nested data. Accoridng to the AngularFire documentation as well as forum, the library was not built to handle nested data queries, as this is not the norm for firebase JSON structures. As a result, I had to attempt solving this problem. To solve the problem, I subscribed to the original Observable to retrieve the keys from the root object in the JSON database. As I am currently in the testing phase, I am able to hard code in some values. Since there is only one user, I simply grabbed the first key from the list of users. I then sent this key to another function that created a new `AngularFireList<CrowboxData>` reference, this time however with an extended database path name (including the key I had just obtained, which represents the user. I repeated the procedure of creating a snapshot observable, then subscribing to said observable and retrieving the data. Here is a sample of how I managed to update the Crowbox's training stage: 

```js

  updateSubscription() {
    this.retrieveCrowboxData().subscribe(data => {
      this.dataSample = data;
      if (this.dataSample) {
        this.key = this.dataSample[0].key;
        this.UpdateCrowBoxTrainingStage(this.key);
      }
    })
  }
  
  UpdateCrowBoxTrainingStage(userKey:any) {
    this.cbservice.userDbPath = `Users/${userKey}`;
    this.cbservice.userReference = this.cbservice.db.list(this.cbservice.userDbPath);
    this.cbservice.updateUserRef('Crowbox', {current_training_stage:this.trainingStage});
  } 
```

Through this method, I was able to access the nested data. This is, however, a rather long and tedious method to use. It would be easier to flatten the tree and simply access one level of the JSON data. 
