require('dotenv').config();

let redis = require("redis");

const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PASS = process.env.REDIS_PASS

let client = redis.createClient(REDIS_PORT, REDIS_HOST, {
    "auth_pass": REDIS_PASS
});

const DELIMITOR = "@+@+@";

function createApplication() {

    let app = {};

    app.init = function () {}

    app.get = function (type, key, callback) {
        if (key == null) key = "DEFAULT";
        app.hget(type, key).then(result => {
            try {
                callback(JSON.parse(result))
            } catch (e) {
                if (result == null) callback(result);
                else {
                    if (result.indexOf(DELIMITOR) != -1) {
                        callback(result.split(DELIMITOR));
                    } else {
                        callback(result);
                    }
                }
            }
            return true;
        });
    }

    app.hget = function (type, key) {
        console.log(`Get ${type}:${key}`);
        return new Promise((resolve, reject) => {
            client.hget(type, key, (err, result) => resolve(result));
        });
    }

    app.put = function (type, key, value, callback) {
        if (key == null) key = "DEFAULT";
        console.log(`Put ${type}:${key} ${value}`);
        console.log(`${type}:${key}:${value}`);
        client.hset(type, key, value, callback);
    }

    app.append = function (type, key, value, callback) {
        if (key == null) key = "DEFAULT";
        console.log(`Append ${type}:${key} ${value}`);
        app.hget(type, key).then(result => {
            console.log(`Retrieve result ${result}`);
            if (result == null) {
                result = value;
            } else {
                let list = result.split(DELIMITOR);
                // console.log(list);
                // console.log(value)
                // console.log(list.indexOf(value))
                if (list.indexOf(value) != -1) {
                    return callback("Already exist. Skipped", 0);
                } else {
                    value = result + DELIMITOR + value;
                }
            }
            client.hset(type, key, value, callback);
        });
    }

    app.del = function (type, key, callback) {
        if (key == null) key = "DEFAULT";
        console.log(`Del ${type}:${key}`);
        client.hdel(type, key, callback);
    }

    app.remove = function (type, key, value, callback) {
        if (key == null) key = "DEFAULT";
        console.log(`Remove ${type}:${key}:${value}`);
        app.hget(type, key).then(result => {
            if (result == null) {
                console.log(`Not found ${type}:${key}:${value}`);
                callback(`Not found ${type}:${key}:${value}`, -1);
            } else {
                if (result == value) {
                    console.log(`Exactly match ${result}=${value}`)
                    client.hdel(type, key, callback);
                } else if (result.indexOf(value) != -1) {
                    let list = result.split(DELIMITOR);
                    list = list.filter(x => x != value).join(DELIMITOR);
                    console.log(`Partial List : ${list}`)
                    client.hset(type, key, list, callback);
                } else {
                    console.log(`Missing ${type}:${key}:${value}`);
                    callback(`Missing ${type}:${key}:${value}`, -1);
                }
            }
        });
    }

    app.init();
    return app;
}

exports = module.exports = createApplication;