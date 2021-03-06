const mongoose = require('mongoose');

const connect = uri => {
    mongoose.connect(uri)
}

const User = mongoose.model('users', {
    username: {
        type: String,
        index:true,
        unique: true,
    },
    pwd: String,
    refresh_token_uuid:{
        type: String,
        unique: true
    }
})

module.exports = { connect, User }