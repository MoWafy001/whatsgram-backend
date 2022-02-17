// whatsapp api
const e = require('cors');
const { Client } = require('whatsapp-web.js');
const { handel_whatsapp_socket } = require('./socket')
const { handel_message_create } = require('./socket_util')

const create_whatsapp_client = (socket, username, removeTimeout, cl) => {
    let client;

    if (cl === undefined || cl === null)
        client = new Client({
            puppeteer: {
                headless: true,
                args: [
                    "--disable-gpu",
                    "--disable-dev-shm-usage",
                    "--disable-setuid-sandbox",
                    "--no-sandbox", '--no-sandbox'
                ]
            },
            clientId: username
        });
    else
        client = cl.wa_client

    console.log("client created");

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        socket.emit('WA-QR', qr)
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        socket.emit('whatsapp-ready')
    });

    client.on('auth_failure', (message) => {
        console.log(message);
        console.log('auth failed');
    })

    client.on('message_create', handel_message_create(client, socket))


    if (cl === undefined || cl === null) {
        client.initialize()
            .catch(e => console.log(e));
        console.log('started initialization');
    } else socket.emit('whatsapp-ready')

    handel_whatsapp_socket(client, socket, removeTimeout)

    return client
}

module.exports = { create_whatsapp_client }