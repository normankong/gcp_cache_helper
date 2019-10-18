require('dotenv').config();

let redis = require("redis");

const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PASS = process.env.REDIS_PASS

const authHelper = require("./lib/authHelper.js");
const cacheHelper = require("./lib/cacheHelper.js");

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.proceedCache = (req, res) => {

  let isValidRequest = isHandleRequest(req, res);
  if (isValidRequest == null) {
    res.status(401).json({
      code: "401",
      message: "Unauthorized"
    });
    return false;
  }
  if (isValidRequest) {
    res.status(401).json({
      code: "409",
      message: "Bad Request"
    });
    return false;
  }

  if (req.method == "GET") {
    let type = req.query.type;
    let key = req.query.key;
    cacheHelper().get(type, key, (result) => {
      let response = {
        code: (result == null) ? "099" : "000",
        data: result
      }
      return res.header('Content-type', 'application/json').send(JSON.stringify(response));
    });
    return;
  }
  if (req.method == "POST") {
    let type = req.body.type;
    let key = req.body.key;
    let action = req.body.action;
    let value = req.body.data;

    if (action == "CREATE") {
      cacheHelper().put(type, key, value, (e, r) => handleResponse(res, e, r));
    }
    if (action == "DELETE") {
      cacheHelper().del(type, key, (e, r) => handleResponse(res, e, r));
    }
    if (action == "APPEND") {
      cacheHelper().append(type, key, value, (e, r) => handleResponse(res, e, r));
    }
    if (action == "REMOVE") {
      cacheHelper().remove(type, key, value, (e, r) => handleResponse(res, e, r));
    }
  }
}

function isHandleRequest(req, res) {

  let identify, type, key, action, data, authorization;
  if (req.method == "GET") {
    identify = req.query.identify;
    type = req.query.type;
    key = req.query.key;
    authorization = req.headers.authorization
  } else {
    identify = req.body.identify;
    type = req.body.type;
    key = req.body.key;
    action = req.body.action;
    data = req.body.data;
    authorization = req.headers.authorization
  }

  if (!authHelper().verifyToken(authorization, identify)) return null;

  if (req.method == "GET") {
    if (type != null) return false;
  } else if (req.method == "POST") {
    if (type != null) return false;
    if (key != null) return false;

    switch (type) {
      case "CREATE":
      case "APPEND":
      case "REMOVE":
        if (data != null) return false;
        break;
      default:
        break;
    }
  }

  return true;
}

function handleResponse(res, e, r) {
  let response = {
    code: (r > 0) ? "000" : "099",
    error: e
  }
  return res.header('Content-type', 'application/json').send(JSON.stringify(response));
}