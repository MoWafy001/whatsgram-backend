// getting the list of chats
const handel_request_chats = (client, socket) => {
    return async () => {
        let chats = await client.getChats();
        chats = await Promise.all(chats.map(async chat => {
            const chat_contact = await chat.getContact();
            const profile_picture_url = await chat_contact.getProfilePicUrl().catch(_ => '');
            const last_message = (await chat.fetchMessages({ limit: 1 }))[0];
            const data = {
                chat,
                last_message,
                profile_picture_url,
            }
            return data
        }))
        socket.emit('whatsapp-request-chats-done', chats)
    }
}


// getting the messages of a chat
const handel_request_chat_messages = (client, socket) => {
    return async chat_id => {
        console.log(`${chat_id} requested`);
        let chat = await client.getChatById(chat_id);
        let messages = await chat.fetchMessages({ limit: 100 });
        messages = await Promise.all(messages.map(async m => {
            if(m.type === 'sticker' || m.type == 'image')
                m.media = await m.downloadMedia()

            return m
        }))
        socket.emit('whatsapp-request-chat-messages-done', messages)
    }
}


// exports
module.exports = {
    handel_request_chats,
    handel_request_chat_messages,
}