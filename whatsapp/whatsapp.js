// whatsapp api
const { Client } = require('whatsapp-web.js');




const create_whatsapp_client = (socket, username) => {
    const client = new Client({
        puppeteer: {
            headless: true,
            args: ['--no-sandbox']
        },
        clientId: username
    });
    console.log("client created");

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        socket.emit('WA-QR', qr)
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        socket.emit('whatsapp-ready', 'ready')
    });

    client.on('auth_failure', (message) => {
        console.log(message);
        console.log('auth failed');
    })


    client.initialize()
        .catch(e => console.log(e));
    console.log('started initialization');
    return client
}

module.exports = { create_whatsapp_client }