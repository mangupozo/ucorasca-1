/*
 * Scratch.js
 * 
 * Module which contains functions to scratch
 * 
 * Version: 0.2a @ April 2013
 */

var Scratch = {}

Scratch = (function(window, document) {
	/* BYJC
	 * Array which has a 0 if the section is not principal and a 1 otherwise
	 */
	var counterInterestSections;
	/*
	 * Array for taking the count of times that screen is touched on each section
	 */
	var counterSectionsTouched;


	/* BYJC
	 * It stores the number of revealed interest sections
	 */
	var revealedInterestSections;
	
	/*
	 * Height of canvas element
	 */
	var height;
	
	/*
	 * Store the canvas of image
	 */
	var imageCanvas;
	
	/* BYJC
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
	
	/* BYJC
	 * It stores the number of interest sections
	 */
	var numberOfInterestSections;
	
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
		var section = getSectionParameters(sectionNumber);
		
		/* Draw original image section on canvas */
		layerContext.drawImage(imageCanvas, section.x, section.y, section.width, section.height, 
											section.x, section.y, section.width, section.height);			
	}
	
	/* BY JC
	 * Gets the percentage of interest zone that is revealed
	 */
	function getInterestPercentage (){
		return Math.round(revealedInterestSections/numberOfInterestSections*100);
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
		
		document.body.appendChild(layerCanvas);
		
		/* Image */
		imageCanvas = document.createElement('canvas');
		imageCanvas.width = width;
		imageCanvas.height = height;
		
		var image = new Image();	
		image.onload = function () {
			imageCanvas.getContext('2d').drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);	
		}
		image.src = 'img/ganar.jpg';
		
		/** BY JC**/
		setInterestZone (Math.round(width/2),Math.round(height/2),Math.round(width/2),Math.round(height/2));
		/** END BY JC **/
			
		/* Events */
		document.addEventListener('touchstart', scratch, false);
		document.addEventListener('touchmove', scratch, false);
		/*document.addEventListener('mousedown', scratch, true);
		document.addEventListener('mousemove', scratch, true);*/
	}
	
	/* BY JC
	 * Returns true if the section is part of the interest zone, false otherwise
	 */
	function isInterest(sectionNumber){
		var returnedValue = false;
		if (counterInterestSections[sectionNumber] == 1)
			returnedValue = true;
		
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
			
			/** Cambio aprobado por Ruben**/
			if(counterSectionsTouched[currentSection] <= numLayers) {		
				/* Increasing count of touch on the section */
				counterSectionsTouched[currentSection] += 1;
			}
			
			/* Drawing the section with original image section */
			if(counterSectionsTouched[currentSection] == numLayers) {		
				drawSection(currentSection);
				/** BY JC: Checking if the section is of interest **/
				if(isInterest(currentSection)){
					revealedInterestSections+=1;
					if(getInterestPercentage()>=interestPercentage)
						alert("Has ganado! Revelando el "+getInterestPercentage()+"%");
				}
				/** END BY JC**/
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
	
	/* BY JC
	 * Sets the interest zone 
	 * @param x
	 * @param y
	 * @param width
	 * @param height
	 */
	function setInterestZone (x,y,width,height){
		var numSections = counterSectionsTouched.length;
		counterInterestSections = new Array(numSections);
		numberOfInterestSections = 0;
		revealedInterestSections = 0;
		
		/* Initialize sections array */
		for (var i = 0; i < numSections; i++) {
			counterInterestSections[i] = 0;
		}
		
		var startSection = getSectionNumberFromPosition(x, y);
		var widthInSections =  getSectionNumberFromPosition(x+width, y) - startSection;
		var heightInSections = (getSectionNumberFromPosition(x, y+height) - startSection)/sectionsByRow;
		
		for(var i = 0; i<heightInSections; i++){
			for(var j = 0; j<widthInSections; j++){
				counterInterestSections[sectionsByRow*i+startSection+j] = 1;
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