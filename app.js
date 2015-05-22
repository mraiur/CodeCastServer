// Load the TCP Library
var net = require('net');
var fs = require('fs');

// Keep track of the chat clients
var clients = [];
var port = 5005;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    io.emit('msg', {da : 1});
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});


// Start a TCP Server
net.createServer(function (socket) {

    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort

    // Put this new client in the list
    clients.push(socket);

    // Send a nice welcome message and announce
    socket.write("Welcome " + socket.name + "\n");
    broadcast(socket.name + " joined the chat\n", socket);

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
        //broadcast(socket.name + "> " + data, socket);
        broadcast(data, socket);
    });

    // Remove the client from the list when it leaves
    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        broadcast(socket.name + " left the chat.\n");
    });

    // Send a message to all clients
    function broadcast(message, sender) {
        clients.forEach(function (client) {
            // Don't want to send it to sender
            if (client === sender) return;
            client.write(message);
        });
        // Log it to the server output too
        //io.emit('msg', { for: message });
        console.log("===============================\n");
        var msg = message.toString();
        var parts = msg.split('||||');
        if( parts  > 1 ){
            var file = fs.readFileSync(parts[0]);
            io.emit('file', file);
            msg = parts[1];
        }
        console.log(parts, parts.length);
        io.emit('msg', msg);
        process.stdout.write(message)
    }

}).listen(port);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port "+port+"\n");
