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
	 * Height of canvas element
	 */
	var height;
	
	/*
	 * Store the canvas of image
	 */
	var imageCanvas;
	
	/* 
	 * Percentage of interest needed to win
	 */
	var interestPercentage = 80;
	
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
	 * Width of canvas element
	 */
	var width;
	
	/*
	 * Draw an image's zone on a ellipse placed in the corresponding section 
	 * taking in account the coordinates and dimension of that section.
	 * For that, this function uses Bezier's curves.
	 * 
	 * @param x Coordinate 'x' of section
	 * @param y Coordinate 'y' of section
	 * @param width Width of section 
	 * @param height Height of section 
	 * @param alpha Level of transparency to apply
	 */    	
    function drawEllipse(x, y, width, height, alpha) {
    
    	console.log("drawEllipse.alpha: " + alpha);
    	// Calculate center of the section
    	var centerX = x + width/2;
    	var centerY = y + height/2;
    	
    	// Calculate hypotenuse
    	var h = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));    	
    	h = h*1.3;

    	// Save the context of canvas
    	layerContext.save();
    	
    	// it allows to show the background's zone drawn in the front's canvas
		layerContext.globalCompositeOperation = 'destination-out';
		layerContext.globalAlpha = alpha; // Alternative 1 for setting level of transparency
		
    	console.log("globalAlpha: " + layerContext.globalAlpha);
		// Begin the path of draw
    	layerContext.beginPath();

    	// Start point (center of upper side)
    	layerContext.moveTo(centerX - h, centerY); 

    	// bezier's curve A 
    	layerContext.bezierCurveTo(
            centerX - h, centerY - h, // Control point 1
            centerX + h, centerY - h, // Control point 2
            centerX + h, centerY	  // End point curve A and start point curve B
        );
    	
    	// bezier's curve B    	
    	layerContext.bezierCurveTo(
            centerX + h, centerY + h, // Control point 1
            centerX - h, centerY + h, // Control point 2
            centerX - h, centerY  	  // End point curve B
        );
    	
    	// Set the style of fill
    	layerContext.fillStyle = 'white';
    	//layerContext.fillStyle = "rgba(0,0,0,0.2)"; // Alternative 2 for setting level of transparency
		layerContext.shadowBlur = 10; // set size of the circle's shadow    	
    	layerContext.fill();    	  	
    	
    	// Close the path
    	layerContext.closePath();

    	// Restore the context of canvas
    	layerContext.restore();    	
    }

	/*
	 * Draw an image's zone on a circle placed in the corresponding section 
	 * taking in account the coordinates and dimension of that section
	 * 
	 * @param x Coordinate 'x' of section
	 * @param y Coordinate 'y' of section
	 * @param width Width of section 
	 * @param height Height of section 
	 */    
    function drawCircle(x, y, width, height) {
    	
    	// Calculate hypotenuse
    	var h = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2));  
    	h = h*1.2;
    	
    	// Save the context of canvas
    	layerContext.save();

    	// it allows to show the background's zone drawn in the front's canvas
		layerContext.globalCompositeOperation = 'destination-out';

		// Draw circle
		layerContext.shadowBlur = 20; // set size of the circle's shadow	
		layerContext.beginPath();
		layerContext.arc(x + width/2, y + height/2, h, 0, Math.PI*2, true);
		layerContext.fill();
		layerContext.closePath();
		
		// Restore the context of canvas
    	layerContext.restore();		
    }
    // # Delete drawCircle method
    
    /*
     * Draw the original image when interest zone has been scratched
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
	 * Draw the original image on the ellipse with center in coordinates 'x' and 'y'
	 * 
	 * @param x Coordinate 'x' of the ellipse's center
	 * @param y Coordinate 'y' of the ellipse's center 
	 * @param currentLayer Current layer of section where coordinates 'x' and 'y' are found
	 */
	function drawScratch(x, y, currentLayer) {
				
		// Calculate transparency's level
		var alpha = (currentLayer >= numLayers) ? 1 : ((currentLayer/numLayers)*0.2).toFixed(2);
		console.log("alpha: " + alpha);
		
		// Draw ellipse
		drawEllipse(x, y, sectionSize, sectionSize, alpha);				
	}
	
	/*
	 * Draw the original image on the given section
	 * 
	 * @param sectionNumber Number of section
	 */
	function drawSection(sectionNumber) {
		
		console.log("sectionNumber: " + sectionNumber);
		
		var section = getSectionParameters(sectionNumber);
		
		/* Draw original image section on canvas */ 
		//layerContext.drawImage(imageCanvas, section.x, section.y, section.width, section.height, 
		//									section.x, section.y, section.width, section.height);
		// Before solution that draws squares

		//drawCircle(section.x, section.y, section.width, section.height); // Solution that draws circles
		drawEllipse(section.x, section.y, section.width, section.height);	// Solution that draws ellipses			
	}
	// # Delete drawSection method 
	
	function finish() {
		document.removeEventListener('touchstart', scratch, false);
		document.removeEventListener('touchmove', scratch, false);
		//document.removeEventListener('mousedown', scratch, true);
		//document.removeEventListener('mousemove', scratch, true);
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
	function init(layers) {
		/* Variables */
		height = window.innerHeight;
		width = window.innerWidth;
		
		if (layers !== undefined) {
			numLayers = layers;
		}

		setSectionSize();
		setCounterSectionsTouched();
		
		/* Layer */
		layerCanvas = document.createElement('canvas');
		layerCanvas.width = width;
		layerCanvas.height = height;
		layerContext = layerCanvas.getContext('2d');
		
		drawLayer(layerCanvas, '#b0b0b0');		
		
		/* Image */
		imageCanvas = document.createElement('canvas');
		imageCanvas.width = width;
		imageCanvas.height = height;
		
		var image = new Image();	
		image.onload = function () {
			imageCanvas.getContext('2d').drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);	
		}
		image.src = 'img/ganar.jpg';
		
		/* Appends elements to body */
		document.body.appendChild(imageCanvas);
		document.body.appendChild(layerCanvas);
		
		/* Interest zone */
		setInterestZone(Math.round(width/2), Math.round(height/2), Math.round(width/2), Math.round(height/2));
			
		/* Events */
		document.addEventListener('touchstart', scratch, false);
		document.addEventListener('touchmove', scratch, false);
		//document.addEventListener('mousedown', scratch, true);
		//document.addEventListener('mousemove', scratch, true);
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
		var eventObj = event.touches[0];
		
		/* Stores the starting X/Y coordinate when finger touches the device screen */
		var x = eventObj.pageX;
		var y = eventObj.pageY;
		//var x = event.pageX;
		//var y = event.pageY;

		if (x < width && y < height) {
	        /* Calculate logic section */
			var currentSection = getSectionNumberFromPosition(x, y);		

			if ( event.type == 'touchstart' || // # bug fixed
				 lastSectionTouched != currentSection) {
				
				lastSectionTouched = currentSection;
						
				if (counterSectionsTouched[currentSection] <= numLayers) {		
					/* Increasing count of touch on the section */
					counterSectionsTouched[currentSection] += 1;
				}					
				
				drawScratch(x, y, counterSectionsTouched[currentSection]);
				
				/* Drawing the section with original image section */
				if (counterSectionsTouched[currentSection] >= numLayers) {	
					//drawSection(currentSection); // # delete drawSection function 
					
					//drawScratch(x, y);					
					//drawScratch(x, y, counterSectionsTouched[currentSection]);
					
					if ( isInterest(currentSection) &&
						 (counterSectionsTouched[currentSection] >= numLayers))	{
						
						revealedInterestSections += 1;
						
						if (getInterestPercentage() >= interestPercentage) {
							drawImage();
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
		
		for (var i = 0; i < heightInSections; i++){
			for (var j = 0; j < widthInSections; j++){
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
	
	return {
		init: init
	}

}(window, document));