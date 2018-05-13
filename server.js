const THREE = require('three');

const express = require('express');
const app = express();
app.use(express.static('dist'));
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

let connections = [];

server.listen(3000);

io.on('connection', socket => {
	connections.push(socket);

	socket.on('disconnect', () => {
		connections.splice(connections.indexOf(socket), 1);
	});

	socket.on('new player', data => {
		connections.indexOf(socket).player = data;
	});

	socket.on('move forward', () => {
		let delta = 0.075;

		let velocity = new THREE.Vector3();
		// Set the velocity.x and velocity.z using the calculated time delta
		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		// As velocity.y is our "gravity," calculate delta
		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		velocity.z -= 400.0 * delta;

		socket.emit('update position', velocity);
	});

	socket.on('move backward', () => {
		let delta = 0.075;

		let velocity = new THREE.Vector3();
		// Set the velocity.x and velocity.z using the calculated time delta
		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		// As velocity.y is our "gravity," calculate delta
		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		velocity.z += 400.0 * delta;

		socket.emit('update position', velocity);
	});

});

