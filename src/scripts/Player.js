import * as THREE from 'three';

import Controls from './Controls';
import MD2Character from './Character';
import {config} from './Constants';

let lastRotation;
// const raycasterBottom = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10);

export default class Player {
	constructor(socket, scene, camera) {
		this.camera = camera;
		this.scene = scene;
		this.character = new MD2Character();
		this.character.scale = 0.4;
		this.character.loadParts(config);
		this.character.root.add(camera);
		this.isWeaponSet = false;
		this.isAnimated = false;
		this.health = 100;
		camera.position.set(-5, 5.5, -25);
		camera.rotation.y = Math.PI;
		this.controls = new Controls(this.character.root, camera, scene, socket);
		scene.add(this.controls.mesh);
		this.socket = socket;
		this.socket.emit('new player', {
			state: {
				position: this.controls.mesh.position,
			},
			nickname: socket.nickname
		});
		this.talking = false;
	}

	update(delta, isCollision) {
		this.updateMotion(delta, isCollision);
		this.updateRotation();
		this.updateChat();
		if (this.controls.talk && !this.talking) {
			const constraints = {
				audio: true,
				video: false
			};

			const handleSuccess = (stream) => {
				// const audio = document.createElement('audio');
				// audio.autoplay = true;
				// document.body.appendChild(audio);
				const audioTracks = stream.getAudioTracks();
				// audio.srcObject = stream;
				// setTimeout(()=>{
					// audioTracks[0].stop();
					// document.body.removeChild(audio);
				// },5000);
				this.socket.emit('talk', stream);
				console.log(stream);
			};

			this.talking = true;
			function handleError(error) {
				console.log('navigator.getUserMedia error: ', error);
			}

			navigator.mediaDevices.getUserMedia(constraints).
			then(handleSuccess).catch(handleError);
		}
	}

	updateMotion(delta, isCollision) {
		const oldPosition = Object.assign({}, this.controls.mesh.position);
		const velocity = new THREE.Vector3();
		velocity.y -= 9.8 * 600.0 * delta;
		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		let movement = this.controls.movement;
		if (this.controls.controlsEnabled) {
			if (movement.forward && !isCollision) {
				velocity.z += 3200 * delta;
			}
			if (movement.backward) {
				velocity.z -= 3200 * delta;
			}
			if (movement.left) {
				velocity.x += 3200 * delta;
			}
			if (movement.right) {
				velocity.x -= 3200 * delta;
			}
			if (movement.jump) {
				velocity.y += 4000;
				movement.jump = false;
			}
		}
		movement.jump = false;

		// raycasterBottom.ray.origin.copy( this.controls.mesh.position );
		// raycasterBottom.ray.origin.y -= 10;
		// const intersects = raycasterBottom.intersectObjects(this.scene.children);
		// if (intersects.length > 0) {
		// 	console.log(intersects);
		// 	velocity.y = Math.max(0, velocity.y);
		// }

		if (this.controls.disableRunAnimation && !!this.character.meshBody) {
			this.isAnimated = false;
			if (this.character.meshBody.activeAction) {
				this.character.meshBody.activeAction.stop();
				this.character.meshBody.activeAction = null;
			}
			if(this.character.meshWeapon.activeAction) {
				this.character.meshWeapon.activeAction.stop();
				this.character.meshWeapon.activeAction = null;
			}
		}
		this.controls.mesh.translateX(velocity.x * delta);
		this.controls.mesh.translateY(velocity.y * delta);
		this.controls.mesh.translateZ(velocity.z * delta);

		if (this.controls.mesh.position.y < 10) {
			velocity.y = 0;
			this.controls.mesh.position.y = 10;
			this.controls.canJump = true;
		}
		const newPosition = Object.assign({}, this.controls.mesh.position);
		if (oldPosition.x !== newPosition.x || oldPosition.y !== newPosition.y || oldPosition.z !== newPosition.z) {
			if (!this.isAnimated && !this.controls.disableRunAnimation && !!this.character.meshBody && !!this.character.meshBody.geometry) {
				this.isAnimated = true;
				this.character.setAnimation(this.character.meshBody.geometry.animations[1].name);
			}
			this.socket.emit('move', {
				state: {
					position: newPosition
				},
				nickname: this.socket.nickname
			});
		} else if (this.isAnimated && !this.controls.disableRunAnimation && !!this.character.meshBody && !!this.character.meshBody.geometry) {
			this.isAnimated = false;
			this.character.setAnimation(this.character.meshBody.geometry.animations[0].name);
		}
	}

	updateRotation() {
		if (this.controls.controlsEnabled && this.controls.isRotate) {
			if(!lastRotation) {
				lastRotation = this.controls.mesh.rotation.y;
				return;
			}
			const curRotation = this.controls.mesh.rotation.y;
			if (lastRotation !== curRotation) {
				this.socket.emit('move', {
					state: {
						position: this.controls.mesh.position,
						rotation: {
							y: this.controls.mesh.rotation.y,
						}
					}
				});
				lastRotation = curRotation;
			}
		}
	}

	updateChat() {
		if (this.controls.sendChatMessage) {
			const input = document.getElementById('input');
			if (input.value.length) {
				this.socket.emit('send message', {
					text: input.value,
					nickname: this.socket.nickname
				});
				input.value = '';
				this.controls.sendChatMessage = false;
			}
		}
	}
}

