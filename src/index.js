'use strict';

const THREE = require('three');
const FBXLoader = require('three-fbx-loader');

const loader = new FBXLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;


const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff);
light.position.set(10, 0 ,10);
scene.add(light);

loader.load('./path/to/model.fbx', function (object3d) {
	scene.add(object3d);
});

// let meshFloor = new THREE.Mesh(
// 	new THREE.PlaneGeometry(100, 100, 10, 10),
// 	new THREE.MeshPhongMaterial({
// 		color: 0xff0000,
// 		side: THREE.DoubleSide,
// 	})
// );
// meshFloor.position.set(0, 0, 0);
// meshFloor.rotation.x += Math.PI / 2;
// meshFloor.receiveShadow = true;
// scene.add(meshFloor);

const animate = function () {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render(scene, camera);
};

animate();

