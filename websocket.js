const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 8181 });
wss.on('connection', function connection(ws) {
    console.log('client connected');
    ws.on('message', function incoming(message) {
        console.log('received: ', message);
        ws.send('server something');
    });
});