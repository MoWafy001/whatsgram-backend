const {MessageMedia} = require('whatsapp-web.js')

// getting the list of chats
const handel_request_chats = (client, socket, removeTimeout) => {
    return async () => {
        removeTimeout()
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
            m.contact = await m.getContact()

            if (m.hasMedia) {
                m.media = await m.downloadMedia()
                if (m.media === undefined || m.media === null)
                    m.hasMedia = false
            }

            return m
        }))
        socket.emit('whatsapp-request-chat-messages-done', messages)
    }
}



// new message created
const handel_message_create = (client, socket) => {
    return async message => {
        if(message.isStatus) return
        
        const chat = await message.getChat()
        console.log('message received');

        message.contact = await message.getContact()

        if (message.hasMedia) {
            message.media = await message.downloadMedia()
            if (message.media === undefined || message.media === null)
                message.hasMedia = false
        }

        socket.emit('whatsapp-message-create', { message, chat })
    }
}


const handel_send_text = (client) => {
    return ({ text, chat }) => {
        client.sendMessage(chat.id._serialized, text)
    }
}

const handel_send_image = (client) => {
    return ({ img_data, chat }) => {
        const mime = img_data.split(',')[0].split(':')[1]
        const data = img_data.split(',')[1]
        const media = new MessageMedia(mime, data, 'image')
        client.sendMessage(chat.id._serialized, media)
    }
}

// exports
module.exports = {
    handel_request_chats,
    handel_request_chat_messages,
    handel_message_create,
    handel_send_text,
    handel_send_image,
}