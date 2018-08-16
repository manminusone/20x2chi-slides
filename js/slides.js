	var SlideList = Array();
	var dflt = { transition: 'fadeIn', length: '3s', choiceSize: 1, delay: '3s' };
	var current = { layerPtr: 0, Slide: '', status: '', fadesLeft: 0, handleAnimStart: false };

var Slides = (function() {
	'use strict';




	/** plugins **/

	var plugins = Array();
	plugins.push((function() {
		return {
			name: 'split-span',
			canEdit: function(layer) { return layer.getElementsByClassName('split-p').length + layer.getElementsByClassName('split-char').length + layer.getElementsByClassName('split-word').length; },
			canMulti: function(layer) { return (layer.getElementsByClassName('split-p').length == 0) },
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
							para.dataset['anim'] = thisClass; 
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
						var plist = span.getElementsByTagName('p');
						collectionForEach(plist, function(para) {
							var t = para.innerText;
							var innerHtml = '';
							t.split('').forEach(function(ch) { 
								innerHtml += '<span class="split-item" data-anim="'+ 
								(span.dataset['anim'] || dflt.transition) + 
								'" style="display: block; animation-duration: 0.3s; animation-delay: 0s;">'+
								ch+
								'</span>'; });
							para.innerHTML = innerHtml;
						});
					})
				}
				var splitWord = layer.getElementsByClassName('split-word');
				if (splitWord.length > 0) {
					processed = true;
					collectionForEach(splitWord, function(span) {
						span.style.opacity=1;
						var plist = span.getElementsByTagName('p');
						collectionForEach(plist, function(para) {
							var t = para.innerText;
							var innerHtml = '';
							t.split(' ').forEach(function(ch) { 
								innerHtml += '<span class="split-item" data-anim="'+ 
								(span.dataset['anim'] || dflt.transition) + 
								'" style="opacity: 0; display: inline-block; animation-duration: 2s; animation-delay: 0.2s;">'+
								ch+
								'</span> '; });
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

	function chooseSlide() {
		if (current.Slide) {
			SlideList.push(current.Slide);
			current.Slide = '';
		}
		current.Slide = SlideList.splice(Math.floor(Math.random() * Math.floor(dflt.choiceSize)), 1)[0]
		current.layerPtr = 0;
	}

	function collectionForEach(coll, fn) {
		for (var iter = 0; iter < coll.length; ++iter)
			fn(coll.item(iter), iter, coll);
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
		} else if (current.status == 'fadeOut') {
			if (evt && (evt.type == 'manual-loop' || (evt.target && evt.target.nodeName == 'LAYER')) && current.fadesLeft > 0) {
				--current.fadesLeft;
				if (current.fadesLeft == 0) {
					// reset layers of current slide
					current.Slide.LayerList.forEach(function(l,lNum) {
						l.obj.className = l.defaultClass;
						l.obj.style.animationDelay = l.delay;
						l.obj.style.opacity=0;
						for (var iter=0; iter < plugins.length; ++iter)
							if (plugins[iter].fadeOut)
								plugins[iter].fadeOut(l.obj);
					});

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
					LayerList: Array()
				};

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

				SlideList[sNum] = addMe;

			}); // forEach slide


			if (! document.getElementsByClassName('pause-layer').length) {
				var b = document.getElementsByTagName('body')[0];
				var newLayer = document.createElement('layer');
				newLayer.className = 'pauseLayer';
				b.appendChild(newLayer);
			}

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