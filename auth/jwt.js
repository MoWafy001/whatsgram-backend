const jwt = require('jsonwebtoken')


// access token env variables
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN;

// refresh token env variables
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;



// methods

// access token
const create_access_token = payload => {
    const token = jwt.sign(
        payload,
        ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    )

    return token
}
const verify_access_token = token => {
    try {
        const payload = jwt.verify(token, ACCESS_SECRET)
        return payload
    } catch (error) {
        return false
    }
}

// refresh token
const create_refresh_token = payload => {
    const token = jwt.sign(
        payload,
        REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    )

    return token
}
const verify_refresh_token = token => {
    try {
        const payload = jwt.verify(token, REFRESH_SECRET)
        return payload
    } catch (error) {
        return false
    }
}

module.exports = {
    create_access_token,
    verify_access_token,
    create_refresh_token,
    verify_refresh_token
}