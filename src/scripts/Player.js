import * as THREE from 'three';

import PointerLockControls from './PointerLockControls';

export default class Player {
	constructor(socket, scene, camera) {
		const geometry = new THREE.BoxGeometry(5, 5, 5);
		const material = new THREE.MeshNormalMaterial();
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.add(camera);
		camera.position.set(0,8,20);
		this.controls = new PointerLockControls(this.mesh);
		scene.add(this.controls.getObject());
		this.socket = socket;
		this.socket.emit('new player', {
			state: {
				position: this.controls.getObject().position
			}
		});
	}

	update(){
		this.updateMotion();
	}

	updateMotion() {
		let movement = this.controls.movement;

		if (movement.forward || movement.backward || movement.left || movement.right){
			const velocity = new THREE.Vector3();

			if (movement.forward) {
				velocity.z -= 1;
			}
			if (movement.backward) {
				velocity.z += 1;
			}
			if (movement.left){
				velocity.x -= 1;
			}
			if (movement.right){
				velocity.x += 1;
			}

			if (velocity.x) {
				this.controls.getObject().translateX(velocity.x);
			}
			if (velocity.y) {
				this.controls.getObject().translateY(velocity.y);
			}
			if (velocity.z) {
				this.controls.getObject().translateZ(velocity.z);
			}
			if (this.controls.getObject().position.y < 10) {
				velocity.y = 0;
				this.controls.getObject().position.y = 10;
			}

			this.socket.emit('move', {
				state:{
					position: this.controls.getObject().position,
					rotation: this.controls.getObject().rotation
				}
			});
		}
	}
}
