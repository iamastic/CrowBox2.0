## Using Objects Instead of Lists in AngularFire

Earlier, in order to get access to the user, I was retrieving a snapshot of the entire root nodes as a list. I realised later, that since the Data Component which was handling this logic had the `handleAuthService` injected into it, and therefore had access to the User's Unique ID, I did not have to retrieve the list and search through it. Instead, I could directly access the User's unique node by using their ID and retrieving their data as an object. This is precisely what I did when setting up. 

When a user signs up or logs is, there are two scenarios that may take place. 

First, I set up the variables to handle the user in a service called `CrowboxdbService`. 

```js
  userReference!:AngularFireObject<any>;
  usersDataPath = 'Users/';
  currentUserId?:any;
```
In the constructor of this service, I set the reference after ensuring the user ID is not null:
```js
      this.userReference = db.object(this.usersDataPath+`${this.currentUserId}`);
```

The reference handles the retrieving of the snapshot. 

### Scenario 1) This is the User's first time signing up 
In this scenario, the user does not have an account. So, in the DataComponent, I first create a variable to handle the Observable returned by the snapshot, `  userData$?:Observable<any>;`. 

I then run this function in the `ngOnInit()` life cycle:
```js
  /* Check if the user already has a profile in the 
  firebase database. If they do not, then create one
  and update the data: Name, Location, Total Data
  and Preferences */
  checkIfUserExists(): void {
    this.userData$ = this.crowboxService.getUser().snapshotChanges();

    this.userData$.subscribe(action => {
      
      if(action.key){
        console.log("User is in the database");
        console.log(action.key);
        console.log(action.payload.val().Location);
      } else {
        //create the user and their respective data slots here
        console.log("In data component, no such user found");
        console.log("Creating user");
        this.crowboxService.updateTrainingStage(1);
      }
    });
  }
```

This function retrieves the user's data as an object. If it exists, then I proceed by doing nothing. If it does not exist, then I create it by updating the Training Stage and setting it to 1. This automatically generates the necessary nodes i.e. `UserID/Crowbox/current_training_phase`
