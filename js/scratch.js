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
	
	var sectorSize;
	
	/*pixel
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
		
		if (layers !== null) {
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
		document.addEventListener('touchstart', scratch, false);
		document.addEventListener('touchmove', scratch, false);
	}
	
	function scratch(event) {
		event.preventDefault();
		
		/* Create appropriate event object to read the touch coordinates */         
		var eventObj = event.touches[0];
		
		/* Stores the starting X/Y coordinate when finger touches the device screen */
		var x = eventObj.pageX;
		var y = eventObj.pageY;
		
		alert(x + "/" + y);
	}
	
	function setSectorSize() {
		sectorSize = 10;
	}
	
	return {
		init: init
	}

}(window, document));