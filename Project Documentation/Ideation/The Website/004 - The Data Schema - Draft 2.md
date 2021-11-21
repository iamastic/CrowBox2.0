## Data Schema Draft 2

The two main nodes in the firebase RTDB were the User and the Location nodes. According to the [Firebase Documentation](https://firebase.google.com/docs/database/web/structure-data), nested structures should be avoided. Furthermore, the AngularFire library do not provide any means to access nested data. As a result, in order to access nested data, you must either have a predetermined path e.g. `NodeA/NodeB/NodeC/Value` or, you must grab a snapshot of the parent node and then retrieve another snapshot of the child node. As expected, the code becomes extremely bulky and unecessary. As a result, I decided to flatten the data structure to allow for easier and cleaner access to the user's data. 

Using the User Authentication Process, after the User has been created and a Unique ID (UID) allocated, the RDTB creates a seperate node under `Users/` for the current user using their UID. Here is an example of a user who has been created: 

![new User](https://github.com/iamastic/CrowBox2.0/blob/main/Project%20Documentation/Ideation/Images/DataSchemaNewUser2.PNG)

As may be noted, the user's profile data is no longer under a nested node (e.g. previous it was under `Users/Username/UserData/`). Secondly, the `time_elapsed` parameter has switched to `date_joined` as this provides a better reference and is simpler to calculate how long the User has been active for. You may also notice that under the `Crowbox` node, there is no provision for the data entries. This is because the website does not handle the setting of the data. Currently, this schema is showing a brand new user; one that has yet to set up a crowbox. 

After setting up a crowbox and using it to gather data, the schema will look like this: 

![old user](https://github.com/iamastic/CrowBox2.0/blob/main/Project%20Documentation/Ideation/Images/DataSchemaUser2.PNG)


