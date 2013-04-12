/*
 * Scratch.js
 * 
 * Module which contains functions to scratch
 * 
 * Version: 0.1a @ April 2013
 */

var Scratch = {}

Scratch = (function(window, document) {
	
	/*
	 * Canvas context where to draw 
	 */
	var context;

	/*
	 * Height of canvas element
	 */
	var height;

	/*
	 * Store the canvas of layer
	 */
	var layerCanvas;
	
	/*
	 * Store the canvas of image
	 */
	var imageCanvas;
	
	/*
	 * Number of layers
	 */
	var numLayers = 1; // default
	
	var sectionsByRow;
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
		context = canvas.getContext('2d');
			
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
		var sectionCoordinates = getSectionCoordinates(sectionNumber);
		
		if (((sectionNumber % sectionsByRow) == (sectionsByRow - 1)) && ((width % sectionSize) != 0)) {
			strideX = sectionSize + (width % sectionSize);
		}
			
		if (sectionNumber >= (pixelImageLogic.length - sectionsByRow)) {
			strideY = sectionSize + (height % sectionSize);
		}
		
		// Draw original image's zone on canvas
		layerCanvas.drawImage(canvasImg, x, y, strideX, strideY, x, y, strideX, strideY);			
	}
	
	/*
	 * Get the number of section from the given coordinates
	 * 
	 * @param x Coordinate Y
	 * @param y Coordinate Y
	 * @return Number of section
	 */
	function getSectionNumberFromPosition(x, y) {
		return parseInt(x / sectorSize) + (parseInt(y / sectorSize) * sectionsByRow);
	}
	
	/*
	 * Get the position and size from the given section
	 * 
	 * @param sectionNumber Number of section
	 * @return Coordinates X, Y
	 */
	function getSectionCoordinates(sectionNumber) {
		var x = (sectionNumber % sectionsByRow) * sectionSize;
		var y = (parseInt(sectionNumber / sectionsByRow)) * sectionSize;
		
		return {x: x, y: y}; 
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
		
		/* Layer */
		layerCanvas = document.createElement('canvas');
		layerCanvas.height = height;
		layerCanvas.width = width;
				
		drawLayer(layerCanvas, '#b0b0b0');
		
		document.body.appendChild(layerCanvas);
		
		/* Image */
		imageCanvas = document.createElement('canvas');
		imageCanvas.height = height;
		imageCanvas.width = width;
				
		var image = new Image();
		image.onload = function() {
			imageCanvas.getContext('2d').drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);
		}
		image.src = './img/ganar.jpg';
		
		/* Events */
		document.layerCanvas.addEventListener('touchstart', scratch, false);
		document.layerCanvas.addEventListener('touchmove', scratch, false);
	}
	
	function scratch(event) {
		event.preventDefault();
		
		/* Create appropriate event object to read the touch coordinates */         
		var eventObj = event.touches[0];
		
		/* Stores the starting X/Y coordinate when finger touches the device screen */
		var x = eventObj.pageX;
		var y = eventObj.pageY;
	}
	
	function setSectionSize() {
		sectorSize = 10;
		sectionsByRow = parseInt(width / sectionSize);
	}
	
	return {
		init: init
	}

}(window, document));