var net = require('net');
var fs = require('fs');

var clients = [];
var port = 5005;
var socketPort = 3500;

var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


app.use( express.static(path.join(__dirname, 'bower_components')) );

io.on('connection', function(socket){

    console.log('User connected');

    io.emit('msg', {da : 1});
    socket.on('disconnect', function(){
        console.log('User disconected');
    });
});


http.listen(socketPort, function(){
    console.log('Socket CastServer server listening on *:', socketPort);
});


net.createServer(function (socket) {

    socket.name = socket.remoteAddress + ":" + socket.remotePort

    clients.push(socket);

    socket.on('error', function() {

    });

    socket.write("Welcome " + socket.name + "\n");
    broadcast(socket.name + " joined the chat\n", socket);

    socket.on('data', function (data) {
        broadcast(data, socket);
    });

    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        broadcast(socket.name + " left the chat.\n");
    });

    function broadcast(message, sender) {
        clients.forEach(function (client) {
            if (client === sender) return;
            client.write(message);
        });

        var msg = message+'';
        io.emit('msg', msg);
    }

}).listen(port);

console.log("CastServer server running at port "+port+"\n");
