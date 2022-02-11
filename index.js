require('dotenv').config();
const express = require('express')
const cors = require('cors')

// util
const { connect } = require('./db/models')
const { login, createAccount, set_new_refresh_uuid } = require('./auth/util')
const { create_access_token, create_refresh_token, create_new_access_and_refresh_tokens, verify_access_token } = require('./auth/jwt')
const { create_whatsapp_client } = require('./whatsapp/whatsapp')

// init
connect(process.env.DB_URI)
const app = express()
app.use(cors())
app.use(express.json())

// setup socket io
// listening
const port = process.env.PORT || 5000
const server = app.listen(port, () => {
    console.log(`listening to http://127.0.0.1:${port}`);
})
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

// authentication middleware
const authenticate = (req, res, next) => {
    if (!req.headers.authorization)
        return res.status(400).json({ success: false, error: 'No credentials sent!' });

    try {
        const bearer_token = req.headers.authorization
        const access_token = bearer_token.split(' ')[1]

        const payload = verify_access_token(access_token)
        if (!payload)
            return res.status(401).json({ success: false, error: 'invalid access token' })

        req.username = payload.username
        next()

    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
}

/*
endpoints
*/
// create account
app.post('/api/auth/register', async (req, res) => {
    const { username, pwd } = req.body;

    // check for missing fields
    if (!username || !pwd)
        return res.status(400).json({ success: false, error: "fields missing" })


    let newUser;
    // create the user
    try {
        newUser = await createAccount(username, pwd)
        if (!newUser)
            return res.status(409).json({ success: false, error: `username (${username}) already exists` })
    } catch (error) {
        return res.status(500).json({ success: false, error: "Some error happened" })
    }


    // create access token
    const access_token = create_access_token({ username })
    if (!access_token)
        return res.status(500).json({ success: false, error: "Some error happened" })

    // create refresh token
    const refresh_token = create_refresh_token({
        username,
        refresh_token_uuid: newUser.refresh_token_uuid // the uuid of the refresh token
    })

    if (!refresh_token)
        return res.status(500).json({ success: false, error: "Some error happened" })


    // succses response
    res.status(201).json({
        success: true,
        username,
        access_token,
        refresh_token,
    });
})

// loginverify_access_token
app.post('/api/auth/login', async (req, res) => {
    const { username, pwd } = req.body;

    if (!username || !pwd)
        return res.status(400).json({ success: false, error: "fields missing" })

    const user = await login(username, pwd)
    if (!user)
        return res.status(403).json({ success: false, error: "wrong username, password, or both" })

    // create access token
    const access_token = create_access_token({ username })
    if (!access_token)
        return res.status(500).json({ success: false, error: "Some error happened" })

    // create refresh token
    const refresh_token = create_refresh_token({
        username,
        refresh_token_uuid: user.refresh_token_uuid // the uuid of the refresh token
    })
    if (!refresh_token)
        return res.status(500).json({ success: false, error: "Some error happened" })


    res.status(201).json({
        success: true,
        username,
        access_token,
        refresh_token,
    });
})

// login to whatsapp
app.get('/whatsapp/login', authenticate, (req, res) => {

})

// refresh
// creates new access to refersh tokens 
app.post('/api/auth/refresh', async (req, res) => {
    const { token } = req.body;
    if (!token)
        return res.status(400).json({ success: false, error: 'token field is missing' })

    const [new_access_token, new_refresh_token] = await create_new_access_and_refresh_tokens(token)

    if (!new_access_token || !new_refresh_token)
        return res.status(401).json({ success: false, error: 'expired refresh token' })

    res.status(200).json({
        success: true,
        new_access_token,
        new_refresh_token
    })
})


// logout
// chages the refresh token uuid of the user to invalidate the old refresh tokens
app.post('/api/auth/logout', authenticate, async (req, res) => {
    const ok = await set_new_refresh_uuid(req.username)

    if (!ok)
        return res.status(500).json({ success: false, error: 'Some error happened' })

    res.status(200).json({ success: true })

})

io.on('connection', async (socket) => {
    console.log('a user connected');
    let wa_client = null;
    socket.on('whatsapp-login', username => {
        // init whatsapp client
        console.log(username);
        console.log('trying to login');
        wa_client = create_whatsapp_client(socket, username)
    })

    socket.on('disconnect', async () => {
        console.log('user disconnected');
        if (wa_client !== null) {
            wa_client.destroy();
            console.log('client destroied');
        }
    })

    socket.on('wa get chats', async ({ offset, limit }) => {
        console.log('chats requested');
        let chats = await wa_client.getChats()
        chats = chats.slice(offset, offset + limit);

        chats = await Promise.all(chats.map(async c => {

            const last_message = (await c.fetchMessages({ limit: 1 }))[0];
            const contact = await c.getContact();
            return {
                ...c,
                last_message: last_message !== undefined ? {
                    ...last_message,
                    type: last_message.type === 'ptt' ? 'recording' : last_message.type
                } : null,
                img: await contact.getProfilePicUrl().catch(_ => ''),
            }
        }
        ))

        socket.emit('wa chats sent', chats)
    })

    socket.on('wa chat selected', async ({chat_id, limit}) => {
        console.log(`${chat_id} requested`);
        const chat = await wa_client.getChatById(chat_id);
        const contact = await chat.getContact();
        contact.img = await contact.getProfilePicUrl().catch(_ => '');
        console.log(contact.img);
        const messages = await chat.fetchMessages({limit:limit})

        const data = {
            messages,
            chat_id,
            contact,
        }

        socket.emit('wa chat messages', data)
    })
});


