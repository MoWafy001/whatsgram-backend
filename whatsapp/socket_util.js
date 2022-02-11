

const handel_request_chats = (client, socket) => {
    return async () => {
        let chats = await client.getChats();
    
    
        chats = await Promise.all(chats.map(async chat => {
            const chat_contact = await chat.getContact();
            const profile_picture_url = await chat_contact.getProfilePicUrl().catch(_=>'');
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






module.exports={handel_request_chats}