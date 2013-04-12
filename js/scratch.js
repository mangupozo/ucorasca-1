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
	 * Height of canvas element
	 */
	var height;

	/*
	 * Width of canvas element
	 */
	var width;

	/*
	 * Store if exists support to touch's events
	 */	
	var isTouchSupported = 'ontouchstart' in window.document;	

	/*
	 * Store the canvas of layer
	 */
	var layerCanvas;
	var layerContext;
	
	/*
	 * Store the canvas of image
	 */
	var imageCanvas;
	var imageContext;
	
	/*
	 * Number of layers
	 */
	var numLayers = 1; // default

	/*
	 * Size of sector
	 */	
	var sectorSize = 15; // default
	
	/*
	 * Store a static's object with the logic structure 
	 */		
	var imageLogic; 

	/*
	 * Draw layers on canvas
	 * 
	 * @param canvas Canvas element
	 * @param cxt Context of the canvas element
	 * @param background Background color
	 */
	function drawLayer(canvas, cxt, background) {			
		cxt.save();
		cxt.fillStyle = background;
		cxt.fillRect(0, 0, canvas.width, canvas.height);
		cxt.restore();
	}		
	
	function drawSection(currentSector) {
		
		/* Calculate left upper x,y coordinate of the sector */
		var x = (currentSector % imageLogic.sectionsByRow) * imageLogic.sectorSize;			
		var y = (parseInt(currentSector/imageLogic.sectionsByRow)) * imageLogic.sectorSize;
		
		/* Width/height of sector */
		var strideX = sectorSize;
		var strideY = imageLogic.sectorSize;

		/* Check if right border is next to the current sector */
		if ( ((currentSector % imageLogic.sectionsByRow) == (imageLogic.sectionsByRow - 1)) &&
				((width % imageLogic.sectorSize) != 0) )
			strideX = imageLogic.sectorSize + (width % imageLogic.sectorSize);
		
		/* Check if buttom border is next to the current sector */		
		if ( currentSector >= (imageLogic.counterTouch.length - imageLogic.sectionsByRow) )
			strideY = imageLogic.sectorSize + (height % imageLogic.sectorSize);

		/* Draw original image's zone on canvas */
		layerContext.drawImage(imageCanvas, x, y, strideX, strideY, x, y, strideX, strideY);			
	}

	function getSectorFromPosition(x, y) {
		return parseInt(x / sectorSize) + (parseInt(y / sectorSize) * parseInt(width / sectorSize));
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

		setSectorSize();		
		
		/* Image Canvas */
		imageCanvas = document.createElement('canvas');
		imageCanvas.width = width;
		imageCanvas.height = height;
		imageContext = imageCanvas.getContext('2d');
		
		/* Layer Canvas*/
		layerCanvas = document.createElement('canvas');
		layerCanvas.width = width;
		layerCanvas.height = height;
		layerContext = layerCanvas.getContext('2d');


		/* Image */
		var img = new Image (); // Create image's object		
		img.onload = function () { // Set actions once image's loaded
			
  			// Drawing the image on canvas
			imageContext.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);			
			
			// Drawing the canvas that hide the canvas of the image
			drawLayer(layerCanvas, layerContext, "#b0b0b0");
		}
		img.src = 'img/ganar.jpg';  /// Set image's path 
		
		// Append canvas to body
		document.body.appendChild(layerCanvas);
		
		/* create static's object of logic image */
		imageLogic = function() {

			// Width of section, sections's number and sections's number for row
			var sectorSize = 15;//5; 			
			var numSections = parseInt((parseInt(width - width%sectorSize) * parseInt(height - height%sectorSize)) / Math.pow(sectorSize,2));		
			var sectionsByRow = parseInt(width/sectorSize);
			
			// Create array for taking the count of times that screen's touched on each sections
			var counterTouch = new Array(numSections);
			
			// Initialize sections's array
			for (var i = 0; i < numSections; i++) {
				counterTouch[i] = 0;
			}				

			return {
				sectorSize: sectorSize,
				numSections: numSections,
				sectionsByRow: sectionsByRow,
				counterTouch: counterTouch
			}
		}();
	
		/* Events */
		document.addEventListener('touchstart', scratch, false);
		document.addEventListener('touchmove', scratch, false);
	}
	
	function scratch(event) {


		/* Avoid actions by default*/
		event.preventDefault(); 
		
		/* Create appropriate event object to read the touch coordinates */         
		var eventObj = event.touches[0];
		
		/* Stores the starting X/Y coordinate when finger touches the device screen */
		var x = eventObj.pageX;
		var y = eventObj.pageY;

        /* Calculate logic section */
		var currentSector = parseInt(x/imageLogic.sectorSize) + parseInt(y/imageLogic.sectorSize)* imageLogic.sectionsByRow;
		
		/* If selected section is bigger than length of the logic sections */
		if( currentSector >= imageLogic.counterTouch.length) 
			currentSector -= imageLogic.sectionsByRow;
		
		/* Increasing count of touch on the section */
		imageLogic.counterTouch[currentSector] += 1;

		/* Drawing the section with image's zone */
		if(imageLogic.counterTouch[currentSector] == numLayers) {		
			drawSection(currentSector);				
		} 					
	}
	
	function setSectorSize() {
		sectorSize = 10;
	}
	
	return {
		init: init
	}

}(window, document));