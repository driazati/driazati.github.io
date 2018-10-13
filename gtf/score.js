const input = document.getElementById("name");
 
let user_name = "";
function submitName() {
	user_name = input.value;
	console.log(name);
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://gtf-scores.herokuapp.com/add", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({
	    name: user_name
	}));
	xhr.onload = function() {
	  if (this.responseText == "bad") {
	  	alert("Invalid name, try again");
	  } else {
	  	// go to game screen
	  	loadGame();
	  }
	}
}

function scorePoint() {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://gtf-scores.herokuapp.com/", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({
	    name: user_name
	}));
	xhr.onload = function() {
		console.log("pointed for", user_name);
		// update scores
		console.log(this.responseText);
		updateScores();
	}
}


const nameDiv = document.getElementById("namediv")
const content = document.getElementById("content")
const tbody = document.getElementById("tbody")
console.log(nameDiv);
console.log(content);
function loadGame() {
	nameDiv.style.display = "none";
	content.style.display = "";
}

const table = document.getElementById('scoretable');
function getScores(cb) {
	user_name = input.value;
	console.log(name);
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://gtf-scores.herokuapp.com/", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({
	    name: user_name
	}));
	xhr.onload = function() {
	  cb(JSON.parse(this.responseText));
	}
}
function updateScores() {
	getScores((scores) => {
		scores.sort((a, b) => {
			return b.score - a.score;
		})
		tbody.innerHTML = "";
		for (let i = 0; i < scores.length; i++) {
			var row = tbody.insertRow(-1);

			// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);

			cell1.appendChild(document.createTextNode(scores[i].name));
			cell2.appendChild(document.createTextNode(scores[i].score));
		}
	});
}

updateScores();


// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Cancel the default action, if needed
  event.preventDefault();
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Trigger the button element with a click
    submitName();
  }
});