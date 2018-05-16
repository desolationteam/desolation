import * as THREE from 'three';

import PointerLockControls from './PointerLockControls';
import MD2Character from './Character';

let config = {
	body: 'ratamahatta.md2',
	skins: [ 'ratamahatta.png', 'ctf_b.png', 'ctf_r.png', 'dead.png', 'gearwhore.png' ],
	weapons:  [ [ 'weapon.md2', 'weapon.png' ],
		[ 'w_bfg.md2', 'w_bfg.png' ],
		[ 'w_blaster.md2', 'w_blaster.png' ],
		[ 'w_chaingun.md2', 'w_chaingun.png' ],
		[ 'w_glauncher.md2', 'w_glauncher.png' ],
		[ 'w_hyperblaster.md2', 'w_hyperblaster.png' ],
		[ 'w_machinegun.md2', 'w_machinegun.png' ],
		[ 'w_railgun.md2', 'w_railgun.png' ],
		[ 'w_rlauncher.md2', 'w_rlauncher.png' ],
		[ 'w_shotgun.md2', 'w_shotgun.png' ],
		[ 'w_sshotgun.md2', 'w_sshotgun.png' ]
	]
};

export default class Player {
	constructor(socket, scene, camera) {
		this.kek = new MD2Character();
		this.kek.scale = 0.4;
		this.kek.loadParts(config);
		this.kek.onLoadComplete(() => {
			this.kek.setSkin(1);
			this.kek.setAnimation(this.kek.meshBody.geometry.animations[1].name);
			this.kek.setWeapon(0);
		});
		this.kek.root.add(camera);
		camera.position.set(0,8,-20);
		camera.rotation.y = Math.PI;
		this.controls = new PointerLockControls(this.kek.root);
		this.controls.getObject().rotation.y = Math.PI;
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
				velocity.z += 1;
			}
			if (movement.backward) {
				velocity.z -= 1;
			}
			if (movement.left){
				velocity.x += 1;
			}
			if (movement.right){
				velocity.x -= 1;
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
