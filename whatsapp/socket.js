const {handel_request_chats} = require('./socket_util')

const handel_whatsapp_socket = (client, socket) => {

    socket.on('whatsapp-request-chats', handel_request_chats(client, socket))

} 

module.exports = {handel_whatsapp_socket}