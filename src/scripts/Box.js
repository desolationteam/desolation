import * as THREE from 'three';

export default class Box {
	constructor(scene, data) {
		const geometry = new THREE.BoxGeometry(5, 5, 5);
		const material = new THREE.MeshNormalMaterial();
		this.mesh = new THREE.Mesh(geometry, material);
		this.mesh.position.y = data.position.y;
		this.mesh.position.x = data.position.x;
		this.mesh.position.z = data.position.z;
		// this.mesh.rotation.y = data.rotation._y;
		// this.mesh.rotation.x = data.rotation._x;
		// this.mesh.rotation.z = data.rotation._z;
		scene.add(this.mesh);
	}

	update(data) {
		console.log('update');
		this.mesh.position.y = data.position.y;
		this.mesh.position.x = data.position.x;
		this.mesh.position.z = data.position.z;
	}
}
