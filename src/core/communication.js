import 'whatwg-fetch';
import { getToken } from './auth'
import { serializeQueryObj, parseJSON } from './util'
import CONFIG from '../generated/ConfigProvider.js'

// VQ_API_URL is defined in production mode
const API_URL = typeof window.VQ_API_URL === 'undefined' ? CONFIG.API_URL : window.VQ_API_URL;

export const doGet = (url, queryObject, params) => {
    url = API_URL + url;

    if (queryObject) {
        url += `?${serializeQueryObj(queryObject)}`;
    }

    const xAuthToken = getToken();

    const headers = {
        'Content-Type': 'application/json',
        'X-Auth-Token': xAuthToken
    };

    if (params && params.noCache) {
        headers['Cache-Control'] = 'no-cache';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = 'Sat, 01 Jan 2000 00:00:00 GMT';
    }

    return fetch(url, {
        method: 'GET',
        headers
    })
    .then(response => { 
        return parseJSON(response);
    });
};

export const doPost = (url, body) => fetch(API_URL + url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': getToken()
    },
    body: JSON.stringify(body || {})
})
.then(response => { 
        return parseJSON(response);
});

export const doPut = (url, body) => fetch(API_URL + url, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': getToken()
    },
    body: JSON.stringify(body || {})
})
.then(response => { 
        return parseJSON(response);
});

export const doDelete = (url, body) => fetch(API_URL + url, {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': getToken()
    },
    body: JSON.stringify(body || {})
})
.then(response => { 
        return parseJSON(response);
});
