require('dotenv').config();

const fs = require("fs");
const jwt = require('jsonwebtoken');

var privateKey = fs.readFileSync('key/private_key.pem');
var publicKey = fs.readFileSync('key/public_key.pem');

function createApplication() {

    let app = {};

    app.init = function () {}

    app.verifyToken = function (token, identify) {
        try {
            let result = jwt.verify(token, publicKey);
            //console.log(result.identify + " vs " + identify);
            return (result.identify == identify);
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    app.createToken = function (identify) {
        let signOptions = {
            //  expiresIn: "24h",
            algorithm: "RS256" // RSASSA [ "RS256", "RS384", "RS512" ]
        };

        // sign with RSA SHA256

        let token = jwt.sign({
            identify: identify
        }, privateKey, signOptions, {
            algorithm: 'RS256'
        });
        return token;
    }

    return app;
}

exports = module.exports = createApplication;