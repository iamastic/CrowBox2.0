## Creating my First Crowbox
### 25/09/21 -> 02/10/21

I first downlaoded the geomtery files from the [Crowbox website](https://thecrowbox.com/). The files were in a DXF format, which is standard for laser cutting 2D drawings onto 3D elements. I contacted multiple laser printing companies and managed to finalise the details with a company in Lisbon called Dholetec. From all the parts that were printed, there was an issue with just one part. As can be seen below, the two parts should be identical, however, one of the parts does not have the correct indentation at the top. Dholetec managed to fix the issues, though it did take a few days as the weekend came in between. 

Error in printing: 

![Misprinted part]()

The next step was to collect the equipment I needed to build the box. The [website](https://thecrowbox.com/wiki/doku.php?id=kit:CrowBox2_v20_bom) offered a Bill of Materials, where every equipment was specified. Given that this box was created in the United States and I am based in Portugal, I was not able to locate certain pieces of equipment. For example, an important adhesive used to hold the box together was the Acrylic Cement. I instead used a standard glue with a cauk gun, as shown below. 

![glue and cauk gun](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/glue.jpg)

The glue proved to be much more difficult to use, as the cauk gun's size made it impossible to reach in tight spaces (unlike a small tube of acrylic cement). Further more, the glue appears to be less powerful than the cement, and as a result, I had to apply 2-3 times the amount in order ensure the box is robust. As shown in the image below, this made the box look less appealing as the glue was visible from every angle. 

![bad glue in between the sides](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/bad%20glue.jpg)

Regardless, in the end, it did the job of holding the box together. However, if a decent amount of pressure was applied, many of the small parts did fall out and I had to reglue them back, using even more of the adhesive than the last time. 

### Here are some more images of the box being built. 

The rotor disc: 

![rotor disc](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/rotor%20disc.jpg)

The sliding food lid as well as the side panels:

![sliding food lid and side panels](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/sliding%20food%20lid.jpg)

The coin dispensor:

![coin dispensor](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/coin%20dispensor.jpg)

The top lid cover:

![top lid cover](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/top%20lid.jpg)

The coin dispensor installed in the top cover of the box: 
![coin dispensor and top lid](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/coin%20and%20lid.jpg)

The front basket to hold the food and accept coins:
![front basket](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/box%20front.jpg)

The original crowbox required a 0.5mm Styrene sheet to be used in the front basket. Styrene is a material that is hard to come by outside of the US. I, instead, printed the geometry onto a 1mm grey cardboard sheet. I expected it to work fine, however, it proved to be rigid and too thick. As a result, I broke a small piece of the coin sensor's rail, through which the sheet was supposed to slide through. As shown below, I had to apply an excessive amount of adhesive to ensure that the tiny piece would not fall out, and would hold the sheet in place.

![broken coin slide]()

As shown in the image below, I replaced the grey cardboard with a piece of paper covered in aluminum foil. This, susprisingly, turned out to work quite well with the build. 

![aluminum foil](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/foil.jpg)

I used one piece of grey cardboard as the holder for the food. As this piece of the sheet did not need to fit through any narrow sections, I was able to bend it slowly into place.

![food holder cardboard](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/cardboard.jpg)

### Now that a majority of the box components had been built, I put together the electronics 

I soldered the cables to the two switches that go on either side of the perch. These switches will be clicked when a bird lands on the top of the box. 

![soldered wires](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/switch.jpg)

Alligator clips were attached to the coin sensor, completing its circuit. 

![alligator clips](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/Alligator%20clips.jpg)

I installed the MG995 servo in the servo spine of the box. 

![servo](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/servo.jpg)

Connecting all the wires to the Arduino, the end circuit looked like the image below. 

![final circuit](https://github.com/iamastic/CrowBox2.0/blob/main/Journal/Images/final%20electronics.jpg)

Now that the components were installed, I placed the sliding lid as well as the perch rails into the box, and installed the rotor disc as well. Before closing the box, it was time to run a function test.

### The Function Test 
The function test involved 4 checks. First, was to see how the box responds upon booting up. After uploading the crowbox software (obtained from their website) on to the arduino, I plugged it into a power source (wall socket). The test was to ensure that the servo spun the lid closed (starting from a fully open positon) in increments. Then the servo would spin back and forth, and it would end up in a fully open position. This, however, did not ocurr for my box. 

Here is what happened to my box: [Crowbox Stage 1 Failure](https://www.youtube.com/watch?v=lhO7J16TM84)
This is the incorrect movement. Upon doing further research, I learnt that I purchased the wrong servo.
