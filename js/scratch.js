/*
 * Scratch.js
 * 
 * Module which contains functions to scratch
 * 
 * Version: 0.2a @ April 2013
 */

var Scratch = {}

Scratch = (function(window, document) {
	
	/* 
	 * Array which has a 0 if the section is not principal and a 1 otherwise
	 */
	var counterInterestSections;
	/*
	 * Array for taking the count of times that screen is touched on each section
	 */
	var counterSectionsTouched;

	/*
	 * URL containing de background image
	 */
	var backgroundImageURL;

	/*
	 * URL containing de background image
	 */
	var foregroundImageURL;

	/*
	 * Height of canvas element
	 */
	var height;
	
	/*
	 * Indicates that the game has finished
	 */
	var end = false;
	
	/*
	 * Store the canvas of image
	 */
	var imageCanvas;
	
	/* 
	 * Percentage of interest needed to win
	 */
	var interestPercentage = 65;

	/* 
	 * Point where interest zone starts
	 */
	var interestPoint;

	/* 
	 * Height of the interest zone
	 */
	var interestHeight;

	/* 
	 * Width of the interest zone
	 */
	var interestWidth;



	/*
	 * Indicate if 'onmouse' events are supported
	 */
	var isMouseSupported = 'onmousemove' in window.document;
	
	/*
	 * Indicate  if 'ontouch' events are supported 
	 */
	var isTouchSupported = 'ontouchstart' in window.document;
	
	/*
	 * Store the canvas of layer
	 */
	var layerCanvas;
	
	/*
	 * Canvas context where to draw
	 */
	var layerContext;
	
	/*
	 * Number of the last section touched by user
	 */
	var lastSectionTouched = -1;
	
	/* 
	 * It stores the number of interest sections
	 */
	var numberOfInterestSections;
	
	/*
	 * Number of layers
	 */
	var numLayers = 1; /* default */
	
	/* 
	 * It stores the number of revealed interest sections
	 */
	var revealedInterestSections;
	
	/*
	 * Number of sections by row
	 */
	var sectionsByRow;
	
	/*
	 * Size of a section
	 */
	var sectionSize;
	
	/*
	 * Max time to scratch 
	 */
	var time = 15;
	
	/*
	 * Span element to show the timer value
	 */
	var timerSpan;
	
	/*
	 * Function that executes 'timer' each 1 second
	 */
	var timeout;
	
	/*
	 * Width of canvas element
	 */
	var width;
	
	/*
	 * Draw an image zone on a ellipse placed in the corresponding section 
	 * taking in account the coordinates and dimension of that section.
	 * For that, this function uses Bezier's curves.
	 * 
	 * @param x Coordinate 'x' of section
	 * @param y Coordinate 'y' of section
	 * @param width Width of section 
	 * @param height Height of section 
	 */    	
    function drawEllipse(x, y) {
    	var width = sectionSize;
    	var height = sectionSize;
    	
    	// Calculate hypotenuse
    	var h = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));    	
    	h = h*1.3;

    	// Save the context of canvas
    	layerContext.save();
    	
    	// it allows to show the background's zone drawn in the front's canvas
		layerContext.globalCompositeOperation = 'destination-out';

		// Begin the path of draw
    	layerContext.beginPath();

    	// Start point (center of upper side)
    	layerContext.moveTo(x - h, y); 

    	// bezier's curve A 
    	layerContext.bezierCurveTo(
            x - h, y - h, // Control point 1
            x + h, y - h, // Control point 2
            x + h, y	  // End point curve A and start point curve B
        );
    	
    	// bezier's curve B    	
    	layerContext.bezierCurveTo(
            x + h, y + h, // Control point 1
            x - h, y + h, // Control point 2
            x - h, y  	  // End point curve B
        );
    	
    	// Set the style of fill
    	layerContext.fillStyle = 'white';
		layerContext.shadowBlur = 10; // set size of the circle's shadow    	
    	layerContext.fill();    	  	
    	
    	// Close the path
    	layerContext.closePath();

    	// Restore the context of canvas
    	layerContext.restore();    	
    }
    
    /*
     * Draw the original image when interest zone has been fully scratched or time has expired
     */
    function drawImage() {
    	layerContext.drawImage(imageCanvas, 0, 0, layerCanvas.width, layerCanvas.height, 
											0, 0, layerCanvas.width, layerCanvas.height);
    }
    
	/*
	 * Draw layers on canvas
	 * 
	 * @param canvas Canvas element
	 * @param background Background color
	 */
	function drawLayer(canvas, background) {
		var context = canvas.getContext('2d');
				
		context.save();
		context.fillStyle = background;
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.restore();
	}
	
	/*
	 * Finish the game
	 * 
	 * @param timeout Indicates if the time has expired or not
	 */
	function finish(timeoutExpired) {
		if (isTouchSupported) {
			document.removeEventListener('touchstart', scratch, false);
			document.removeEventListener('touchmove', scratch, false);
		}
		
		if (isMouseSupported) {
			document.removeEventListener('mousedown', scratch, false);
			document.removeEventListener('mousemove', scratch, false);
		}
		
		clearTimeout(timeout);
		
		if (timeoutExpired) {
			showMessage(timeoutExpired);
		} else {
			drawImage();
			showMessage(timeoutExpired);
		}
	}
	
	/*
	 * Gets the percentage of interest zone that is revealed
	 */
	function getInterestPercentage () {
		return Math.round(revealedInterestSections / numberOfInterestSections * 100);
	}
	
	/*
	 * Get the number of section from the given coordinates
	 * 
	 * @param x Coordinate Y
	 * @param y Coordinate Y
	 * @return Number of section
	 */
	function getSectionNumberFromPosition(x, y) {
		return parseInt(x / sectionSize) + (parseInt(y / sectionSize) * sectionsByRow);
	}
	
	/*
	 * Get the position and size from the given section
	 * 
	 * @param sectionNumber Number of section
	 * @return Parameters: x, y, width, height
	 */
	function getSectionParameters(sectionNumber) {
		var x = (sectionNumber % sectionsByRow) * sectionSize;
		var y = (parseInt(sectionNumber / sectionsByRow)) * sectionSize;
		var h = sectionSize;
		var w = sectionSize;
		
		return {x: x, y: y, width: w, height: h};
	}
	
	/*
	 * Initialize variables and html elements
	 */
	function init(JSONObject) {
		setVariables(JSONObject);
		/* Variables */
		height = window.innerHeight;
		width = window.innerWidth;

		setSectionSize();
		setCounterSectionsTouched();
		
		/* Layer */
		layerCanvas = document.createElement('canvas');
		layerCanvas.width = width;
		layerCanvas.height = height;
		layerContext = layerCanvas.getContext('2d');
		
	
		//drawLayer(layerCanvas, '#b0b0b0'); 
		// # old version    

		var fakeImage = new Image();	
		fakeImage.onload = function () {
			layerContext.drawImage(fakeImage, 0, 0, layerCanvas.width, layerCanvas.height);	
		}
		fakeImage.src = 'img/prueba.jpg';

		
		/* Image */
		imageCanvas = document.createElement('canvas');
		imageCanvas.width = width;
		imageCanvas.height = height;
		
		var image = new Image();	
		image.onload = function () {
			imageCanvas.getContext('2d').drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);	
		}
		image.src = backgroundImageURL;
		
		/* Appends elements to body */
		document.body.appendChild(imageCanvas);
		document.body.appendChild(layerCanvas);
		
		/* Interest zone */
		setInterestZone(interestPoint[0], interestPoint[1], interestWidth, interestHeight);
			
		/* Events */
		if (isTouchSupported) {
			document.addEventListener('touchstart', scratch, false);
			document.addEventListener('touchmove', scratch, false);
		}
		
		if (isMouseSupported) {
			/* it's necessary in windows phone applications */
			document.addEventListener('mousedown', scratch, false);
			document.addEventListener('mousemove', scratch, false);
		}
		
		/* Timer */
		showTimer(true);
		timeout = setTimeout(timer(), 1000);
	}
	
	/* 
	 * Returns true if the section is part of the interest zone, false otherwise
	 * 
	 * @param sectionNumber Number of section touched
	 * @return True if it is an interest section, false otherwise
	 */
	function isInterest(sectionNumber){
		var returnedValue = false;
		
		if (counterInterestSections[sectionNumber] == 1) {
			returnedValue = true;
		}
		
		return returnedValue;
	}
	
	/*
	 * Draw the original image over the layer
	 * 
	 * @param event Touch event
	 */
	function scratch(event) {
		/* Avoid actions by default */
		event.preventDefault(); 
		
		/* Create appropriate event object to read the touch coordinates */
		var eventObj = isTouchSupported ? event.touches[0] : event;
		
		/* Stores the starting X/Y coordinate when finger touches the device screen */
		var x = eventObj.pageX;
		var y = eventObj.pageY;

		if (x < width && y < height) {
	        /* Calculate logic section */
			var currentSection = getSectionNumberFromPosition(x, y);		

			if (event.type == 'touchstart' || event.type == 'mousedown' || lastSectionTouched != currentSection) {	
				lastSectionTouched = currentSection;
						
				if (counterSectionsTouched[currentSection] <= numLayers) {		
					/* Increasing count of touch on the section */
					counterSectionsTouched[currentSection] += 1;
				}					
				
				/* Drawing the section with original image section */
				if (counterSectionsTouched[currentSection] >= numLayers) {
					drawEllipse(x, y);
					
					if (isInterest(currentSection) && (counterSectionsTouched[currentSection] == numLayers))	{
						revealedInterestSections += 1;
						
						if (getInterestPercentage() >= interestPercentage && end == false) {
							end = true;
							finish(false);
						}
					}
				}
			}
		}
	}
	
	/*
	 * Set the array that contains counter of sections touched
	 */
	function setCounterSectionsTouched() {
		var numSections = parseInt((parseInt(width) * parseInt(height)) / Math.pow(sectionSize, 2));		
		
		counterSectionsTouched = new Array(numSections);
		
		/* Initialize sections array */
		for (var i = 0; i < numSections; i++) {
			counterSectionsTouched[i] = 0;
		}
	}
	
	/* 
	 * Sets the interest zone 
	 * 
	 * @param x
	 * @param y
	 * @param width
	 * @param height
	 */
	function setInterestZone(x, y, width, height) {
		var numSections = counterSectionsTouched.length;
		counterInterestSections = new Array(numSections);
		numberOfInterestSections = 0;
		revealedInterestSections = 0;
		
		/* Initialize sections array */
		for (var i = 0; i < numSections; i++) {
			counterInterestSections[i] = 0;
		}
		
		var startSection = getSectionNumberFromPosition(x, y);
		var widthInSections =  getSectionNumberFromPosition(x + width, y) - startSection;
		var heightInSections = (getSectionNumberFromPosition(x, y + height) - startSection) / sectionsByRow;
		
		for (var i = 0; i < heightInSections; i++) {
			for (var j = 0; j < widthInSections; j++) {
				counterInterestSections[sectionsByRow * i + startSection + j] = 1;
				numberOfInterestSections += 1;
			}
		}
	}
	
	/*
	 * Set the size of a section and re-scale the image if it is necessary
	 */
	function setSectionSize() {
		if (width >= 1024) {
			sectionsByRow = 80;
		} else if (width >= 640) {
			sectionsByRow = 40;
		} else {
			sectionsByRow = 20;
		}
		
		/* Re-scale the image canvas if it is necessary */
		if (width % sectionsByRow == 0) {
			sectionSize = width / sectionsByRow;
		} else {
			sectionSize = Math.floor(width / sectionsByRow);
			width = Math.floor(width / sectionsByRow) * sectionsByRow;
		}
			
		if (height % sectionsByRow != 0) {
			height = Math.floor(height / sectionSize) * sectionSize;
		}
	}

	function setVariables(JSONObject) {
		numLayers =  JSONObject.layer;
		//alert('numLayers='+numLayers);
		time = JSONObject.time;
		//alert('time='+time);
		foregroundImageURL = JSONObject.foreground;
		//alert('foregroundImageURL='+foregroundImageURL);
		backgroundImageURL = JSONObject.background;
		//alert('backgroundImageURL='+backgroundImageURL);
		interestPoint = JSONObject.interestZone.point;
		//alert('Point.x='+interestPoint[0]);
		//alert('Point.y='+interestPoint[1]);
		interestHeight = JSONObject.interestZone.width;
		//alert('interestHeight='+interestHeight);		
		interestWidth = JSONObject.interestZone.height;
		//alert('interestWidth='+interestWidth);		
	}
	
	function showMessage(timeoutExpired) {
		var span = document.createElement("span");
		
		if (timeoutExpired) {
			span.innerHTML = "<h1>¡¡¡Lo siento!!!</h1><h2>¡El tiempo ha terminado!</h2>";
			span.className = "timeout"
		} else {
			span.innerHTML = "<h1>¡¡¡Enhorabuena!!!</h1><br><h2>¡¡¡Has ganado!!!</h2>";
			span.className = "win";		
		}
		
		document.body.appendChild(span);
	}
	
	/*
	 * Show the timer in the HTML
	 * 
	 * @param true to show it or false to not show it
	 */
	function showTimer(show) {		
		if (show) {
			timerSpan = document.createElement("timer");
			
			timerSpan.innerHTML = time;
			timerSpan.className = "timer"
				
			document.body.appendChild(timerSpan);
		}
	}

	function timer() {
		time -= 1;
		updateTimerSpan();
		
		if (time == 0) {
			finish(true);
		} else {
			timeout = setTimeout(timer, 1000);
		}
	}
	
	/*
	 * Update the value of timer in the HTML
	 */
	function updateTimerSpan() {
		timerSpan.innerHTML = time;
	}
	
	return {
		init: init
	}

}(window, document));
