## The Plan

### Start
* Title Page 
  * Acknowledgments 
  * Signed Declaration 
  * Covid 19 Statement

* Executive Summary 
  * Strong statement to summarise the entire project in one sentence. 
  * Followed by a brief description of the problem alongside an outline of everything that was built  

### Main Body
* Section 1
  * Introduction 
    * The purpose of the Crowbox and its role as a Citizen Science Project 
    *  Analysis on the intelligence of Corvid Species and the benefit of this project being successful 
    *  Outline on how the Crowbox works
    *  The User Base of the Crowbox - Target Users
    *  The issue of the low uptake and lack of data aggregation + communication between members of the community 
    *  The inability for the project to be a widescale success due to the aforementioned problem 
  * Aims and Objectives
    * Higher Level Objectives 
      *  Integrate an IoT System into an existing Citizen Science Project
      *  Improve the user experience, thereby encouraging a higher uptake of the project
      *  Improve the data collection, aggregation and sharing method to encourage users to train corvid species
    *  Lower Level Objectives
       *  Introduce WiFi into the Crowbox, giving it the ability to communicate wireless to the user
       *  Create a website for users to view their data being updated in real time 
       *  Introduce a troubleshoot system that analyses the box's condition and notifies the user of any issues
       *  Enable the user to share their results for the world to see
* Section 2
  * Background and Context
    * Brief explanation of what the original Crowbox Project was about (citing the original dissertation)
    * CAD Designing and Laser Printing 
    * What is an IoT System
    * Existing Citizen Science Projects that employ an IoT system (or do not, yet manage to share data on a wide scale)
    * Design Practices - Design Thinking and Agile - Brief comparison of different design practices
    * The practice of integrating an IoT System
    * The Microcontrollers: Arduino, ATMega, ESP8266, ESP32, NodeMCU - comparison and discussion for best fit
    * The Pricing Structure - Lowering or maintaining the price as much as possible of the build 
    * Design of the website - how should the website look? On what principles should we build the website? See Gerhard
    * Displaying the Data - The type of data, private vs public data, sharing preferences, Data Schema drafts
    * The notification system 
    * What about offline? Accommodating for WiFi issues e.g. short range or inavailability 
    * Software decisions - which STACK to use for web dev? Coding in C++ and Arduino language - considering Docker - Using Github 
    * Continuous integration - issues with this and why it was not done? Or perhaps, it was done through online surveys and in person users.

* Section 3
  * The Research
    * Using the Agile Method 
    * Mood Boards 
    * Understanding the core problem - primary research using the google forum
    * Building User Stories 
    * The first User Journey Draft after building the First Crowbox
  * The Crowbox
    * Switching the Arduino out for the NodeMCU ESP8266 and then to NodeMCU ESP32 - redoing the code - fixing bugs - running into various issues
    * Introducing the Sensors - DHT11 and IR Sensor - Testing other sensors e.g. the capacitive touch sensor. This should be inline with the User Stories and they will act as your primary evidence/justification for doing things. 
    * Offline Mode
    * Testing the Crowbox 
    * The Second User Journey (replacing Arduino with NodeMCU and all the new sensors)
    * Bugs and Issues solved (or unsolved)
  * Firebase/Backend
    * Deciding on using firebase for the backend
    * Software as a Service (SaaS) - benefits of this (might have already been touched upon in Background and Context) 
    * Using the Firebase Library for Arduino and for the Website - picking the correct library (mobitz vs the other one I downloaded) 
    * Studying the library documentations for Arduino and Web Dev 
  * The Website
    * Use of Angular 
    * Progression of the website - using surveys, observations, interviews to generate feedback on each prototype of the website
    * Brief walkthrough of each prototype 
    * Final Implementation of key aspects: The charts, the globe, offline mode, troubleshoot/status update, profile and settings. This should also be inline with the User Stories. 
    * Progression of the Data Schema - the various drafts and how it improved - removing too many nested structures  
    * The Third and Final User Journey - Making an account on the website and using it
    * Developing the UI and UX - getting feedback on this 
    * Deployment on Firebase Hosting - the advantages and disadvantages to this (critical)
    * Bugs and Issues solved (or unsolved) 

* Section 4
  * Evaluation
    * Revisiting the initial goals and objectives 
    * Overachieving in certain areas e.g. implementing the Offline Mode was only a contingency plan that was added on in the end 
    * Achieving the objectives of displaying data in real time + offerring a troubleshooting system 
    * Evaluate against the User Stories 
    * Cons: Poor UI design - too simple perhaps - too archaic - Extra sensors might make it difficult to obtain - different libraries required for different sensors - code might not be universal for all people 
  * Future Work 
    * Uploading and displaying images in real time using Firebase Storage (touched upon in profile pictue) 
    * Allow a pintrest board of some sort page for people to view images 
    * Proper data aggregation and analysis tools e.g. How many crows have landed on the perch during stage 1? What about Stage 2?  
