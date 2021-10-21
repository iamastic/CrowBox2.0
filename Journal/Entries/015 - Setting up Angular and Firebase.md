## Setting up Angular and Firebase
### 13/10/21

Here are the steps I followed to set up Firebase library within Angular. This is to work with the Real Time Database (rtdb).

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
  private dbPath = '/tutorials';

```

10) Create a reference for the lists:
```
  tutorialsRef!: AngularFireList<Tutorial>;

```

11) Inject the AngularFireDatabase within the constructor of your service.ts file
```
  constructor(private db: AngularFireDatabase) { }

```

12) Set the list within the constructor:
```
    this.tutorialsRef = db.list(this.dbPath);

```
