import axios from "axios";
var env = process.env.NODE_ENV;
var baseURL = 'http://127.0.0.1:8848/api'
var websocketURL = 'ws://127.0.0.1:8848/api'
if (env=="production"){
    baseURL = 'http://note.cspup.com/api'
    websocketURL = 'ws://note.cspup.com/api'
}

const request = axios.create({
    baseURL: baseURL, 
    timeout: 10000
})



export default request;
export {websocketURL};