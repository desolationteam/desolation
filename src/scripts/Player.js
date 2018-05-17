import * as THREE from 'three';

import Controls from './Controls';
import MD2Character from './Character';
import {config} from './Constants';

let lastRotation;

export default class Player {
	constructor(socket, scene, camera) {
		this.character = new MD2Character();
		this.character.scale = 0.4;
		this.character.loadParts(config);
		this.character.root.add(camera);
		this.isAnimated = false;
		camera.position.set(-10, 12, -25);
		camera.rotation.y = Math.PI;
		this.controls = new Controls(this.character.root, camera, scene);
		scene.add(this.controls.mesh);
		this.socket = socket;
		this.socket.emit('new player', {
			state: {
				position: this.controls.mesh.position,
			},
			nickname: socket.nickname
		});
	}

	update(delta) {
		this.updateMotion(delta);
		this.updateRotation();
		this.updateChat();
	}

	updateMotion(delta) {
		const oldPosition = Object.assign({}, this.controls.mesh.position);
		const velocity = new THREE.Vector3();
		velocity.y -= 9.8 * 100.0 * delta;
		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		let movement = this.controls.movement;
		if (this.controls.controlsEnabled) {
			if (movement.forward) {
				velocity.z += 100 * delta;
			}
			if (movement.backward) {
				velocity.z -= 100 * delta;
			}
			if (movement.left) {
				velocity.x += 100 * delta;
			}
			if (movement.right) {
				velocity.x -= 100 * delta;
			}
			if (movement.jump) {
				velocity.y += 150;
				movement.jump = false;
			}
		}
		movement.jump = false;
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
		this.controls.mesh.translateX(velocity.x);
		this.controls.mesh.translateY(velocity.y);
		this.controls.mesh.translateZ(velocity.z);

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
				}
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

