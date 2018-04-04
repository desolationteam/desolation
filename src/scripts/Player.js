import * as THREE from 'three';
import PointerLockControls from './PointerLockControls';

export default class Player {
	constructor(scene, camera) {
		const geometry = new THREE.BoxGeometry(5, 5, 5);
		const material = new THREE.MeshNormalMaterial();
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.add(camera);
		camera.position.set(0,8,20);
		this.controls = new PointerLockControls(this.mesh);
		scene.add(this.controls.getObject());
	}

	update() {
		this.updateControls();
	}

	updateControls() {
		let velocity = new THREE.Vector3();
		// Are the controls enabled? (Does the browser have pointer lock?)
		if (this.controls.controlsEnabled) {

			// Save the current time
			// Create a delta value based on current time
			var delta = 0.075;

			// Set the velocity.x and velocity.z using the calculated time delta
			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;

			// As velocity.y is our "gravity," calculate delta
			velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

			if (this.controls.moveForward) {
				velocity.z -= 400.0 * delta;
			}

			if (this.controls.moveBackward) {
				velocity.z += 400.0 * delta;
			}

			if (this.controls.moveLeft) {
				velocity.x -= 400.0 * delta;
			}

			if (this.controls.moveRight) {
				velocity.x += 400.0 * delta;
			}

			// Update the position using the changed delta
			this.controls.getObject().translateX(velocity.x * delta);
			this.controls.getObject().translateY(velocity.y * delta);
			this.controls.getObject().translateZ(velocity.z * delta);

			// Prevent the camera/player from falling out of the 'world'
			if (this.controls.getObject().position.y < 10) {

				velocity.y = 0;
				this.controls.getObject().position.y = 10;

			}

			// Save the time for future delta calculations

		}
	}
}
