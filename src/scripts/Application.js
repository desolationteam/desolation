import * as THREE from 'three';

export default class Application {
	constructor() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.init();
		this.render();
	}

	init() {
		this.scene = new THREE.Scene();
		this.setupRenderer();
		this.setupCamera();
		this.setupLights();

		window.addEventListener('resize', () => this.resize(), false);
	}

	render() {
		// this.controls.update();
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(() => this.render());
	}

	setupRenderer() {
		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setPixelRatio(window.devicePixelRatio || 1);
		this.renderer.setSize(this.width, this.height);
		this.renderer.shadowMap.enabled = true;
		this.renderer.setSize(this.width, this.height);
		document.body.appendChild(this.renderer.domElement);
	}

	setupCamera() {
		this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
		this.camera.position.set(30, 30, 100);
	}

	resize() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.width, this.height);
	}

	setupLights() {
		this.light = new THREE.AmbientLight(0xffffff, 1);
		this.scene.add(this.light);
	}

	// setupFloor() {
	// const geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
	// const texture = new THREE.TextureLoader().load(checkerboard);
	// texture.wrapS = THREE.RepeatWrapping;
	// texture.wrapT = THREE.RepeatWrapping;
	// texture.repeat.set(4, 4);
	// const material = new THREE.MeshBasicMaterial({
	// 	side: THREE.DoubleSide,
	// 	map: texture,
	// });
	// const floor = new THREE.Mesh(geometry, material);
	// floor.position.y = -0.5;
	// floor.rotation.x = Math.PI / 2;
	// this.scene.add(floor);
	// }

	// setupControls() {
	// 	// this.controls = new OrbitControls(this.camera, this.renderer.domElement);
	// 	// this.controls.enabled = true;
	// 	// this.controls.maxDistance = 1500;
	// 	// this.controls.minDistance = 0;
	// 	// this.controls.autoRotate = true;
	// }
}
