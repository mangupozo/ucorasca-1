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
	 * Initialize variables and html elements
	 */
	function init() {
		height = window.innerHeight;
		width = window.innerWidth;
		
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
	};
	
	/*
	 * Set the number of layers
	 */
	function setNumberOfLayers(number) {
		this.numLayers = number;
	}
	
	return {
		init: init,
		setNumberOfLayers: setNumberOfLayers
	}

}(window, document));