const su = require('./socket_util')

const handel_whatsapp_socket = (client, socket) => {

    socket.on('whatsapp-request-chats', su.handel_request_chats(client, socket))
    socket.on('whatsapp-request-chat-messages', su.handel_request_chat_messages(client, socket))
    socket.on('whatsapp-send-text', su.handel_send_text(client))
    socket.on('whatsapp-send-image', su.handel_send_image(client))

} 

module.exports = {handel_whatsapp_socket}