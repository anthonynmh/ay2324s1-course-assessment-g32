import axios from 'axios';
const env = require("../loadEnvironment");

const rootUrl = env.MATCH_URL + '/queue';

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const joinQueue = async (jwt, queueName, sessionID) => {
  try {
    const data = {
      jwt: jwt,
      queueName: queueName,
      sessionID: sessionID
    };
    return await axios.post(rootUrl + "/join", data, config);
  } catch (err) {
    if (err.code === 'ERR_NETWORK') {
      throw Object.assign(new Error(err.code), { response: { status: 408 }, message: 'Network Error' });
    }
    throw err;
  }
};

export const exitQueue = async (jwt, queueName, sessionID) => {
  try {
    const data = {
      jwt: jwt,
      queueName: queueName,
      sessionID: sessionID
    };
    return await axios.post(rootUrl + "/exit", data, config);
  } catch (err) {
    if (err.code === 'ERR_NETWORK') {
      throw Object.assign(new Error(err.code), { response: { status: 408 }, message: 'Network Error' });
    }
    throw err;
  }
};
