import * as THREE from 'three';
import PointerLockControls from './PointerLockControls';
import io from 'socket.io-client';


export default class Player {
	constructor(scene, camera) {
		const geometry = new THREE.BoxGeometry(5, 5, 5);
		const material = new THREE.MeshNormalMaterial();
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.add(camera);
		camera.position.set(0,8,20);
		this.controls = new PointerLockControls(this.mesh);
		scene.add(this.controls.getObject());

		this.socket = io.connect();
		this.socket.emit('new player', {
			position: this.controls.getObject().position,
			rotation: this.controls.getObject().rotation
		});

		this.socket.on('update position', velocity => {
			// Update the position using the changed delta
			this.controls.getObject().translateX(velocity.x);
			this.controls.getObject().translateY(velocity.y);
			this.controls.getObject().translateZ(velocity.z);

			// Prevent the camera/player from falling out of the 'world'
			if (this.controls.getObject().position.y < 10) {
				velocity.y = 0;
				this.controls.getObject().position.y = 10;
			}
		});
	}

	update() {
		// this.updateControls();
		if (this.controls.moveForward) {
			this.socket.emit('move forward');
		}
		if (this.controls.moveBackward) {
			this.socket.emit('move backward');
		}
		if (this.controls.moveLeft){
			this.socket.emit('move left');
		}
		if (this.controls.moveRight){
			this.socket.emit('move right');
		}
	}

}
