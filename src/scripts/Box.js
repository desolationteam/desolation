import * as THREE from 'three';

export default class Box {
	constructor() {
		const geometry = new THREE.BoxGeometry(10, 10, 10);
		const material = new THREE.MeshNormalMaterial();
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.y = 10;
		this.mesh.position.x = -50;
		this.mesh.position.z = -50;
	}

	update() {
		this.mesh.rotation.x += 0.02;
		this.mesh.rotation.y += 0.02;
	}
}
