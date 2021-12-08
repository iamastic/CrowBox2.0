## Fixing Authentication Issue

I ran into an issue with the Authentication, wherein, due to its asynchronous nature, the View of the page would load first and the user would get Authenticated afterwards. This meant that there would be a delay/lag in displaying data or allowing the user to read/write data as I could not retrieve the User's UID in time.

I have two services: HandleAuthService which manages the authentication of users and CrowboxdbService which manages the RealTime Database. In my Home page component, I was checking if a user is logged in. If they were logged in, they could access the other site pages. If they were not logged in, I provided them with a button to sign up or sign in. Upon doing so, they were redirected to another page where they may view their data (in data.component.ts).

I had no issues when the user first signs up or first logs in. All my components could access the authState from the HandleAuthService and therefore access things like the User's Name and the uid. I used the uid to update the user's data within the RTDB.

The issue I was coming across rose when the page refreshes. When the page refreshes, it seemed that HandleAuthService ran a little later than everything else. So the components could not retrieve the relevant information such as the uid.

In the **Data.component.ts** file, this was the code I used to retrieve the User's Unique ID (UID):

```js
constructor(private authService: HandleAuthService, private crowboxService: CrowboxdbService) {}
  
ngOnInit(): void {
    //upon the view rendering, get the User Id 
    this.currentUserId = this.authService.currentUserState?.uid;
    console.log("Current User Id is " );
    console.log(this.currentUserId);

    this.checkIfUserExists();
  }

```
Here, `currentUserState?` is an object that stores the details such as `uid` and `email` of the user once the `authState` exists i.e. Firebase sends over the authentication information and metadata to the client. 

Upon refreshing the page, I was unable to get the UID in upon initiation and it returned `undefined`. I faced similar issues in other components and services that used `HandleAuthService`. 

To solve this problem, I decided to create an Observable that the user's state `currentUserState?` gets assigned to. In the **Constructor** of the **HandleAuthService**, here was my code:

```js
  constructor(private fireAuth: AngularFireAuth, private ngZone: NgZone, private router: Router) { 
    this.userLocation = "null";
    /* initialise the currentUserId to that of the local storage */    
    this.currentUser$ = this.fireAuth.authState.pipe(
      take(1),
      map(user => {
        if (user) {
          //set the local storage here to "loggedIn"
          localStorage.setItem('userStatus', "loggedIn");
          return {uid: user.uid, email:user.email, displayName:user.displayName}

        } else {
          localStorage.setItem('userStatus', "loggedOut");
          return null;
        }
      })
    );
  }
```
The observable, `this.currentUser$` now holds the value of the authState of the user. This means, I am now able to wait for the data to complete, making it no problem at all if it is asynchronous. To use this in any other component, I can now simply subscribe to this observable and wait for the data to arrive. Once it arrives and I am sure that the user is authenticated, I can proceed with the other logic of the site. For example, in the **Data.Component.ts** file, here is how I initiate now: 

```js
  ngOnInit(): void {
    //Subscribe to the user auth state observable and wait 
    //to get the UID to proceed
    this.handleAuth.currentUser$
    .pipe(first())
    .subscribe(user => {
      this.currentUserId = user.uid;
      this.handleAuth.isLoggedIn;
      
      this.checkIfUserExists();
      this.initialiseCharts();
    });
  }
```

I also store the user's logged in status to true or false within the `localStorage`.
