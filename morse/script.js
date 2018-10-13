document.addEventListener("DOMContentLoaded", main);

var dotLength = 50;
var DIT = "B";
var DAH = "A";

var VALID_KEYS = {
	13: true, // enter
	32: true // space
};

// var audio = new (window.AudioContext || window.webkitAudioContext)();
// var myosc = audio.createOscillator();
// myosc.frequency.value = 400;
// myosc.connect(audio.destination)
// myosc.start(0);
// setTimeout(function() {
// 	myosc.stop();
// }, 2000)

var lettersLookup = {
    ".-": "A",
    "-...": "B",
    "-.-.": "C",
    "-..": "D",
    ".": "E",
    "..-.": "F",
    "--.": "G",
    "....": "H",
    "..": "I",
    ".---": "J",
    "-.-": "K",
    ".-..": "L",
    "--": "M",
    "-.": "N",
    "---": "O",
    ".--.": "P",
    "--.-": "Q",
    ".-.": "R",
    "...": "S",
    "-": "T",
    "..-": "U",
    "...-": "V",
    ".--": "W",
    "-..-": "X",
    "-.--": "Y",
    "--..": "Z",
    "-----": "0",
    ".----": "1",
    "..---": "2",
    "...--": "3",
    "....-": "4",
    ".....": "5",
    "-....": "6",
    "--...": "7",
    "---..": "8",
    "----.": "9"
};

var letters = {};
for (var key in lettersLookup) {
	letters[lettersLookup[key]] = key;
}



var pressed = false;
var interval;

function setupTicks(length) {
	var currentSymbol = "", currentChar = "", currentWord = "";
	var ticksPressed = 0, ticksUnpressed = 0;
	if (interval) {
		clearInterval(interval);
	}
	interval = setInterval(function tick() {
		if (pressed) {
			ticksPressed++;
			ticksUnpressed = 0;
			if (ticksPressed >= 1 && ticksPressed < 3) {
				// dit
				currentSymbol = ".";
			} else if (ticksPressed >= 3) {
				// dah
				currentSymbol = "-";
			}
		} else {
			ticksUnpressed++;
			if (ticksUnpressed >= 1 && ticksUnpressed < 3) {
				// new symbol
				currentChar += currentSymbol;
				currentSymbol = "";
			} else if (ticksUnpressed >= 3 && ticksUnpressed < 7) {
				// new character
				if (currentChar) {
					if (lettersLookup[currentChar]) {
						display.innerHTML += lettersLookup[currentChar];
						currentWord += lettersLookup[currentChar];
					} else {
						display.innerHTML += "??";
						console.log("Pattern %s not found", currentChar);
					}
					currentChar = "";
				}
			} else if (ticksUnpressed >= 7) {
				// new word
				if (currentWord) {
					display.innerHTML += " ";
					currentWord = "";
				}
			}

			ticksPressed = 0;
		}
	}, length);
}

function main() {
	var button = document.getElementById("morsebutton");
	var display = document.getElementById("display");
	var frequencySlider = document.getElementById("frequency-slider");
	var frequencyDisplay = document.getElementById("frequency-display");
	var dotlengthSlider = document.getElementById("dotlength-slider");
	var dotlengthDisplay = document.getElementById("dotlength-display");
	var clear = document.getElementById("clear");

	clear.onclick = function() {
		display.innerHTML = "";
	}

	var leftList = document.getElementById("left");
	var rightList = document.getElementById("right");

	clickToPlay(leftList);
	clickToPlay(rightList);

	function clickToPlay(list) {
		var listItems = list.querySelectorAll("li");
		for (var i = 0; i < listItems.length; i++) {
			listItems[i].onclick = function() {
				console.log("clicked");
				var letter = this.querySelector(".letter").innerHTML;
				var code = letters[letter];
				playLetter(code);
			}
		}
	}


	dotlengthDisplay.innerHTML = dotLength;

	setupTicks(dotLength);

	var MIN_LENGTH = 10;
	var MAX_LENGTH = 100;
	dotlengthSlider.oninput = function() {
		var newLength = scale(this.value / 100, MIN_LENGTH, MAX_LENGTH);
		dotlengthDisplay.innerHTML = newLength;
	};
	dotlengthSlider.onchange = function() {
		var newLength = scale(this.value / 100, MIN_LENGTH, MAX_LENGTH);
		dotlengthDisplay.innerHTML = newLength;
		dotLength = newLength;
		setupTicks(newLength);
	};
	

	button.onmousedown = down;
	button.onmouseup = up;
	document.onkeydown = function(event) {
		if (VALID_KEYS[event.keyCode]) {
			down();
		}
		if (event.keyCode == 8) { // backspace
			display.innerHTML = "";
		}
	};
	document.onkeyup = function(event) {
		if (VALID_KEYS[event.keyCode]) {
			up();
		}
	};

	var audio = createAudio();


	var MIN_FREQ = 200;
	var MAX_FREQ = 1000;
	frequencyDisplay.innerHTML = 440;
	frequencySlider.oninput = function() {
		var value = this.value / 100;
		var scaled = scale(value, MIN_FREQ, MAX_FREQ);
		audio.oscNode.frequency.value = scaled;
		frequencyDisplay.innerHTML = scaled;
	};

	function playLetter(code) {
		var lengths = [];
		for (var i = 0; i < code.length; i++) {
			var symbol = code.charAt(i);
			if (symbol === ".") {
				lengths.push(dotLength);
			} else if (symbol === "-") {
				lengths.push(dotLength * 3);
			}
		}

		var q = Object.create(StepsQueue);
		q.init();
		var prevLength = 0;
		for (var i = 0; i < lengths.length; i++) {
			var length = lengths[i];
			q.add(function() {
				audio.gainNode.gain.value = 1;
			}, prevLength);
			q.add(function() {
				audio.gainNode.gain.value = 0;
			}, length);
			prevLength = length;
		}
		q.start();
	}


	function up() {
		pressed = false;
		audio.gainNode.gain.value = 0;
	}

	function down() {
		pressed = true;
		audio.gainNode.gain.value = 1;
	}

}

var StepsQueue = {
	init: function() {
		this.queue = [];
	},
	add: function(fn, time) {
		var stepsQueue = this;
		this.queue.push(function(complete) {
			setTimeout(function() {
				fn();
				complete.call(stepsQueue);
			}, time);
		});
	},
	start: function() {
		if (this.queue.length > 0) {
			var fn = this.queue.shift();
			fn(this.start);
		}
	}
}

function scale(value, min, max) {
	return Math.round(value * (max - min) + min);
}

function createAudio() {
	var context = new (window.AudioContext || window.webkitAudioContext)();

	var gain = context.createGain();
	gain.connect(context.destination);
	gain.gain.value = 0;

	var osc = context.createOscillator();
	osc.connect(gain);
	osc.frequency.value = 440;
	osc.start(0);

	return {
		gainNode: gain,
		oscNode: osc
	};
}