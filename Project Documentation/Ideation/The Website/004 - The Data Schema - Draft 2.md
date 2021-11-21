## Data Schema Draft 2

The two main nodes in the firebase RTDB were the User and the Location nodes. According to the [Firebase Documentation](https://firebase.google.com/docs/database/web/structure-data), nested structures should be avoided. Furthermore, the AngularFire library do not provide any means to access nested data. As a result, in order to access nested data, you must either have a predetermined path e.g. `NodeA/NodeB/NodeC/Value` or, you must grab a snapshot of the parent node and then retrieve another snapshot of the child node. As expected, the code becomes extremely bulky and unecessary. As a result, I decided to flatten the data structure to allow for easier and cleaner access to the user's data. 

Using the User Authentication Process, after the User has been created and a Unique ID (UID) allocated, the RDTB creates a seperate node under `Users/` for the current user using their UID. Here is an example of a user who has been created: 

![new User](https://github.com/iamastic/CrowBox2.0/blob/main/Project%20Documentation/Ideation/Images/DataSchemaNewUser2.PNG)
