var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.use('/buttonapp/puzzle', express.static('buttonapp_puzzle'))

var user_number;
var score = 0;
var buttonapp = io.of('/buttonapp');
buttonapp.on('connection', function(socket){
	console.log('socket connected:\nsocketData: ' + socket);
	
	if(user_number)
		socket.emit('change', user_number);
	
	socket.on('change', function(new_value) {
		console.log('change', new_value);
		user_number = new_value;
		socket.broadcast.emit('change', new_value);
	});

	socket.on('game_end', function() {
		buttonapp.emit('game_end');
		buttonapp.emit('scores', score);
	});

	socket.on('game_start', function(){
		score = 0;
		buttonapp.on('scores', score);
	});

	socket.on('add_point', function(points_to_add){
		score += points_to_add;
		buttonapp.emit('scores', score);
	});

	socket.on('subtract_point', function(){
		score -= 1;
		buttonapp.emit('scores', score);
	});

	socket.on('reset', function(){
		scores = {};
		buttonapp.emit('scores', score);
	});
});


http.listen(3000, function(){
	console.log('listening on *:3000');
});
