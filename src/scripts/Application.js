import * as THREE from 'three';
import io from 'socket.io-client';

import Enemy from './Enemy';
import Player from './Player';

const raycasterCenter = new THREE.Raycaster();
const directionCenter = new THREE.Vector3(0, 0, -1);
const raycasterBottom = new THREE.Raycaster();
const directionBottom = new THREE.Vector3(0, 0, -1);

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
		this.isCollision = false;
		this.initRenderer();
		this.initCamera();
		this.initLights();
		this.initFloor();
		this.initSocket();
		this.initSounds();
		this.initUserInterface();
		this.player = new Player(this.socket, this.scene, this.camera);
		setTimeout(() => {
			this.player.character.setWeapon(0);
		}, 500);
		window.addEventListener('resize', () => this.resize(), false);
	}

	checkCollision() {
		raycasterCenter.setFromCamera( directionCenter, this.camera );
		const intersects = raycasterCenter.intersectObjects(this.scene.children);
		this.isCollision = !!intersects[0] && intersects[0].distance <= 35;
	}

	render() {
		const delta = this.clock.getDelta();
		this.checkCollision();
		this.player.update(delta, this.isCollision);
		this.player.character.update(delta);
		this.otherPlayers.forEach(player => player.character.update(delta));
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(() => this.render());
	}

	initRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		this.renderer.setPixelRatio(window.devicePixelRatio || 1);
		this.renderer.setSize(this.width, this.height);
		this.renderer.shadowMap.enabled = true;
		this.renderer.setSize(this.width, this.height);
		const body = document.body;
		body.innerHTML = '<div class ="aim"></div><progress id="health" class="healthBar" max="100" value="100"></progress>';
		body.appendChild(this.renderer.domElement);
	}

	initCamera() {
		this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 1000);
	}

	initLights() {
		this.light = new THREE.AmbientLight(0xffffff, 1);
		this.scene.add(this.light);
	}

	initFloor() {
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

		let geometr = new THREE.BoxGeometry(40, 20, 40);
		let materia = new THREE.MeshBasicMaterial({color: 0x0000ff});
		this.Box = new THREE.Mesh(geometr, materia);
		this.Box.position.set(-50, 10, -50);
		geometr = new THREE.BoxGeometry(20, 30, 30);
		materia = new THREE.MeshBasicMaterial({color: 0xff0000});
		this.Box1 = new THREE.Mesh(geometr, materia);
		this.Box1.position.set(-10, 10, -10);
		geometr = new THREE.BoxGeometry(40, 40, 50);
		materia = new THREE.MeshBasicMaterial({color: 0x00ff00});
		this.Box2 = new THREE.Mesh(geometr, materia);
		this.Box2.position.set(-100, 10, -50);
		this.scene.add(this.Box);
		this.scene.add(this.Box1);
		this.scene.add(this.Box2);
	}

	initSounds() {
		this.sounds = {};
		this.announceSounds = [];
		let listener = new THREE.AudioListener();
		let loadingManager = new THREE.LoadingManager();
		let audioLoader = new THREE.AudioLoader(loadingManager);
		this.sounds.soundShoot = new THREE.Audio(listener);
		this.sounds.soundGlobal = new THREE.Audio(listener);
		this.sounds.soundAnnounce1 = new THREE.Audio(listener);
		this.sounds.soundAnnounce2 = new THREE.Audio(listener);
		this.sounds.soundAnnounce3 = new THREE.Audio(listener);
		this.sounds.soundAnnounce4 = new THREE.Audio(listener);
		audioLoader.load('sounds/outOfBattleSound.mp3', (buffer) => {
			this.sounds.soundGlobal.setBuffer(buffer);
			this.sounds.soundGlobal.setLoop(true);
			this.sounds.soundGlobal.setVolume(0.2);
			this.sounds.soundGlobal.play();
		});
		audioLoader.load('sounds/rocketShot.mp3', (buffer) => {
			this.sounds.soundShoot.setBuffer(buffer);
			this.sounds.soundShoot.setVolume(1);
		});
		audioLoader.load('sounds/humiliation.mp3', (buffer) => {
			this.sounds.soundAnnounce1.setBuffer(buffer);
			this.sounds.soundAnnounce1.setVolume(0.2);
			this.announceSounds.push(this.sounds.soundAnnounce1);
		});
		audioLoader.load('sounds/excellent.mp3', (buffer) => {
			this.sounds.soundAnnounce2.setBuffer(buffer);
			this.sounds.soundAnnounce2.setVolume(0.2);
			this.announceSounds.push(this.sounds.soundAnnounce2);
		});
		audioLoader.load('sounds/holyshit.mp3', (buffer) => {
			this.sounds.soundAnnounce3.setBuffer(buffer);
			this.sounds.soundAnnounce3.setVolume(0.2);
			this.announceSounds.push(this.sounds.soundAnnounce3);
		});
		audioLoader.load('sounds/perfect.mp3', (buffer) => {
			this.sounds.soundAnnounce4.setBuffer(buffer);
			this.sounds.soundAnnounce4.setVolume(0.2);
			this.announceSounds.push(this.sounds.soundAnnounce4);
		});
	}

	initSocket() {
		this.socket = io.connect();
		this.socket.nickname = this.nickname;

		this.socket.on('create player', data => {
			const player = new Enemy(this.scene, data.state, data.nickname);
			player.index = data.index;
			player.nickname = data.nickname;
			setTimeout(() => {
				player.character.setWeapon(0);
			}, 500);
			this.otherPlayers.push(player);
		});

		this.socket.on('update player', data => {
			this.otherPlayers.forEach(player => {
				if(player.index === data.index) {
					player.update(data.state);
				}
			});
		});

		this.socket.on('hit player', data => {
			if (this.socket.nickname !== data.enemyName) {
				const i = this.otherPlayers.findIndex(player => player.nickname === data.enemyName);
				this.otherPlayers[i].hitBox.health -= data.damage;
			} else {
				this.player.health -= data.damage;
				document.getElementById('health').value = this.player.health;
			}
		});

		this.socket.on('kill player', data => {
			if (this.socket.nickname !== data.enemyName) {
				const i = this.otherPlayers.findIndex(player => player.nickname === data.enemyName);
				this.scene.remove(this.otherPlayers[i].character.root);
				this.scene.remove(this.otherPlayers[i].hitBox);
				setTimeout(() => {
					this.otherPlayers[i].hitBox.health = 100;
					this.scene.add(this.otherPlayers[i].character.root);
					this.scene.add(this.otherPlayers[i].hitBox);
				}, 5000);
			} else {
				this.scene.remove(this.player.controls.mesh);
				this.player.controls.controlsEnabled = false;
				document.getElementById('health').value = 0;
				// todo: you can still move if you dead
				setTimeout(() => {
					this.player.health = 100;
					this.player.controls.controlsEnabled = true;
					this.scene.add(this.player.controls.mesh);
					document.getElementById('health').value = this.player.health;
				}, 5000);
			}
			this.announceSounds[Math.floor(Math.random() * 4)].play();
		});

		this.socket.on('remove player', index => {
			const i = this.otherPlayers.findIndex(player => player.index === index);
			this.scene.remove(this.otherPlayers[i].character.root);
			this.otherPlayers.splice(i, 1);
		});

		this.socket.on('receive message', data => {
			const message = document.createElement('p');
			message.setAttribute('class', 'chat__message');
			const nickname = document.createElement('span');
			nickname.setAttribute('class', 'chat__nickname');
			const text = document.createElement('span');
			if (data.type === 'message') {
				nickname.innerHTML = data.nickname + ': ';
				text.setAttribute('class', 'chat__text');
				text.innerHTML = data.text;
			}
			else if (data.type === 'connect') {
				nickname.innerHTML = data.nickname;
				text.setAttribute('class', 'chat__server');
				text.innerHTML = ' has joined the game';
			}
			else if (data.type === 'death') {
				nickname.innerHTML = data.nickname;
				text.setAttribute('class', 'chat__server');
				text.innerHTML = ' has been killed by ' + data.killer;
			}
			else if (data.type === 'disconnect') {
				nickname.innerHTML = data.nickname;
				text.setAttribute('class', 'chat__server');
				text.innerHTML = ' has left the game';
			}
			message.appendChild(nickname);
			message.appendChild(text);
			document.getElementById('messages').appendChild(message);
		});

		this.socket.on('receive connection message', data => {
			const message = document.createElement('p');
			message.setAttribute('class', 'chat__message');
			const nickname = document.createElement('span');
			nickname.setAttribute('class', 'chat__nickname');

			document.getElementById('messages').appendChild(message);
		});
	}

	initUserInterface() {
		const body = document.body;

		const chat = document.createElement('div');
		chat.setAttribute('class', 'chat');

		const chatMessages = document.createElement('div');
		chatMessages.setAttribute('class', 'chat__messages');
		chatMessages.setAttribute('id', 'messages');

		const chatInput = document.createElement('input');
		chatInput.setAttribute('class', 'chat__input');
		chatInput.setAttribute('id', 'input');
		chatInput.setAttribute('type', 'text');
		chatInput.setAttribute('disabled', 'disabled');

		chat.appendChild(chatMessages);
		chat.appendChild(chatInput);
		body.appendChild(chat);

		const overlay = document.createElement('div');
		overlay.setAttribute('id', 'overlay');
		overlay.innerHTML = 'CLICK TO ENABLE CONTROLS';
		body.appendChild(overlay);
	}

	resize() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.width, this.height);
	}

}
