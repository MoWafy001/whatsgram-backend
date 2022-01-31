require('dotenv').config();
const { connect } = require('./db/models')
const { login, createAccount } = require('./auth')
const express = require('express')

connect(process.env.DB_URI)
const app = express()
app.use(express.json())


// endpoints

// create account
app.post('/api/users/create', async (req, res) => {
    const { username, pwd } = req.body;

    if (!username || !pwd)
        return res.status(400).json({ success: false, error: "fields missing" })

    const newUser = await createAccount(username, pwd)
    if (!newUser)
        return res.status(409).json({ success: false, error: `username (${username}) already exists` })

    res.status(201).json({ success: true, username });
})

// login
app.post('/api/users/login', async(req, res) => {
    const { username, pwd } = req.body;

    if (!username || !pwd)
        return res.status(400).json({ success: false, error: "fields missing" })

    const user = await login(username, pwd)
    if (!user)
        return res.status(403).json({ success: false, error: "wrong username, password, or both" })

    res.status(201).json({ success: true, username });
})

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`listening to http://127.0.0.1:${port}`);
})