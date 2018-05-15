const path = require('path');
const THREE = require('three');
const express = require('express');
const compression = require('compression');
const app = express();
app.use(express.static(path.join(__dirname, 'dist')));
app.use(compression());
const server = require('http').createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server);
server.listen(process.env.PORT || 5000);

let playersCount = 0;
const connections = [];

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

	socket.on('move', (direction) => {
		const velocity = new THREE.Vector3();
		switch (direction) {
			case 'forward':
				velocity.z -= 2;
				break;
			case 'backward':
				velocity.z += 2;
				break;
			case 'left':
				velocity.x -= 2;
				break;
			case 'right':
				velocity.x += 2;
				break;
			default:
				break;
		}
		socket.emit('update position', velocity);
	});
}
