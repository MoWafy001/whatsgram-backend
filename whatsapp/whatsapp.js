// whatsapp api
const { Client } = require('whatsapp-web.js');




const create_whatsapp_client = (socket, username) => {
    const client = new Client({clientId: username});

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        socket.emit('whatsapp-qr-sent', qr)
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        socket.emit('whatsapp-ready', 'ready')
    });

    client.initialize();
    return client
}

module.exports = { create_whatsapp_client }