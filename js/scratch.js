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
	 * Store the canvas of layer
	 */
	var layerCanvas;
	
	/*
	 * Canvas context where to draw
	 */
	var layerContext;
	
	/*
	 * Number of layers
	 */
	var numLayers = 1; /* default */
	
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
	 */    	
    function drawEllipse(x, y, width, height) {
    
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

		// Begin the path of draw
    	layerContext.beginPath();
		
    	// Start point (center of upper side)
    	layerContext.moveTo(centerX, centerY - h); 

    	// bezier's curve A 
    	layerContext.bezierCurveTo(
            centerX + h, centerY - h, // Control point 1
            centerX + h, centerY + h, // Control point 2
            centerX, centerY + h	  // End point curve A and start point curve B
        );
    	
    	// bezier's curve B    	
    	layerContext.bezierCurveTo(
            centerX - h, centerY + h, // Control point 1
            centerX - h, centerY - h, // Control point 2
            centerX, centerY - h 	  // End point curve B
        );
   	
    	// Set the style of fill
    	layerContext.fillStyle = 'white';
		layerContext.shadowBlur = 20; // set size of the circle's shadow    	
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
		
		if (((sectionNumber % sectionsByRow) == (sectionsByRow - 1)) && ((width % sectionSize) != 0)) {
			h = sectionSize + (width % sectionSize);
		}
			
		if (sectionNumber >= (counterSectionsTouched.length - sectionsByRow)) {
			w = sectionSize + (height % sectionSize);
		}
		
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
		sectionsByRow = parseInt(width / sectionSize);
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
		
		/* Events */
		document.body.addEventListener('touchstart', scratch, false);
		document.body.addEventListener('touchmove', scratch, false);
	}
	
	function scratch(event) {
		/* Avoid actions by default */
		event.preventDefault(); 
		
		/* Create appropriate event object to read the touch coordinates */         
		var eventObj = event.touches[0];
		
		/* Stores the starting X/Y coordinate when finger touches the device screen */
		var x = eventObj.pageX;
		var y = eventObj.pageY;

        /* Calculate logic section */
		var currentSection = getSectionNumberFromPosition(x, y);
		
		/* If selected section is bigger than length of the logic sections */
		if (currentSection >= counterSectionsTouched.length) {
			currentSection -= sectionsByRow;
		}
		
		/* Increasing count of touch on the section */
		counterSectionsTouched[currentSection] += 1;

		/* Drawing the section with original image section */
		if(counterSectionsTouched[currentSection] == numLayers) {		
			drawSection(currentSection);				
		} 
	}
	
	/*
	 * Set the array that contains counter of sections touched
	 */
	function setCounterSectionsTouched() {
		var numSections = (parseInt(width - width % sectionSize) * parseInt(height - height % sectionSize)) / Math.pow(sectionSize, 2);		
		console.log("numSections: " + numSections);
		counterSectionsTouched = new Array(numSections);
		
		/* Initialize sections array */
		for (var i = 0; i < numSections; i++) {
			counterSectionsTouched[i] = 0;
		}
	}
	
	/*
	 * Set the size of a section
	 */
	function setSectionSize() {
		sectionSize = 15;
	}
	
	return {
		init: init
	}

}(window, document));