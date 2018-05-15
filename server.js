const THREE = require('three');

const express = require('express');
const compression = require('compression');
const app = express();
app.use(express.static('dist'));
app.use(compression());
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

let playersCount = 0;

const connections = [];

server.listen(3000);

io.on('connection', socket => {
	playersCount++;
	socket.index = playersCount;
	connections.push(socket);
	setListeners(socket);
});

function setListeners(socket) {
	socket.on('disconnect', () => {
		connections.splice(connections.findIndex(connection => connection.index === socket.index), 1);
		connections.forEach(connection => connection.emit('remove player', socket.index));
	});

	socket.on('current position', data => {
		socket.playerData = Object.assign({}, data, {index: socket.index});
		const filtered = connections.filter(connection => connection.index !== socket.index);
		filtered.forEach(connection => connection.emit('update player', socket.playerData));
	});

	socket.on('new player', data => {
		socket.playerData = Object.assign({}, data, {index: socket.index});
		const filtered = connections.filter(connection => connection.index !== socket.index);
		filtered.forEach(connection => {
			connection.emit('create player', socket.playerData);
		});
		const playersData = filtered.map(player => player.playerData);

		playersData.forEach(data => {if (data) socket.emit('create player', data);});
	});
	socket.on('move forward', () => {
		const velocity = new THREE.Vector3();
		velocity.z -= 2;

		socket.emit('update position', velocity);
	});

	socket.on('move backward', () => {
		const velocity = new THREE.Vector3();
		velocity.z += 2;

		socket.emit('update position', velocity);
	});

	socket.on('move left', () => {
		const velocity = new THREE.Vector3();
		velocity.x -= 2;

		socket.emit('update position', velocity);
	});

	socket.on('move right', () => {
		const velocity = new THREE.Vector3();
		velocity.x += 2;

		socket.emit('update position', velocity);
	});

}
