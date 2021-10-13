## Cloud FIrestore vs Realtime Database
### 07/10/21

Firebase offers two databases; Cloud Firestore and a Realtime Database (RTDB). RTDB is the original database and used to be the only one until the introduction of Cloud Firestore. The two databases offer different capabilities and benefits. Here are some benefits I have found for each from [this source](https://turkjphysiotherrehabil.org/pub/pdf/321/32-1-1475.pdf) as well as the [official firebase page](https://firebase.google.com/docs/firestore/rtdb-vs-firestore). 

**Benefits for RTDB**
* The data for all accounts running get synchronised even when the user is offline
* Any device can access this data. 
* Follows the JSON style of storing and formatting data.
* Is able to track when the client is online/offline to provide them with suitable updates.
* Low latency, reliable and efficient.

**Drawbacks for RTBD**
* More expensive than Cloud Firestore
* Complex data structure, making it difficult to scale effectively. 
* Queries return the entire subtree of the node. 

**Benefits for Cloud Firestore**
* Offers a serverless solution.
* Provides unlimited scalability.
* Richer and faster querying. 
* Allows for complex data hierarchies and storing capabilities.

**Drawbacks for Cloud Firestore**
* A single query must return the entire document.
* Not an ideal option for constant syncing of all devide/account states.
* Limited amount of write rates to individual documents/indexes
