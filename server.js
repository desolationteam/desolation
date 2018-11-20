const path = require('path');
const express = require('express');
const compression = require('compression');
const socketIO = require('socket.io');
const server = require('http');

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));
app.use(compression());

server.createServer(app);
const io = socketIO(server);
server.listen(process.env.PORT || 5000);

const connections = [];

let amountOfPlayers = 0;

io.on('connection', socket => {
	socket.index = ++amountOfPlayers;
	connections.push(socket);
	setListeners(socket);
});

function setListeners(socket) {
	socket.on('new player', data => {
		io.emit('receive message', { type: 'connect', nickname: data.nickname });
		socket.playerData = Object.assign({}, data, { index: socket.index });
		connections.filter(connection => connection.index !== socket.index)
			.forEach(connection => connection.emit('create player', socket.playerData))
			.map(player => player.playerData)
			.forEach(data => socket.emit('create player', data));
	});

	socket.on('enemy hitted', data => {
		connections.filter(connection => connection.index !== socket.index)
			.forEach(connection => connection.emit('hit player', data));
	});

	socket.on('enemy death', data => {
		io.emit('receive message', { type: 'death', nickname: data.enemyName, killer: data.killer });
		connections.filter(connection => connection.index !== socket.index)
			.forEach(connection => connection.emit('kill player', data));
	});

	socket.on('move', data => {
		socket.playerData = Object.assign({}, data, { index: socket.index });
		connections.filter(connection => connection.index !== socket.index)
			.forEach(connection => connection.emit('update player', socket.playerData));
	});

	socket.on('send message', data => {
		connections.forEach(connection => connection.emit('receive message', { type: 'message', nickname: data.nickname, text: data.text }));
	});

	socket.on('disconnect', () => {
		io.emit('remove player', socket.index);
		socket.playerData && socket.playerData.nickname && io.emit('receive message', { type: 'disconnect', nickname: socket.playerData.nickname });
		connections.splice(connections.findIndex(connection => connection.index === socket.index), 1);
	});
}
