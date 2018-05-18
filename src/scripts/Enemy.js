import * as THREE from 'three';
import MD2Character from './Character';
import { config } from './Constants';

export default class Enemy {
	constructor(scene, data, nickname) {
		this.isAnimated = false;
		this.timer = null;
		this.isWeaponSet = false;
		this.character = new MD2Character();
		this.character.scale = 0.4;
		this.character.loadParts(config);
		this.character.root.position.y = data.position.y;
		this.character.root.position.x = data.position.x;
		this.character.root.position.z = data.position.z;
		this.character.root.health = 100;
		// todo: add rotation
		scene.add(this.character.root);
		const geometry = new THREE.BoxGeometry(15, 25, 15);
		const material = new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: 0});
		this.hitBox = new THREE.Mesh(geometry, material);
		this.hitBox.player = this.character.root;
		this.hitBox.nickname = nickname;
		this.hitBox.health = 100;
		this.hitBox.position.x = this.character.root.position.x;
		this.hitBox.position.y = this.character.root.position.y;
		this.hitBox.position.z = this.character.root.position.z;
		scene.add(this.hitBox);
	}

	update(data) {
		if(data.position) {
			if(!data.rotation) {
				clearTimeout(this.timer);
				if (!this.isAnimated) {
					this.character.setAnimation(this.character.meshBody.geometry.animations[1].name);
					this.isAnimated = true;
				}
				this.timer = setTimeout(() => {
					this.character.setAnimation(this.character.meshBody.geometry.animations[0].name);
					this.isAnimated = false;
				}, 110);
			}
			this.character.root.position.y = data.position.y;
			this.character.root.position.x = data.position.x;
			this.character.root.position.z = data.position.z;
			this.hitBox.position.x = this.character.root.position.x;
			this.hitBox.position.y = this.character.root.position.y;
			this.hitBox.position.z = this.character.root.position.z;
		}
		if (data.rotation) {
			this.character.root.rotation.y = data.rotation.y;
		}
	}
}
