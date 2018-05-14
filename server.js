const THREE = require('three');

const express = require('express');
const app = express();
app.use(express.static('dist'));
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
	});

	socket.on('current position', data => {
		socket.playerData = data;
		const filtered = connections.filter(connection => connection.index !== socket.index);
		const playersData = filtered.map(player => ({ state: player.playerData, index: player.index }));
		playersData.forEach(data => socket.emit('update player', data));
	});

	socket.on('new player', data => {
		socket.playerData = data;
		const filtered = connections.filter(connection => connection.index !== socket.index);
		filtered.forEach(connection => {
			connection.emit('create player', { state: data, index: connection.index });
		});
		const playersData = filtered.map(player => player.playerData);
		playersData.forEach(data => socket.emit('create player', data));
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
