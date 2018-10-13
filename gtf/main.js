let board_settings = {
	boundingbox: [-15, 15, 15, -15],
	axis: true,
	grid: false,
	minimizeReflow: 'all',
	showCopyright: false,
	showNavigation: true,
	keepaspectratio: false,
	zoom: {
		factorX: 1.25,
		factorY: 1.25,
		wheel: true,
		needshift: false,
		eps: 0.1
	},
	pan: {
		enabled: true,
		needShift: false
	}
}

var board = JXG.JSXGraph.initBoard('graph', board_settings);
//xax = board.create('axis', [[0,0],[1,0]], {ticksDistance:10});
// var a = board.create('slider',[[2,8],[6,8],[0,3,6]],{name:'a'});
// var b = board.create('slider',[[2,7],[6,7],[0,2,6]],{name:'b'}); 
// var delta = board.create('slider',[[2,4],[6,4],[0,0,Math.PI]],{name:'&delta;'}); 
// var c = board.create('functiongraph',[function(x){ return b.Value()*Math.sin(a.Value()*x);}, -10, 10],
//     {strokeWidth:1, trace:true});
// // Lissajous curve
// var c = board.create('curve',[
//           function(t){return A.Value()*Math.sin(a.Value()*t+delta.Value());},
//           function(t){return B.Value()*Math.sin(b.Value()*t);},
//           0, 2*Math.PI],{strokeColor:'#aa2233',strokeWidth:3, trace:false});
// // Archimedean spiral
// var d = board.create('curve', [function(phi){return a.Value()+b.Value()*phi; }, [0, 0], 0, 8*Math.PI],
//  {curveType:'polar', strokewidth:3});          
// Line
// var e = board.create('curve',[
//           function(t){return t;},
//           function(t){return A.Value()*t+B.Value();},
//           -5, 5],{strokeColor:'#1103aa',strokeWidth:3});

let curve_style = {
	strokeColor: '#1103aa',
	strokeWidth: 3
};
let state = {};

function game_round() {
	if (state.old_curve) {
		board.removeObject(state.old_curve);		
	}
	board.zoom100();
	board.setBoundingBox([-15, 15, 15, -15]);
	// Find a new function, graph it
	let fn_str = get_new_function();
	console.log(fn_str)
	let fn = math.parse(fn_str).compile();
	state.fn = fn;
	state.old_curve = board.create('curve', 
		[
			(t) => t,
			(t) => fn.eval({x : t}),
			-20, 20
		], curve_style);
}


const EPSILON = 0.0001;
let MAX_DEGREE = 3;
let MIN_COEFF = -10;
let MAX_COEFF = 10;

function coin() {
	return Math.random() > 0.5;
}

function rand_range(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_new_function() {
	let coeffs = [];
	coeffs.push(rand_range(MIN_COEFF, MAX_COEFF));
	get_new_function_coefficients(coeffs);
	coeffs.reverse();

	let str = "" + coeffs[0];
	for (let i = 1; i < coeffs.length; i++) {
		str = coeffs[i] + " * x ^ " + i + " + " + str;
	}
	return str;
}

function get_new_function_coefficients(coeffs) {
	coeffs.push(rand_range(MIN_COEFF, MAX_COEFF));
	if (coin() && coeffs.length < MAX_DEGREE + 1) {
		get_new_function_coefficients(coeffs);
	}
}

function fns_equal(a, b) {
	let inputs = [];
	for (let i = 0; i < 10; i++) {
		inputs.push(Math.random() * 200 - 100);
	}

	for (let i = 0; i < inputs.length; i++) {
		let result = a.eval({x: inputs[i]}) - b.eval({x: inputs[i]});
		if (Math.abs(result) > EPSILON) {
			return false;
		}
	}

	return true;
}

const graph_el = document.getElementById('graph');
const right = document.getElementById('right');
const wrong = document.getElementById('wrong');
const bad_function = document.getElementById('bad_function');

center_element(right, graph_el);
center_element(wrong, graph_el);
center_element(bad_function, graph_el);

function center_element(el, around) {
	el.style.top = around.offsetHeight / 2 - 2 * el.offsetHeight / 2+ "px";
	el.style.left = around.offsetWidth / 2 - 2 * el.offsetWidth / 2 - 80 + "px";
}

function clear_anim() {
	anime.remove(right);
	anime.remove(wrong);
	anime.remove(bad_function);
}

function display_answer(is_correct, callback) {
	clear_anim();
	let elem = is_correct ? right : wrong;
	if (is_correct) {
		scorePoint();
	}
	state.last_anim = anime({
		targets: elem,
		translateX: 250,
		scale: 2,
		rotate: '1turn',
		opacity: 1,
		complete: () => clear_later(elem, is_correct ? callback : () => {})
	});
}

function display_bad_function() {
	clear_anim();
	state.last_anim = anime({
		targets: bad_function,
		translateX: 250,
		scale: 2,
		rotate: '1turn',
		opacity: 1,
		complete: () => clear_later(bad_function, () => {})
	});
}

function clear_later(elem, callback) {
	state.last_anim = setTimeout(() => {
		anime({
			targets: elem,
			translateX: 250,
			scale: 0.5,
			// rotate: '1turn',
			easing: 'easeOutQuad',
			duration: 100,
			opacity: 0,
			complete: () => {
				anime({
					targets: elem,
					translateX: 0,
					duration: 0
				})
				callback();
			}
		});
	}, 350);
}

function submit_guess() {
	let expr_string = document.getElementById('guess_value').value.trim();
	if (expr_string === '') {
		display_bad_function();
		return;
	}
	let expr = math.parse(expr_string).compile();

	// Test expr to see if it's good
	try {
		expr.eval({x: 0});
	} catch (err) {
		display_bad_function();
		return;
	}

	display_answer(fns_equal(expr, state.fn), () => {
		clear_math_field();
		game_round();		
	});
}

let is_hard = false;
const mode_button = document.getElementById('modebtn');
function toggle_mode() {
	if (is_hard) {
		// remove blur
		graph_el.style.filter = "";
		mode_button.innerHTML = "hard mode";
		mode_button.classList.remove("btn-success");
		mode_button.classList.add("btn-warning");
	} else {
		// apply blur
		graph_el.style.filter = "blur(4.5px)";
		mode_button.innerHTML = "easy mode";
		mode_button.classList.add("btn-success");
		mode_button.classList.remove("btn-warning");
	}


	is_hard = !is_hard;
}


const coef_s = document.getElementById('coeff_slider');
const deg_s = document.getElementById('deg_slider');
const coeff_disp = document.getElementById('max_coeff');
const deg_disp = document.getElementById('max_deg');
function setParams() {
	MIN_COEFF = -parseInt(coef_s.value);
	MAX_COEFF = parseInt(coef_s.value);
	MAX_DEGREE = parseInt(deg_s.value);
	coeff_disp.innerHTML = coef_s.value;
	deg_disp.innerHTML = deg_s.value;

}

setParams();

game_round();
