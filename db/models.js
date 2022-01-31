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
    pwd: String
})

module.exports = { connect, User }