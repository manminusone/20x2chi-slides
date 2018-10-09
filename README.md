# 20x2 Chicago Slide Show 
This small piece of HTML and JavaScript was written for a slide show before the live lit show [20x2 Chicago.](https://20x2.org/chicago) It has a few unique features that I was unable to find in another slide show package.

A full demo is accessible at the project site <a href="http://20x2chi.pics/">20x2chi.pics</a> (because ".slides" isn't a TLD yet).

## Features

* images are displayed with arbitrary animated text overlays
* can be loaded locally (no external dependents, so no internet/wifi connection needed to run)
* uses [animate.css](https://github.com/daneden/animate.css/) for animations
* allows for limited control of randomness in choosing slides
* allows for "sponsor slides" to be inserted every N slides

## Background

I was looking around for slideshow frameworks for displaying images before 20x2 Chicago shows, but I couldn't find one that specifically addressed what I wanted: a basic slideshow framework that allowed for arbitrary text & graphics to be layered on top of images, and for those slides to be randomly cycled. Since it (at first) looked like a simple project I started rolling my own slideshow code. Two months and 3 major versions later, here's what I have.

## Usage

Once you've cloned this repository, run the Bash script file **make.sh** to copy the appropriate CSS/font files from the linked repos to the CSS and JS subdirectories. Once that's done you can open up **index.html** in your browser to see some sample slides. 

When you've got a slide show working, you can then execute the **make.sh** command again with the single argument dist to create a complete distribution of the code in the **dist/** subdirectory. The script will also copy over any directories named **img/** or **images/**, assuming that's where you're storing your images. If that's not the name of your images directory, you should manually copy that directory.

### Keyboard shortcuts

Key   | Notes
------|------
Space | Pauses / resumes animations
V     | Allows you to adjust the vertical and horizontal scale, in cases where you are using a projector that isn't set up with a proper aspect ratio. Once the reference square is on the screen, use the arrow keys to adjust the scale, and press V again to hide the square.
B     | Allows you to adjust the vertical and horizontal translation, in the same way you can adjust the scale. The arrow keys will add or subtract pixels to the translation, and pressing B again will hide the reference square.

### General slide HTML format

Each slide consists of one or more layers, each of which are displayed one at a time. Each layer has an integer **z-index** value such that every successive layer is over the previous one(s). When all layers have been displayed, the whole slide fades out, and the program moves on to the next slide.

An example slide might look like this:

```
    <slide>
        <layer class="bkg"><img src="images/slide01.jpg" /></layer>
        <layer class="gridded">
            <span class="header">
                <p> If it isn't one thing.... </p>
            </span>
        </layer>
        <layer class="gridded">
            <span class="footer">
                <p> ....it's another. </p>
            </span>
        </layer>
    </slide>
```

This slide has three layers. The first one is of class **bkg** which auto-sizes an image within the layer to be the full browser width/height. The second & third layer are of class **gridded** which imposes a 5-by-5 CSS grid structure on the layer. Within the gridded layer you include a `<span>` with an appropriate class to take advantage of the grid (see table of classes below). 

Note that each layer is displayed with a pause afterward, to allow the viewer to read each layer's contents before the next one shows up. If you were to put all of the spans in a single layer, it would work, but everything would show up at once. So that's the thinking behind putting each thing in its own layer.


### Grid classes

Here's the current list of class names that you can use for your spans in a gridded layer.

Class name | Grid cells used
---------- | ---------------
header     | The top row of cells
footer     | The bottom row of cells
middler    | The middle row (third row) of cells
quote-left | Rows 2 through 4, cells 1 through 3 (so 9 cells total)
quote-right | Rows 2 through 4, cells 3 through 5

The **quote-left** and **quote-right** classes are used as places for pullquotes. Note that the two classes overlap (both using column 3), so you probably don't want to use both in the same slide.

## Design

This section is just a collection of design decisions that were made during the creation of this code. If you want to make your own revisions or code changes, you will find this content helpful.

### Slides object

Inside the file `js/slides.js` is a defined object called **Slides.** There are only 2 public methods on this object: `start` (which you will see below); and `loop`, which allows you to manually advance the animation loop when in debug mode (again, see below).

### Starting the slideshow

At the bottom of the **index.html** page you will see this JavaScript block that calls the `start` method:

```
	<script language="JavaScript">
		Slides.start({
			defaultTransition: 'fadeIn',
			defaultLength: '1s',
			defaultDelay: '3s',
			choiceSize: 1,
			debug: true
		});
	</script>
```

* **defaultTransition, defaultLength** and **defaultDelay** are applied to any layers that do not have these values already applied to them. (See code for examples.)
* **choiceSize** indicates how large the pool of prospective slides is when choosing the next slide (see choosing note below).
* **debug** is a value that, when `true,` stops code execution just after everything has been set up, allowing you to examine the elements and execute arbitrary code against the Slides object. If you want to step through the animation loops, you can execute the function `Slides.loop()` in your developer's console.


## Choosing the next slide

Slides are pushed onto a JavaScript Array in the order that they are defined. When a slide is displayed, its value is `splice`d out of the array, and then `push`ed onto the end of the array when display is complete. The next slide is then chosen from the first **N** slides, where **N** is the value of **choiceSize** as defined above (the default value of **N** is 1). 

So if **N=1** then the slides will be displayed in definition order with no randomness (the very first value of the array will be chosen each time). If **N=2** then there will be a little bit of randomness in the display of slides (a random choice between the first 2 slides of the array). If **N=S-1** where **S** is the number of defined slides, then the next slide will be anything except the previous slide (which is at the end of the array at that time). If **N=S** then any slide could be chosen next, including the previous slide.


## Sponsor slides

If a slide is tagged with the class `sponsor,` then it is considered a slide that should be shown often. This is to allow for slides that advertise the event being shown, the venue, or any other specific details you want to appear often.

You can specify a value in the `Slides.start` config named **sponsorDelay** which indicates how many regular/non-sponsor slides should be shown before one from the sponsor list is shown. The default value is 5 regular slides between every sponsor slide.

If multiple sponsor slides are defined, then they will be displayed in the order they appear in the file. They are not randomized. However, this may change in the future.

## TODO list

* advanced transitions
* possible customization of "slide fade out" transition


## Disclaimer

This code was generated for a specifically narrow use case. I am almost certain that it will take some work to get it working on a different project, and unfortunately I am unable to address any changes for other projects. If you find this project valuable and want to contribute, submit a pull request. Thanks in advance!

## Author

James Allenspach <james.allenspach@gmail.com> 
