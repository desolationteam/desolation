import * as THREE from 'three';

export default class Controls{
	constructor(character, camera, scene, socket) {
		this.camera = camera;
		this.scene = scene;
		this.socket = socket;
		this.canShoot = true;
		character.rotation.set(0, 0, 0);
		this.isFirstPersonMode = false;
		this.isViewModeCanBeChanged = true;
		this.pitchObject = new THREE.Object3D();
		this.pitchObject.add(character);
		this.mesh = new THREE.Object3D();
		this.mesh.position.y = 10;
		this.mesh.add(this.pitchObject);

		this.initInputs();
		this.initPointerLockControls();

		// this.getDirection = function () {
		// 	const direction = new THREE.Vector3(0, 0, -1);
		// 	const rotation = new THREE.Euler(0, 0, 0, 'YXZ');
		// 	return function (v) {
		// 		rotation.set(this.pitchObject.rotation.x, this.mesh.rotation.y, 0);
		// 		v.copy(direction).applyEuler(rotation);
		// 		return v;
		// 	};
		// }();
	}

	initInputs() {
		this.movement = {
			forward : false,
			backward : false,
			left : false,
			right : false
		};
		this.sendChatMessage = false;
		const element = document.body;
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
				case 32: // space
					if (this.canJump === true) this.movement.jump = true;
					this.canJump = false;
					break;
				case 86: // v
					this.toggleViewMode();
					break;
				case 75: //k
					this.talk = true;
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
				case 86:
					this.isViewModeCanBeChanged = true;
					break;
				case 75: //k
					this.talk = false;
					break;
			}
		};
		const onKeyPress = event => {
			switch (event.keyCode) {
				case 13: //enter
					if (document.pointerLockElement === element ||
						document.mozPointerLockElement === element ||
						document.webkitPointerLockElement === element) {
						this.controlsEnabled = !this.controlsEnabled;
						const input = document.getElementById('input');
						if (!this.controlsEnabled) {
							input.removeAttribute('disabled');
							input.focus();
						}
						else {
							this.sendChatMessage = true;
							input.blur();
							input.setAttribute('disabled', 'disabled');
						}
					}
					break;
			}
		};
		document.addEventListener('keydown', onKeyDown, false);
		document.addEventListener('keyup', onKeyUp, false);
		document.addEventListener('keypress', onKeyPress, false);
	}

	shoot() {
		if (this.canShoot) {
			window.app.sounds.soundShoot.play();
			const raycaster = new THREE.Raycaster();
			const direction = new THREE.Vector3(0, 0, -1);
			raycaster.setFromCamera( direction, this.camera );

			const intersections = raycaster.intersectObjects(this.scene.children);
			if ( intersections.length > 0 && intersections[0].object.nickname) {
				const enemyHitted = intersections[0].object;
				enemyHitted.health -= 50;
				if (enemyHitted.health <= 0) {
					this.scene.remove(enemyHitted.player);
					this.scene.remove(enemyHitted);
					setTimeout(() => {
						enemyHitted.health = 100;
						this.scene.add(enemyHitted.player);
						this.scene.add(enemyHitted);
					}, 5000);
					this.socket.emit('enemy death', {
						enemyName: enemyHitted.nickname,
						killer: this.socket.nickname,
					});
				} else {
					this.socket.emit('enemy hitted', {
						enemyName: enemyHitted.nickname,
						damage: 50,
					});
				}
			}
			this.canShoot = false;
			setTimeout(() => this.canShoot = true, 2000);
		}
	}

	toggleViewMode() {
		if (this.isViewModeCanBeChanged) {
			if (!this.isFirstPersonMode) {
				this.camera.position.set(3, 5.5, 0);
				this.isFirstPersonMode = true;
				this.disableRunAnimation = true;
			} else {
				this.camera.position.set(-5, 5.5, -25);
				this.isFirstPersonMode = false;
				this.disableRunAnimation = false;
			}
			this.isViewModeCanBeChanged = false;
		}
	}

	initPointerLockControls() {
		let timer;
		const shoot = this.shoot.bind(this);
		const havePointerLock = 'pointerLockElement' in document ||
			'mozPointerLockElement' in document ||
			'webkitPointerLockElement' in document;
		if (havePointerLock) {
			const element = document.body;
			const onMouseMove = event => {
				clearTimeout(timer);
				const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
				this.mesh.rotation.y -= movementX * 0.002;
				this.isRotate = true;
				timer = setTimeout(() => this.isRotate = false, 100);
			};
			const pointerlockchange = event => {
				if (document.pointerLockElement === element ||
					document.mozPointerLockElement === element ||
					document.webkitPointerLockElement === element) {
					this.controlsEnabled = true;
					document.addEventListener('mousemove', onMouseMove, false);
					document.addEventListener('mousedown', shoot, false);
					document.getElementById('overlay').className = 'hide';
				} else {
					this.controlsEnabled = false;
					document.removeEventListener('mousemove', onMouseMove, false);
					document.removeEventListener('mousedown', shoot, false);
					document.getElementById('overlay').className = '';
				}
			};
			document.addEventListener('pointerlockchange', pointerlockchange, false);
			document.addEventListener('mozpointerlockchange', pointerlockchange, false);
			document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
		} else {
			document.body.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
		}
		document.body.addEventListener('click', function () {
			const element = document.body;
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();
		});
	}
}
