/*
 * Motion.js
 * 
 * Module to detect throw and shake gestures in any device with accelerometer
 * 
 * Version: 0.1a @ April 2013
 */

var Motion = {};

Motion = (function (document) {
	
	/* Gestures detected */
	var NO_GESTURE = 0;
	var THROW_GESTURE = 1;
	var SHAKE_GESTURE = 2;
	
	/* Minimum intensity threshold for gesture to register */
	var threshold = 10.0;
	
	/* Difference between the maximum and minimum module values to detect a movement in a gesture */
	var throwSensitivity = 10.0; /* default */
	var shakeSensitivity = 2.0;  /* default */

	/* Minimum times in a shake gesture that the direction of movement needs to change */
	var totalShakeMovements = 3;

	/* Maximum times in a throw gesture that the direction of movement needs to change */
	var totalThrowMovements = 2;

	/* Maximum time between movements */
	var maxTimeBetweenMovements = 400; /* default */
	
	/* Minimum time between gestures */
	var minTimeBetweenGestures = 1000;

	/* Accelerometer values */
	var moduleCurrentAccel = null;
	var moduleLastAccel = null;
	
	/* Maximum and minimum module values */
	var throwMaxModule = null;
	var throwMinModule = null;
	var shakeMaxModule = null;
	var shakeMinModule = null;

	/* Store the time of the last movement */
	var throwLastMovementTime = null;
	var shakeLastMovementTime = null;
	
	/* Store the time of the last gesture detected */
	var lastGestureTime = null;

	/* Count the number of movements in a gesture */
	var throwMovementsCount = 0;
	var shakeMovementsCount = 0;

	/* The watch id references the current 'watchAcceleration' */
	var watchID = null;

	/* Functions that perform actions associated to shake/throw gestures */
	var throwFunction = function() {};
	var shakeFunction = function() {};

	/* 
	 * Check if a gesture has been performed
	 * 
	 * @param currentTime timestamp
	 * @return gesture detected
	 */
	function checkGesture(currentTime) {
		var timeDifference;
		
		if (shakeMovementsCount > 0) {
			timeDifference = currentTime - shakeLastMovementTime;
			
			if (shakeMovementsCount >= totalShakeMovements) {
				/* shake gesture */
				lastGestureTime = currentTime;
						
				reset();
				return SHAKE_GESTURE;
			}
		}
		
		if (throwMovementsCount > 0) {
			timeDifference = currentTime - throwLastMovementTime;
	
			if (timeDifference > maxTimeBetweenMovements) {
				if (throwMovementsCount <= totalThrowMovements) {
					/* throw gesture */
					lastGestureTime = currentTime;
						
					reset();
					return THROW_GESTURE;
				}
			}
		}
		
		if (timeDifference > maxTimeBetweenMovements) {
			reset();
		}
		
		return NO_GESTURE;
	}
	
	/*
	 * Check if time between gestures has expired
	 * 
	 * @param currentTime timestamp
	 * @return true or false
	 */
	function checkIfTimeBetweenGesturesHasExpired(currentTime) {
		var timeDifference;
		
		if (lastGestureTime !== null) {
			timeDifference = currentTime - lastGestureTime;
			
			if (timeDifference < minTimeBetweenGestures) {
				return true;
			}
		}
		
		return false;
	}

	/*
	 * Detect when a movement has been performed and increase the shake movements counter
	 * 
	 * @param module Module value of accelerometer
	 * @param currentTime timestamp
	 * @param sensitivity Shake sensitivity value
	 */
	function detectShakeMovements(module, currentTime, sensitivity) {
		var timeDifference;

		if (moduleLastAccel === null) {
			shakeMinModule = threshold;
		} else {
			if (moduleCurrentAccel < moduleLastAccel) { /* function decreasing */
				if (shakeMaxModule !== null) {
					if (shakeMaxModule - moduleCurrentAccel > sensitivity) {							
						timeDifference = currentTime - lastGestureTime;
							
						if (timeDifference > minTimeBetweenGestures || lastGestureTime === null) {
							/* new movement */
							shakeMovementsCount++;
							shakeLastMovementTime = currentTime;
							shakeMaxModule = null;
							shakeMinModule = moduleCurrentAccel;
						}
					}
				} else {
					if (shakeMinModule > moduleCurrentAccel) {
						shakeMinModule = moduleCurrentAccel;
					}
				}
			} else { /* function increasing */
				if (shakeMaxModule === null) {						
					if (moduleCurrentAccel - shakeMinModule > sensitivity) {
						shakeMaxModule = moduleCurrentAccel;
					}
				} else {
					if (moduleCurrentAccel > shakeMaxModule) {
						shakeMaxModule = moduleCurrentAccel;
					}
				}
			}
		}
	}
	
	/*
	 * Detect when a movement has been performed and increase the throw movements counter
	 * 
	 * @param module Module value of accelerometer
	 * @param currentTime timestamp
	 * @param sensitivity Throw sensitivity value
	 */
	function detectThrowMovements(module, currentTime, sensitivity) {
		var timeDifference;
		
		if (moduleLastAccel === null) {
			throwMinModule = threshold;
		} else {
			if (moduleCurrentAccel < moduleLastAccel) { /* decreasing */
				if (throwMaxModule !== null) {
					if (throwMaxModule - moduleCurrentAccel > sensitivity) {							
						timeDifference = currentTime - lastGestureTime;
							
						if (timeDifference > minTimeBetweenGestures || lastGestureTime === null) {
							/* new movement */
							throwMovementsCount++;
							throwLastMovementTime = currentTime;
							throwMaxModule = null;
							throwMinModule = moduleCurrentAccel;
						}
					}
				} else {
					if (throwMinModule > moduleCurrentAccel) {
						throwMinModule = moduleCurrentAccel;
					}
				}
			} else { /* increasing */
				if (throwMaxModule === null) {						
					if (moduleCurrentAccel - throwMinModule > sensitivity) {
						throwMaxModule = moduleCurrentAccel;
					}
				} else {
					if (moduleCurrentAccel > throwMaxModule) {
						throwMaxModule = moduleCurrentAccel;
					}
				}
			}
		}
	}

	/*
	 * @return Maximum time between movements of a gesture
	 */
	function getMaxTimeBetweenMovements() {
		return maxTimeBetweenMovements;
	}
	
	/*
	 * @return Value of shake sensitivity
	 */
	function getShakeSensitivity() {
		return shakeSensitivity;
	}

	/*
	 * @return Value of throw sensitivity
	 */
	function getThrowSensitivity() {
		return throwSensitivity;
	}

	/*
	 * Callback function called when the device is ready
	 */
	function onDeviceReady() {
		startWatch();
	}

	/*
	 * Phonegap callback function
	 * 
	 * Calculate module of accelerometer values, execute detect movements functions and check if a gesture is performed
	 * 
	 * @see http://docs.phonegap.com/en/2.5.0/cordova_accelerometer_accelerometer.md.html#accelerometerSuccess
	 */
	function onSuccess(acceleration) {
		var module, currentAccel = acceleration, currentTime = acceleration.timestamp, gesture;
		
		module = Math.sqrt(Math.pow((Math.round(currentAccel.x * 100) / 100), 2) +
						Math.pow((Math.round(currentAccel.y * 100) / 100), 2) +
						Math.pow((Math.round(currentAccel.z * 100) / 100), 2));
		module = Math.round(module * 100) / 100;
		
		if (module > threshold) {
			/* store last and current data sensor */
			moduleLastAccel = moduleCurrentAccel;
			moduleCurrentAccel = module;
		
			if (checkIfTimeBetweenGesturesHasExpired(currentTime)) {
				return;
			}
		
			detectThrowMovements(module, currentTime, throwSensitivity);
			detectShakeMovements(module, currentTime, shakeSensitivity);
		}
		
		gesture = checkGesture(currentTime);
		if (gesture != NO_GESTURE) {
			if (gesture == THROW_GESTURE) {
				throwFunc();
			} else if(gesture == SHAKE_GESTURE) {
				shakeFunc();
			}
		}
	}

	/*
	 * Reset variables
	 */
	function reset() {
		moduleLastAccel = null;
		moduleCurrentAccel = null;
		throwLastMovementTime = null;
		shakeLastMovementTime = null;
		throwMaxModule = null;
		throwMinModule = null;
		shakeMaxModule = null;
		shakeMinModule = null;
		throwMovementsCount = 0;
		shakeMovementsCount = 0;
	}

	/*
	 * Set parameters of gesture
	 * 
	 * @param parameters Parameters object
	 * 		
	 */
	function setParameters(parameters) {
		if (parameters !== null) {
			if (parameters.throwSensitivity !== null) {
				setThrowSensitivity(parameters.throwSensitivity);
			}
			
			if (parameters.shakeSensitivity !== null) {
				setShakeSensitivity(parameters.shakeSensitivity);
			}

			if (parameters.maxTimeBetweenMovements !== null) {
				setMaxTimeBetweenMovements(parameters.maxTimeBetweenMovements);
			}
		}
	}

	/*
	 * Set the shake sensitivity
	 */
	function setShakeSensitivity(value) {
		shakeSensitivity = value;
	}
	
	/*
	 * Set the throw sensitivity
	 */
	function setThrowSensitivity(value) {
		throwSensitivity = value;
	}

	/*
	 * Set the function to be executed when a shake gesture is detected
	 */
	function setShakeFunction(func) {
		shakeFunction = func;
	}

	/*
	 * Set the function to be executed when a throw gesture is detected
	 */
	function setThrowFunction(func) {
		throwFunction = func;
	}

	/*
	 * Set the maximum time (in milliseconds) between movements of a gesture
	 */
	function setMaxTimeBetweenMovements(time) {
		maxTimeBetweenMovements = time;
	}

	/*
	 * Start the module execution
	 * 
	 * @param throwFunc Throw function
	 * @param shakeFunc Shake function
	 * @param parameters Parameters object (throwSensitivity, shakeSensitivity and maxTimeBetweenMovements) 
	 * 
	 * @see http://docs.phonegap.com/en/2.5.0/cordova_events_events.md.html#deviceready
	 */
	function start(throwFunc, shakeFunc, parameters) {
		setThrowFunction(throwFunc);
		setShakeFunction(shakeFunc);
		setParameters(parameters);
		
		document.addEventListener("deviceready", onDeviceReady, false);
	}

	/*
	 * This function is executed when the device is ready
	 * 
	 * @see http://docs.phonegap.com/en/2.5.0/cordova_accelerometer_accelerometer.md.html#accelerometer.watchAcceleration
	 */
	function startWatch() {
		var options = { frequency: 70 }; /* Update acceleration every 'frequency' milliseconds */
		watchID = navigator.accelerometer.watchAcceleration(onSuccess, function() {}, options);
	}

	/*
	 * Stop the module execution
	 * 
	 * @see http://docs.phonegap.com/en/2.5.0/cordova_accelerometer_accelerometer.md.html#accelerometer.clearWatch
	 */
	function stop() {
		if (watchID !== null) {
			navigator.accelerometer.clearWatch(watchID);
			watchID = null;
		}
	}

	/*
	 * Public API
	 */
	return {
		getMaxTimeBetweenMovements: getMaxTimeBetweenMovements,
		getShakeSensitivity: getShakeSensitivity,
		getThrowSensitivity: getThrowSensitivity,
		setMaxTimeBetweenMovements: setMaxTimeBetweenMovements,
		setThrowFunction: setThrowFunction,
		setThrowSensitivity: setThrowSensitivity,
		setShakeFunction: setShakeFunction,
		setShakeSensitivity: setShakeSensitivity,
		start: start,
		stop: stop		
	}

}(document));
