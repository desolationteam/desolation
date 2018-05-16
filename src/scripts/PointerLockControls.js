import * as THREE from 'three';

export default function (camera) {

	camera.rotation.set(0, 0, 0);

	const pitchObject = new THREE.Object3D();
	pitchObject.add(camera);

	const yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add(pitchObject);

	const PI_2 = Math.PI / 2;

	const onMouseMove = event => {

		const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));

	};

	this.enabled = false;

	this.getObject = () => yawObject;

	this.movement = {
		forward : false,
		backward : false,
		left : false,
		right : false
	};

	const onKeyDown = event => {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				this.movement.forward = true;
				break;
			case 37: // left
			case 65: // a
				this.movement.left = true;
				break;
			case 40: // down
			case 83: // s
				this.movement.backward = true;
				break;
			case 39: // right
			case 68: // d
				this.movement.right = true;
				break;
		}
	};

	const onKeyUp = event => {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				this.movement.forward = false;
				break;
			case 37: // left
			case 65: // a
				this.movement.left = false;
				break;
			case 40: // down
			case 83: // s
				this.movement.backward = false;
				break;
			case 39: // right
			case 68: // d
				this.movement.right = false;
				break;
		}
	};

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	const havePointerLock = 'pointerLockElement' in document ||
		'mozPointerLockElement' in document ||
		'webkitPointerLockElement' in document;

	if (havePointerLock) {
		const element = document.body;
		const pointerlockchange = event => {
			if (document.pointerLockElement === element ||
				document.mozPointerLockElement === element ||
				document.webkitPointerLockElement === element) {
				this.controlsEnabled = true;
				document.addEventListener('mousemove', onMouseMove, false);
			} else {
				this.controlsEnabled = false;
			}
		};
		// Hook pointer lock state change events
		document.addEventListener('pointerlockchange', pointerlockchange, false);
		document.addEventListener('mozpointerlockchange', pointerlockchange, false);
		document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

	} else {
		document.body.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}

	this.getDirection = function () {
		// assumes the camera itself is not rotated

		const direction = new THREE.Vector3(0, 0, -1);
		const rotation = new THREE.Euler(0, 0, 0, 'YXZ');

		return function (v) {
			rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);
			v.copy(direction).applyEuler(rotation);
			return v;
		};

	}();

	document.body.addEventListener('click', function () {
		const element = document.body;
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
		element.requestPointerLock();
	});

};
