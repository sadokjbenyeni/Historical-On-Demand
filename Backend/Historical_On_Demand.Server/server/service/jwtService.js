const jwtManager = require("jsonwebtoken");


module.exports.createTokentoUser = (user) => {
    return jwtManager.sign(user, global.environment.jwtCredentials.secret, global.environment.jwtCredentials.options);
}
module.exports.verifyToken = (token) => {
    return jwtManager.verify(token, global.environment.jwtCredentials.secret)
}
module.exports.decodeToken = (token) => {
    return jwtManager.decode(token, global.environment.jwtCredentials.secret);
}