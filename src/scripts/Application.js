import * as THREE from 'three';
import Box from './Box';
import Player from './Player';

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
		this.setupFloor();

		this.box = new Box(this.scene);
		this.player = new Player(this.scene, this.camera);

		window.addEventListener('resize', () => this.resize(), false);
	}

	render() {
		this.player.update();
		this.box.update();

		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(() => this.render());
	}

	setupRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		this.renderer.setPixelRatio(window.devicePixelRatio || 1);
		this.renderer.setSize(this.width, this.height);
		this.renderer.shadowMap.enabled = true;
		this.renderer.setSize(this.width, this.height);
		document.body.appendChild(this.renderer.domElement);
	}

	setupCamera() {
		this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 1000);
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

	setupFloor() {
		const geometry = new THREE.PlaneGeometry(100, 100, 32);
		const material = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide, wireframe: true});
		this.floor = new THREE.Mesh(geometry, material);
		this.floor.rotation.x = Math.PI / 2;
		this.floor.position.x = -50;
		this.floor.position.z = -50;
		this.floor.position.y = 0;
		this.scene.add(this.floor);
	}

}
