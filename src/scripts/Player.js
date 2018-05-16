import * as THREE from 'three';

import Controls from './Controls';
import MD2Character from './Character';
import { config } from './Constants';

let lastRotation;

export default class Player {
	constructor(socket, scene, camera) {
		this.character = new MD2Character();
		this.character.scale = 0.4;
		this.character.loadParts(config);
		this.character.onLoadComplete(() => {
			this.character.setSkin(1);
			this.character.setAnimation(this.character.meshBody.geometry.animations[1].name);
			this.character.setWeapon(0);
		});
		this.character.root.add(camera);
		camera.position.set(0,8,-20);
		camera.rotation.y = Math.PI;
		this.controls = new Controls(this.character.root);
		scene.add(this.controls.mesh);
		this.socket = socket;
		this.socket.emit('new player', {
			state: {
				position: this.controls.mesh.position,
				rotation: this.controls.mesh.rotation
			}
		});
	}

	update(){
		this.updateMotion();
		this.updateRotation();
	}

	updateRotation() {
		if (this.controls.controlsEnabled) {
			if (!lastRotation) {
				lastRotation = {};
				lastRotation.y = this.controls.mesh.rotation.y;
				lastRotation.x = this.controls.pitchObject.rotation.x;
				return;
			}
			let currentRotation = {};
			currentRotation.y = this.controls.mesh.rotation.y;
			currentRotation.x = this.controls.pitchObject.rotation.x;
			if(lastRotation.x !== currentRotation.x || lastRotation._y !== currentRotation.y) {
				this.socket.emit('move', {
					state: {
						position: this.controls.mesh.position,
						rotation: {
							x: currentRotation.x,
							y: currentRotation.y,
						}
					}
				});
				lastRotation = currentRotation;
			}
		}
	}

	updateMotion() {
		if (this.controls.controlsEnabled) {
			let movement = this.controls.movement;

			if (movement.forward || movement.backward || movement.left || movement.right) {
				const velocity = new THREE.Vector3();
				if (movement.forward) {
					velocity.z += 1;
				}
				if (movement.backward) {
					velocity.z -= 1;
				}
				if (movement.left) {
					velocity.x += 1;
				}
				if (movement.right) {
					velocity.x -= 1;
				}
				if (velocity.x) {
					this.controls.mesh.translateX(velocity.x);
				}
				if (velocity.y) {
					this.controls.mesh.translateY(velocity.y);
				}
				if (velocity.z) {
					this.controls.mesh.translateZ(velocity.z);
				}
				if (this.controls.mesh.position.y < 10) {
					velocity.y = 0;
					this.controls.mesh.position.y = 10;
				}

				this.socket.emit('move', {
					state: {
						position: this.controls.mesh.position,
						rotation: {}
					}
				});
			}
		}
	}
}
