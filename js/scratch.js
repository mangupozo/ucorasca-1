/*
 * Scratch.js
 * 
 * Module which contains scratched functions
 * 
 * Version: 0.1a @ April 2013
 */

var Scratch = {}

Scratch = (function(window, document) {

	var canvas;
	var image;
	
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
		canvas = document.createElement('canvas');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
			
		drawLayer(canvas, '#b0b0b0');
			
		image = new Image();
		image.src = 'img/ganar.jpg';
			
		document.body.appendChild(canvas);
	};
	
	return {
		init: init
	}

}(window, document));