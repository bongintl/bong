var $ = require('jquery');
var THREE = require('three');
var Matter = require('matter-js');

var FOV_DEG = 60;
var FOV_RAD = THREE.Math.degToRad(FOV_DEG);
var TAN_HALF_FOV = Math.tan(FOV_RAD/2);

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor(0x000000);
//renderer.setPixelRatio(window.devicePixelRatio || 1);
var camera = new THREE.PerspectiveCamera(FOV_DEG, window.innerWidth / window.innerHeight, 0.1, 30000);

var objects = {};
var lines = [];

var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000});

for(var i = 0; i < 6; i++){
	
	var geometry = new THREE.Geometry();
	
	geometry.vertices.push(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(1, 0, 0)
	);
	
	lines.push( new THREE.Line( geometry, lineMaterial ) );
	
}

scene.add.apply(scene, lines);

var loader = new THREE.TextureLoader();

var halfWidth, halfHeight, z;

var loadedAt = Infinity;
var TRANSITION_DURATION = 5000;
var fadedUp = false;

var loaderFn = (function(){
	var times = 0;
	return function(){
		if(++times === 6){
			loadedAt = Date.now();
		}
	}
})();

function fadeUp(){
	if(fadedUp) return;
	var now = Date.now();
	var t = now - loadedAt;
	if(t > TRANSITION_DURATION){
		renderer.setClearColor(0xFFFFFF);
		fadedUp = true;
	} else {
		var c = t / TRANSITION_DURATION;
		renderer.setClearColor( new THREE.Color(c, c, c) );
	}
}

var dpr;

function layout(shapes){
	
	dpr = window.innerWidth <= 1024 ? window.devicePixelRatio || 1 : 1;
	
	renderer.setPixelRatio( dpr );

	mouse.pixelRatio = dpr;
	
	for(var objName in objects){
		scene.remove( objects[objName] );
	}
	
	objects = {};
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	
	halfWidth = window.innerWidth / 2;
	halfHeight = window.innerHeight / 2;
	
	z = -halfHeight / TAN_HALF_FOV;
	
	shapes.forEach(function(shape){
		
		var geometry, mesh;
		
		var material = new THREE.MeshBasicMaterial({
			transparent: shape.type !== 'circle',
			visible: false
		});
		
		if(shape.type === 'circle'){
			
			loader.load(
				'textures/o.jpg',
				function(texture){
					loaderFn();
					//texture.offset = new THREE.Vector2(0.24, 0);
					material.map = texture;
					material.visible = true;
					material.needsUpdate = true;
				}
			);
			
		} else {
			
			loader.load('textures/' + shape.label + '.svg', function(texture){
				var canvas = document.createElement('canvas');
				canvas.width = 1;
				canvas.height = 1;
				while(canvas.width < shape.w) canvas.width *= 2;
				while(canvas.height < shape.h) canvas.height *= 2;
				canvas.getContext('2d').drawImage(texture.image, 0, 0, canvas.width, canvas.height);
				texture.image = canvas;
				texture.needsUpdate = true;
				material.map = texture;
				material.visible = true;
				material.needsUpdate = true;
				loaderFn();
			})
			
		}
		
		if(shape.type === 'rectangle'){
			geometry = new THREE.PlaneGeometry(shape.w, shape.h);
		} else {
			geometry = new THREE.SphereGeometry( shape.r, 32, 32 );
		}
		
		mesh = new THREE.Mesh(geometry, material);
		mesh.position.z = z;
		objects[shape.label] = mesh;
		scene.add(mesh);
		
	})
	
	lines.forEach(function(line){
		line.geometry.vertices.forEach(function(vertex){
			vertex.z = z;
		})
	})
	
}

function matterToThreeX(x){
	return x - halfWidth;
}

function matterToThreeY(y){
	return window.innerHeight - y - halfHeight;
}

var $element = $(renderer.domElement);

var isGrabbable = false;

function grabbable(){
	unGrab();
	if(isGrabbable) return;
	$element.addClass('grabbable');
	isGrabbable = true;
}

function unGrabbable(){
	if(!isGrabbable) return;
	$element.removeClass('grabbable');
	isGrabbable = false;
}

var isGrabbed = false;

function grab(){
	unGrabbable();
	if(isGrabbed) return;
	$element.addClass('grab');
	isGrabbed = true;
}

function unGrab(){
	if(!isGrabbed) return;
	$element.removeClass('grab');
	isGrabbed = false;
}

function noGrab(){
	unGrab();
	unGrabbable();
}

var mouse = Matter.Mouse.create(renderer.domElement);

var BongRenderer = {
	
	create: function(){

		document.body.appendChild(renderer.domElement);
		
		return {
			controller: BongRenderer,
			layout: layout,
			element: document.body,
			canvas: renderer.domElement,
			mouse: mouse
		}
		
	},
	
	layout: layout,
	
	world: function(engine){
		
		var mouse = engine.render.mouse.position;
		var mouseConstraint = engine.world.constraints[ engine.world.constraints.length - 1 ];
		
		function mouseOverBody(){
			return !!engine.world.bodies.find(function(body){
				return Matter.Bounds.contains( body.bounds, mouse ) && Matter.Vertices.contains( body.vertices, mouse );
			})
		}
		
		if( mouseConstraint.bodyB ){
			grab();
		} else if( mouseOverBody() ) {
			grabbable();
		} else {
			noGrab();
		}
		
		fadeUp();
		
		if( engine.world.bodies.every( function(body){ return body.isSleeping } ) ) return;
		
		engine.world.bodies.forEach(function(body){
			
			var object = objects[body.label];
			
			if(!object) return;
			
			object.position.x = matterToThreeX(body.position.x);
			object.position.y = matterToThreeY(body.position.y);
			object.rotation.z = -body.angle;
			
		})
		
		engine.world.constraints.forEach(function(constraint, i){

			// Ignore mouse constraint
			if(i === engine.world.constraints.length - 1) return;
			
			var lineGeometry = lines[i].geometry;
			
			lineGeometry.vertices[0].x = matterToThreeX(constraint.bodyA.position.x + constraint.pointA.x);
			lineGeometry.vertices[0].y = matterToThreeY(constraint.bodyA.position.y + constraint.pointA.y);
			lineGeometry.vertices[1].x = matterToThreeX(constraint.pointB.x);
			lineGeometry.vertices[1].y = matterToThreeY(constraint.pointB.y);
			
			lineGeometry.verticesNeedUpdate = true;
			
		})
		
		renderer.render(scene, camera);
		
	}
}

module.exports = BongRenderer;