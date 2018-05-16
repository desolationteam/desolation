import * as THREE from 'three';
import io from 'socket.io-client';

import Enemy from './Enemy';
import Player from './Player';

export default class Application {
	constructor(nickname) {
		this.nickname = nickname;
		this.init(nickname);
		this.clock = new THREE.Clock();
		this.render();
	}

	init() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.scene = new THREE.Scene();
		this.otherPlayers = [];
		this.setupRenderer();
		this.setupCamera();
		this.setupLights();
		this.setupFloor();
		this.setupSocket();
		this.player = new Player(this.socket, this.scene, this.camera);
		window.addEventListener('resize', () => this.resize(), false);
	}

	render() {
		const delta = this.clock.getDelta();
		this.player.update(delta);
		this.player.character.update(delta);
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

	setupLights() {
		this.light = new THREE.AmbientLight(0xffffff, 1);
		this.scene.add(this.light);
	}

	setupFloor() {
		const geometry = new THREE.PlaneGeometry(500, 500, 32);
		const texture = new THREE.TextureLoader().load('textures/floor-1.png');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 4, 4 );
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.DoubleSide
		});
		this.floor = new THREE.Mesh(geometry, material);
		this.floor.rotation.x = Math.PI / 2;
		this.floor.position.x = -50;
		this.floor.position.z = -50;
		this.floor.position.y = 0;
		this.scene.add(this.floor);
	}

	setupSocket() {
		this.socket = io.connect();
		this.socket.nickname = this.nickname;

		this.socket.on('create player', data => {
			const player = new Enemy(this.scene, data.state);
			player.index = data.index;
			this.otherPlayers.push(player);
		});

		this.socket.on('update player', data => {
			this.otherPlayers.forEach(player => {
				if(player.index === data.index) {
					player.update(data.state);
				}
			});
		});

		this.socket.on('remove player', index => {
			const i = this.otherPlayers.findIndex(player => player.index === index);
			this.scene.remove(this.otherPlayers[i].character.root);
			this.otherPlayers.splice(i, 1);
		});

		this.socket.on('receive message', data => {
			const msg = document.createElement('p');
			msg.innerHTML=data.nickname + ': ' + data.message;
			document.getElementById('messages')
				.appendChild(msg);
		});
	}

	resize() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.width, this.height);
	}

}
