var Slides = (function() {
	'use strict';

	// arrays storing the slides in order of appearance
	var SlideList = Array(),SponsorSlideList = Array();
	// default values of various values
	var dflt = { transition: 'fadeIn', length: '3s', choiceSize: 1, delay: '3s', sponsorDelay: '5' };

	// what's currently getting processed
	var current = { layerPtr: 0, Slide: '', status: '', fadesLeft: 0, handleAnimStart: false, slideCount: 0,
		resetLayers: function() {
			// reset layers of current slide
			this.Slide.LayerList.forEach(function(l,lNum) {
				l.obj.className = l.defaultClass;
				l.obj.style.animationDelay = l.delay;
				l.obj.style.opacity=0;
				for (var iter=0; iter < plugins.length; ++iter)
					if (plugins[iter].fadeOut)
						plugins[iter].fadeOut(l.obj);
			});

		} 
	};


	// utility function to find the parent of a given node
	function findParent(node,tagName) {
		var retval = null;
		while (node) {
			if (node.getParent.tagName == tagName)
				return node.getParent;
			else
				node = node.getParent;
		}
		return null;
	}
	// like Array.forEach() but for HTMLCollections
	function collectionForEach(coll, fn) {
		for (var iter = 0; iter < coll.length; ++iter)
			fn(coll.item(iter), iter, coll);
	}




	/*
		This plugins mechanism is a way to have various styles provide different animations. 

		Each item in the plugins Array can have the following values:

		* name -- just a string to help the developer identify the plugin. May be useful in the future.

		* canEdit -- a method that returns true if the layer object passed to it contains HTML elements that it can process

		* canMulti -- returns true if it's possible to queue up multiple animations for the given layer object in one pass

		* process -- given a layer object, this function makes any changes to the HTML to prepare it for being animated

		* preCheck -- called at the start of an animation for any processing of objects. Returns true if any changes were made.

		* fadeOut -- called to reset any processed items at the end of a fadeOut
	 */

	var plugins = Array();
	plugins.push((function() {
		return {
			name: 'split-span',
			// canEdit = are there split-span elements in this layer ?
			canEdit: function(layer) { return layer.getElementsByClassName('split-p').length + layer.getElementsByClassName('split-char').length + layer.getElementsByClassName('split-word').length; },
			// canMulti = can we set up multiple animations at the same time? (only split-p can't do this)
			canMulti: function(layer) { return (layer.getElementsByClassName('split-p').length == 0) },
			// work on a single layer
			process: function(layer) {
				var processed = false;

				var splitP = layer.getElementsByClassName('split-p');
				if (splitP.length > 0) {
					processed = true;
					collectionForEach(splitP, function(div) {
						var plist = div.getElementsByTagName('p');
						collectionForEach(plist, function(para) { 
							para.classList.add('split-item'); 
							var thisClass = layer.dataset['anim'] || dflt.transition;
							para.dataset['anim'] = para.dataset['anim'] || thisClass; 
							para.style.opacity=0;
							// para.classList.add(thisClass);
							if (! para.style.animationDuration) para.style.animationDuration=dflt.length;

						});
					});
				}
				var splitChar = layer.getElementsByClassName('split-char');
				if (splitChar.length > 0) {
					processed = true;
					collectionForEach(splitChar, function(span) {
						span.style.opacity=1
						var plist = span.getElementsByTagName('p');
						collectionForEach(plist, function(para) {
							var t = para.innerText;
							var innerHtml = '';

							// the char spans were not breaking along natural word breaks, so this wordBreak logic is an attempt to fix that
							var wordBreak = true;
							t.split('').forEach(function(ch) { 
								if (wordBreak) {
									innerHtml += '<span style="display: inline-block">';
									wordBreak = false;
								}
								innerHtml += '<span class="split-item" data-anim="'+ 
								(span.dataset['anim'] || dflt.transition) + 
								'" style="opacity: 0; display: inline-block; animation-duration: 0.3s; animation-delay: 0s;">'+
								(ch == ' ' ? '&nbsp;' : ch) +
								'</span>'; 
								if (ch == ' ') {
									innerHtml += '</span>'
									wordBreak = true;
								}
							});
							para.innerHTML = innerHtml;
						});
					})
				}
				var splitWord = layer.getElementsByClassName('split-word');
				var layerClass = layer.dataset['anim'] || dflt.transition;
				if (splitWord.length > 0) {
					processed = true;
					collectionForEach(splitWord, function(span) {
						var spanClass = span.dataset['anim'] || layerClass;
						span.style.opacity=1;
						var plist = span.getElementsByTagName('p');
						collectionForEach(plist, function(para) {
							var t = para.innerText;
							var paraClass = para.dataset['anim'] || spanClass;
							var innerHtml = '';
							t.split(' ').forEach(function(ch) { 
								innerHtml += '<span class="split-item" data-anim="'+ 
								 paraClass + 
								 '" style="display: inline-block; opacity: 0; display: inline-block; animation-duration: 2s; animation-delay: 0.2s;">'+
								 ch+
								 '</span> '; 
							});
							para.innerHTML = innerHtml;
						});
					})
				}
				if (processed) { layer.style.opacity=1; layer.style.animationDelay='0s'; layer.style.transitionDelay='0s'; }
			},
			preCheck: function(layer, event, lObj) {
				var retval = false;

				if (lObj.canMulti) current.handleAnimStart = false; // if we don't update any nodes in this function, we can go back to normal processing

				var possibles = layer.getElementsByClassName('split-item');

				if (possibles.length > 0) {
					collectionForEach(possibles, function(node,num) {
						if (! node.classList.contains('animated') &&  retval == false) {
							if (lObj.canMulti) current.handleAnimStart = true;
							node.style.opacity=1;
							node.className = 'split-item ' + (node.dataset['anim'] || dflt.transition) + ' animated';
							retval = true;

							if (num == possibles.length - 1) { // got the last one
								++current.layerPtr;
							}
						}
					});
					return retval;
				}
			},
			fadeOut: function(layer) {
				collectionForEach(layer.getElementsByClassName('split-item'), function(node,num) {
					node.className = 'split-item';
					node.style.opacity=0;
					layer.style.animationDelay='0s'; 
					layer.style.transitionDelay='0s';
					layer.style.opacity=1;
				});
			}
		};
	})());
	plugins.push((function() {
		return {
			name: 'delay-classes',
			canEdit: function(layer)  {  return layer.classList.contains('noDelay') || layer.getElementsByClassName('noDelay').length; },
			process: function(layer) {
				if (layer.classList.contains('noDelay')) { layer.style.animationDelay = '0.1s'; layer.style.transitionDelay = '0.1s'; }
				collectionForEach(layer.getElementsByClassName('noDelay'), function(node) {  node.style.animationDelay = '0.1s'; node.style.transitionDelay = '0.1s'; });
			}
		};
	})());

	// save the currently processed slide object to the appropriate array and select the next one
	function chooseSlide() {

		if (current.Slide) {
			if (current.Slide.isSponsor) {
				SponsorSlideList.push(current.Slide);
				current.slideCount = 0;
			} else {
				SlideList.push(current.Slide);
				++current.slideCount;
			}
			current.Slide = '';
		}
		// it's possible that there are no slides in SlideList
		if (SponsorSlideList.length > 0 && (SlideList.length == 0 || current.slideCount >= dflt.sponsorDelay))
			current.Slide = SponsorSlideList.shift();
		else
			current.Slide = SlideList.splice(Math.floor(Math.random() * Math.floor(dflt.choiceSize)), 1)[0]

		current.layerPtr = 0;
	}



	// onAnimationStart() is useful for handling animations that should be running at roughly the same time
	function onAnimationStart() {
		var evt;
		if (arguments.length >= 1)
			evt = arguments[0];

		if (current.handleAnimStart) {
			// handle the start
			for (var iter = 0; iter < plugins.length; ++iter)
				if (plugins[iter].preCheck) {
					var retval = plugins[iter].preCheck(current.Layer.obj, evt, current.Layer);
					if (retval) {
						return;
					}
				}
		}
	}

	function animationLoop() {
		var evt;
		if (arguments.length >= 1)
			evt = arguments[0];

		console.log('animationLoop');
		if (current.handleAnimStart) { // events being handled on the 'animationstart' event
			return;
		}

		if (current.status == 'fadeIn') {  // fading in all layers			
			if (current.layerPtr < current.Slide.LayerList.length) {
				current.Layer = current.Slide.LayerList[current.layerPtr];
				var thisL = current.Layer.obj;

				for (var iter = 0; iter < plugins.length; ++iter)
					if (plugins[iter].preCheck) {
						var retval = plugins[iter].preCheck(thisL, evt, current.Layer);
						if (retval) {
							return;
						}
					}
				
				if (current.Layer.delay && ! thisL.style.animationDelay) thisL.style.animationDelay = current.Layer.delay;
				thisL.className = current.Layer.defaultClass + ' ' + (current.Layer.animClass || dflt.transition) + ' animated';
				thisL.style.opacity=1;
				++current.layerPtr;
			}  else {
				current.Slide.LayerList.forEach(function(l,lNum) {
					l.obj.className = l.defaultClass + ' fadeOut animated';
					l.obj.style.animationDelay = dflt.delay;
				});
				current.status = 'fadeOut';
				current.fadesLeft = current.Slide.LayerList.length;
			}
		} else if (current.status == 'fadeOut') { // fading out the current slide
			if (evt && (evt.type == 'manual-loop' || (evt.target && evt.target.nodeName == 'LAYER')) && current.fadesLeft > 0) {
				--current.fadesLeft;
				if (current.fadesLeft == 0) { // ready to prep the next slide

					current.resetLayers();
					// move on
					chooseSlide();
					current.status = 'fadeIn';
					setTimeout(animationLoop, 10);
				}
			}
		}
	}

	return {

		loop: function() { 
			if (current.status == '') {
				chooseSlide();
				current.status = 'fadeIn';
			}
			if (current.status == 'fadeOut')
				current.fadesLeft = 1;

			var evt = new Event('manual-loop');
			if (current.handleAnimStart) onAnimationStart(); else animationLoop(evt); 
		},

		start: function(args) {
			if (args.defaultTransition) dflt.transition = args.defaultTransition;
			if (args.defaultlength) dflt.length = args.defautLength;
			if (args.choiceSize) dflt.choiceSize = args.choiceSize;
			if (args.defaultDelay) dflt.delay = args.defaultDelay;

			// stack & hide all layers
			collectionForEach(document.getElementsByTagName('layer'), function(l, num) { 
				l.style.zIndex = num + 1;  
				l.style.opacity=0;
			});

			// build SlideList
			collectionForEach(document.getElementsByTagName('slide'), function (s,sNum) {

				var addMe = {
					obj: s,
					num: sNum,
					LayerList: Array(),
					isSponsor: false
				};

				if (s.classList.contains('sponsor'))
					addMe.isSponsor = true;

				var replaceFromList = Array(), replaceToList = Array();
				collectionForEach(s.getElementsByTagName('layer'), function(l,lNum) {

					var canMulti = true;
					plugins.forEach(function(p, pluginN) {						
						if (p.canEdit(l)){
							p.process(l);

							if (p.canMulti && ! p.canMulti(l))
								canMulti = false;
						}
					});

					addMe.LayerList.push({
						obj: l,
						num: lNum,
						defaultClass: l.classList.toString(),
						canMulti: canMulti,
						delay: l.style.animationDelay ? l.style.animationDelay : (lNum == 0 ? '' : dflt.delay),
						animClass: l.dataset['anim'] || dflt.transition,
					});
				});

				if (addMe.isSponsor)
					SponsorSlideList.push(addMe);
				else
					SlideList.push(addMe);

			}); // forEach slide

			var b = document.getElementsByTagName('body')[0], paused = false;

			b.addEventListener('keydown', (evt) => {
				const keyName = evt.key;
				if (keyName == ' ') {
					var toggleFn = function(x) { x.style.animationPlayState = (paused ? 'running' : 'paused'); };
					collectionForEach(document.getElementsByTagName('layer'), toggleFn);
					collectionForEach(document.getElementsByTagName('span'),  toggleFn);
					collectionForEach(document.getElementsByTagName('p'),     toggleFn);
					paused = ! paused;
				}
				if (keyName == 'ArrowRight') {
					/* ? */
					console.log(' -> '); 
				}

				if (keyName == 'PageDown') { // next slide
					console.log(current);
					current.resetLayers();
					// move on
					chooseSlide();
					current.status = 'fadeIn';
					setTimeout(animationLoop, 10);
				}
			});

			if (! args.debug) {

				chooseSlide();
				window.addEventListener('animationstart', onAnimationStart );
				window.addEventListener('animationend', animationLoop);
				current.status='fadeIn';
				setTimeout(animationLoop, 10);
			}
		}

	}
})();