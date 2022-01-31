const { User } = require('./db/models')

const createAccount = async(username, pwd) => {
    
    try {
        let exists = await User.exists({username})
        if(exists) return false;
        const newUser = User.create({username, pwd})
        return newUser
    } catch (error) {
       console.error(error); 
       return false
    }
}

const login = async(username, pwd) => {
    const user = await User.findOne({username});

    if(!user) return false;

    const password_checks = user.pwd === pwd;
    if(!password_checks) return false

    return user

}

module.exports = {login, createAccount}