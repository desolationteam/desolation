import * as THREE from 'three';

import Controls from './Controls';

export default class Player {
	constructor(socket, scene, camera) {
		const geometry = new THREE.BoxGeometry(5, 5, 5);
		const material = new THREE.MeshNormalMaterial();
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.add(camera);
		camera.position.set(0,8,20);
		this.controls = new Controls(this.mesh);
		scene.add(this.controls.mesh);
		this.socket = socket;
		this.socket.emit('new player', {
			state: {
				position: this.controls.mesh.position
			}
		});
	}

	update(){
		this.updateMotion();
	}

	updateMotion() {
		if (this.controls.controlsEnabled) {
			let movement = this.controls.movement;

			if (movement.forward || movement.backward || movement.left || movement.right) {
				const velocity = new THREE.Vector3();

				if (movement.forward) {
					velocity.z -= 1;
				}
				if (movement.backward) {
					velocity.z += 1;
				}
				if (movement.left) {
					velocity.x -= 1;
				}
				if (movement.right) {
					velocity.x += 1;
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
						rotation: this.controls.mesh.rotation
					}
				});
			}
		}
	}
}
