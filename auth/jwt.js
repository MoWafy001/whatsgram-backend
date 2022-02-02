const jwt = require('jsonwebtoken')
const { User } = require('../db/models')


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

const create_new_access_and_refresh_tokens = async old_refersh_token => {
    try {
        const referh_payload = jwt.verify(old_refersh_token, REFRESH_SECRET)

        const user = await User.findOne({ username: referh_payload.username })
        if (user.refresh_token_uuid !== referh_payload.refresh_token_uuid)
            throw "invalid token"

        const new_access_token = create_access_token({ username: referh_payload.username })
        const new_refresh_token = create_refresh_token({
            username: referh_payload.username,
            refresh_token_uuid: user.refresh_token_uuid // the uuid of the refresh token
        })

        return [new_access_token, new_refresh_token]

    } catch (error) {
        return [null, null]
    }
}

module.exports = {
    create_access_token,
    create_refresh_token,
    create_new_access_and_refresh_tokens,
    verify_access_token,
}