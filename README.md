# 20x2 Chicago Slideshow 

This slideshow package is designed specifically for displaying images with captions in a semi-random order, rather than the usual PowerPoint/Keynote definition of a slideshow as informational screens that are used during a talk or presentation. It was written as pre-show entertainment for the live lit show [20x2 Chicago,](https://20x2.org/chicago) and has a few unique features that I was unable to find in another slideshow package.

A full demo is accessible at the project site [20x2chi.pics](https://20x2chi.pics) (because ".slides" isn't a TLD yet).

## Features

* simple HTML page (no Web or Node.js server required) so you can have a whole presentation on your local disk or on a USB thumb drive
* images are displayed with arbitrary animated text overlays
* all assets can be loaded locally (i.e., no external dependents, so no internet/wifi connection needed to run)
* uses [animate.css](https://github.com/daneden/animate.css/) for animations
* allows for limited control of randomness in choosing slides
* allows for "sponsor slides" to be inserted every N slides

I have also included **parc,** a small utility that can scale and translate the slides, in cases where the slides are being projected in an incorrect aspect ratio. More details on this utility available at [the GitHub page for that project.](https://github.com/manminusone/parc)

## Background

I was looking around at slideshow frameworks for displaying images before the 20x2 Chicago shows, but I couldn't find one that specifically addressed what I wanted: a basic slideshow framework that allowed for arbitrary text & graphics to be layered on top of images, did not need to be hosted on a server (i.e., no Node.js solutions), could be loaded up locally in a browser window without any external dependencies (I could not rely on wi-fi being available at our venues), and allowed those slides to be randomly cycled. After several months of coding I had my first version, which was used with success at the October 2018 show. I continue to make changes and improvements on the code.

## Usage

Once you've cloned this repository, run the Bash script file **make.sh** to copy the appropriate CSS/font files from the linked repos to the CSS and JS subdirectories. Once that's done you can open up **index.html** in your browser to see some sample slides. 

When you've got a slideshow working, you can then execute the **make.sh** command again with the single argument `dist` to create a complete distribution of the code in the **dist/** subdirectory. The script will also copy over any directories named **img/** or **images/**, assuming that's where you're storing your images. If that's not the name of your images directory, you should manually copy that directory.

### Keyboard shortcuts

Key   | Notes
------|------
Space | Pauses / resumes animations

You can also use the keys assigned to the **parc** utility to adjust the scale and offset of the HTML body. Press <kbd>V</kbd> to show a square for scaling, and <kbd>B</kbd> to display a square for offset. Use the arrow keys to adjust, and then press the <kbd>V</kbd> or <kbd>B</kbd> key to hide the square. Further information at [the GitHub page for parc.](https://github.com/manminusone/parc)

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

Note that each layer is displayed with a pause afterward, to allow the viewer to read each layer's contents before the next one shows up. If you were to put all of the spans in a single layer, it would display properly, but everything would show up at once. So remember that the program pauses between layers, rather than between spans or paragraphs.


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

### Split spans

As part of the gridded layers, I have created some code & a few classes to create what I call "split spans," which are span tags that allow you to animate text inside a span. The code does this by splitting up text within a given span to have separate animation triggers. Below are the descriptions of the split span classes; these classes go on the span with the content that you want to animate.

The **split-p** class can be used to animate paragraphs within a span so that one paragraph at a time shows up. Make your layer look like this:

```
    <layer class="gridded">
        <span class="quote-right split-p">
            <p> These paragraphs ... </p>
            <p> ... are displayed ... </p>
            <p> ... one after the other ... </p>
            <p> ... with some time delay. </p>
        </span>
    </layer>
```

The **split-word** class works on paragraphs within the span, and displays one word at a time.

```
    <layer class="gridded">
        <span class="quote-right split-word">
            <p> This sentence will be displayed one word at a time. </p>
        </span>
    </layer>
```

And the **split-char** class will animate a paragraph one character at a time.

```
    <layer class="gridded">
        <span class="quote-right split-char">
            <p> Character by character, this paragraph will show itself. </p>
        </span>
    </layer>
```


## Design

This section is just a collection of design decisions that were made during the creation of this code. If you want to make your own revisions or code changes, you will find this content helpful.

### Slides object

Inside the file **js/slides.js** is a defined object called **Slides.** There are only 2 public methods on this object: `start` (which you will see below); and `loop`, which allows you to manually advance the animation loop when in debug mode (again, see below).

### Starting the slideshow

At the bottom of the **index.html** page you will see this JavaScript block that calls the `start` method:

```
	<script language="JavaScript">
		Slides.start({
			defaultTransition: 'fadeIn',
			defaultLength: '1s',
			defaultDelay: '3s',
			choiceSize: 1,
			sponsorDelay: 5,
			debug: true
		});
	</script>
```

* **defaultTransition, defaultLength** and **defaultDelay** are applied to any layers that do not have these values already applied to them. (See code for examples.)
* **defaultTransition** is an appropriate animate.css class to use for the "fade-in" transition for layers, **defaultLength** is used for the `animationDuration` of each layer, and **defaultDelay** is used for `animationDelay`. You can override these values by setting appropriate classes and style settings on a layer.
* **choiceSize** indicates how large the pool of prospective slides is when choosing the next slide (see choosing note below).
* **sponsorDelay** is described in the sponsor slides section below.
* **debug** is a value that, when `true,` stops code execution just after everything has been set up, allowing you to examine the elements and execute arbitrary code against the Slides object. If you want to step through the animation loops, you can execute the function `Slides.loop()` in your developer's console.


## Choosing the next slide

Slides are pushed onto a JavaScript Array in the order that they are defined. When a slide is displayed, its value is spliced out of the array, and then pushed onto the end of the array when display is complete. The next slide is then randomly chosen from the first **N** slides in the Array, where **N** is the value of **choiceSize** as defined above (the default value of **N** is 1). 

So if **N=1** then the slides will be displayed in definition order with no randomness (the very first value of the array will be chosen each time). If **N=2** then there will be a little bit of randomness in the display of slides (a random choice between the first 2 slides of the array). If **N=S-1** where **S** is the number of defined slides, then the next slide will be anything except the previous slide (which has been pushed onto the end of the Array). If **N=S** then any slide could be chosen next, including the previous slide.


## Sponsor slides

If a slide is tagged with the class `sponsor,` then it is considered a slide that should be shown often. This is to allow for slides that advertise the event being shown, the venue, the sponsors, or any other specific details you want to appear often.

You can specify a value in the `Slides.start` config named **sponsorDelay** which indicates how many regular/non-sponsor slides should be shown before one from the sponsor list is shown. The default value is 5 regular slides between every sponsor slide.

If multiple sponsor slides are defined, then they will be displayed in the order they appear in the file. They are not randomized. However, this may change in the future.

## TODO list

* advanced transitions
* possible customization of "slide fade out" transition
* additional hotkeys (move immediately to next slide, move backwards/forwards in slide queue, etc.)


## Disclaimer

This code was generated for a specifically narrow use case. I am almost certain that it will take some work to get it working on a different project, and unfortunately I am unable to address any changes for other projects. If you find this project valuable and want to contribute, submit a pull request. Thanks in advance!

## Author

James Allenspach <james.allenspach@gmail.com> 
