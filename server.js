const path = require('path');
const express = require('express');
const compression = require('compression');
const socketIO = require('socket.io');
const app = express();
app.use(express.static(path.join(__dirname, 'dist')));
app.use(compression());
const server = require('http').createServer(app);
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
	socket.on('new player', data => {
		socket.playerData = Object.assign({}, data, {index: socket.index});
		io.emit('receive message', {
			type: 'connect',
			nickname: socket.playerData.nickname
		});
		const filtered = connections.filter(connection => connection.index !== socket.index);
		filtered.forEach(connection => {
			connection.emit('create player', socket.playerData);
		});
		const playersData = filtered.map(player => {
			if (player.playerData) return player.playerData;
		});
		playersData.forEach(data => socket.emit('create player', data));
	});

	socket.on('enemy hitted', data => {
		const filtered = connections.filter(connection => connection.index !== socket.index);
		filtered.forEach(connection => {
			connection.emit('hit player', data);
		});
	});

	socket.on('enemy death', data => {
		const filtered = connections.filter(connection => connection.index !== socket.index);
		filtered.forEach(connection => {
			connection.emit('kill player', data);
		});
		io.emit('receive message', {
			type: 'death',
			nickname: data.enemyName,
			killer: data.killer,
		});
	});

	socket.on('move', data => {
		socket.playerData = Object.assign({}, data, {index: socket.index});
		const filtered = connections.filter(connection => connection.index !== socket.index);
		filtered.forEach(connection => connection.emit('update player', socket.playerData));
	});

	socket.on('send message', data => {
		connections.forEach(connection => {
			connection.emit('receive message', {
				type: 'message',
				nickname: data.nickname,
				text: data.text
			});
		});
	});

	socket.on('talk', (stream) => {
		const filtered = connections.filter(connection => connection.index !== socket.index);
		filtered.forEach(connection => connection.emit('listen', stream));
	});

	socket.on('disconnect', () => {
		if (socket.playerData && socket.playerData.nickname) {
			const nickname = socket.playerData.nickname;
			io.emit('receive message', {
				type: 'disconnect',
				nickname: nickname
			});
		}
		connections.splice(connections.findIndex(connection => connection.index === socket.index), 1);
		io.emit('remove player', socket.index);
	});
}
