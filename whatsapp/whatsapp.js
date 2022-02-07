// whatsapp api
const { Client } = require('whatsapp-web.js');




const create_whatsapp_client = (socket, username) => {
    const client = new Client({clientId: username});

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        socket.emit('WA-QR', qr)
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        socket.emit('whatsapp-ready', 'ready')
    });

    client.initialize().catch(_ => _);
    return client
}

module.exports = { create_whatsapp_client }