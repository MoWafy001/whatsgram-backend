require('dotenv').config();
const express = require('express')
const cors = require('cors')

// util
const { connect } = require('./db/models')
const { login, createAccount } = require('./auth/util')
const { create_access_token, create_refresh_token } = require('./auth/jwt')


// init
connect(process.env.DB_URI)
const app = express()
app.use(cors())
app.use(express.json())


/*
endpoints
*/
// create account
app.post('/api/auth/register', async (req, res) => {
    const { username, pwd } = req.body;

    // check for missing fields
    if (!username || !pwd)
        return res.status(400).json({ success: false, error: "fields missing" })


    // create the user
    try {
        const newUser = await createAccount(username, pwd)
        if (!newUser)
            return res.status(409).json({ success: false, error: `username (${username}) already exists` })
    } catch (error) {
        user
        return res.status(500).json({ success: false, error: "Some error happened" })
    }


    // create access token
    const access_token = create_access_token({ username })
    if (!access_token)
        return res.status(500).json({ success: false, error: "Some error happened" })

    // create refresh token
    const refresh_token = create_refresh_token({ username })
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

// login
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
    const refresh_token = create_refresh_token({ username })
    if (!refresh_token)
        return res.status(500).json({ success: false, error: "Some error happened" })



    res.status(201).json({
        success: true,
        username,
        access_token,
        refresh_token,
    });
})

// listening
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`listening to http://127.0.0.1:${port}`);
})