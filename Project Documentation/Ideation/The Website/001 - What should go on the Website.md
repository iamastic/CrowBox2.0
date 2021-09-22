## What should go on the Website? 

In this section, I will be outlining, on a preliminary basis, the core aspects of the website. This will be based on User Stories/Insights I have derieved from the [Google Forum Insights](https://github.com/iamastic/CrowBox2.0/blob/main/Project%20Documentation/Ideation/Insights/001%20-%20The%20Google%20Forum.md#the-google-forum) section.

For each User Story, I have listed the various **Components** that may be incorporated into the design of the Website to help solve them. **Components** are working parts of the frontend. I plan on using Angular as my frontend and as such, using the term **Components** works best during prototyping. 

### User Story 1
I want to be able to access and visualise my data (e.g. number of coins collected, amount of food remaining) autonomously and in real time in order to better manipulate the 4 Training Stages.

### Solution 1
* Integrate charts or graphs on to the website to be able to plot and map the data received in real-time. 
* Allow the user to cycle through the graphs i.e. for each data heading.
* Allow users to manipulate the type of graph e.g. switching from a bar graph to a line graph.

### User Story 2
* I want to be able to immediately know/be notified when my Servo Motor stops working, as this is a common occurrence.	
* I want to be immediately notified when parts of the Crow Box are damaged e.g. the Food Dispenser's Styrene Sheet	
* I want to be immediately notified when the sliding lid for the Food Dispenser is jammed, as this is a common occurrence.
* I want to be notified if rain or water seeps into my box, as this may damage my electronics permanently.	

### Solution 2
* Integrate a page through Angular Routing called Troubleshooting.
* Allow the user to visualise the status of their box 
* Integrate headings for each area of the box prone to fault e.g. A section for the Servo Motor, a section for handling the coin dispensor. 
* Provide status updates to the User if a section of the box fails to function.


