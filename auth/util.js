const { v4: uuidv4 } = require('uuid')
const { User } = require('../db/models')

const createAccount = async (username, pwd) => {

    try {
        let exists = await User.exists({ username })
        if (exists) return false;
        const newUser = User.create({
            username,
            pwd,
            refresh_token_uuid: uuidv4(),
        })
        return newUser
    } catch (error) {
        console.error(error);
        return false
    }
}

const login = async (username, pwd) => {
    const user = await User.findOne({ username });

    if (!user) return false;

    const password_checks = user.pwd === pwd;
    if (!password_checks) return false

    return user

}

const set_new_refresh_uuid = async username => {
    try {
        const user = await User.findOne({username});
        user.refresh_token_uuid = uuidv4()
        await user.save()

        return true
    } catch (error) {
        return false
    }
}

module.exports = { login, createAccount, set_new_refresh_uuid }