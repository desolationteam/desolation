import * as THREE from 'three';
import MD2Character from './Character';
import { config } from './Constants';
import * as THREE from 'three';

const geometry = new THREE.BoxGeometry(10, 25, 10);
const material = new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: 0});
const cube = new THREE.Mesh(geometry, material);

const geometry = new THREE.BoxGeometry(10, 25, 10);
const material = new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: 0});
const cube = new THREE.Mesh(geometry, material);

export default class Enemy {
	constructor(scene, data) {
		this.isAnimated = false;
		this.timer = null;
		this.character = new MD2Character();
		this.character.scale = 0.4;
		this.character.loadParts(config);
		this.character.root.position.y = data.position.y;
		this.character.root.position.x = data.position.x;
		this.character.root.position.z = data.position.z;
		scene.add(this.character.root);
		scene.add(cube);
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
			cube.position.x = this.character.root.position.x;
			cube.position.y = this.character.root.position.y;
			cube.position.z = this.character.root.position.z;
		}
		if (data.rotation) {
			this.character.root.rotation.y = data.rotation.y;
		}
	}
}
