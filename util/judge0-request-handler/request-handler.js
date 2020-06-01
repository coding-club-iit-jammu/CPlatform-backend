const request = require("request");
const JUDGE0_ENDPOINT_1 = 'https://judge0.p.rapidapi.com/submissions/?base64_encoded=true';
const JUDGE0_ENDPOINT_2 = 'https://judge0.p.rapidapi.com/submissions';
const axios = require('axios').default;
const KEY = "9573ba1c20msh9604382255867b1p18f6f5jsn30f50d10e1f4";

const RequestHandler = /** @class */ (function () {
    function RequestHandler() {
    }
    RequestHandler.postRunRequest = async function (id, program, input) {
        try {
            const options = {
                headers: {
                    "x-rapidapi-host": "judge0.p.rapidapi.com",
                    "x-rapidapi-key": KEY,
                    "content-type": "application/json",
                    "accept": "application/json",
                    "useQueryString": true
                }
            };
            const response = await axios.post(JUDGE0_ENDPOINT_1, {
                "source_code": program,
                "language_id": id,
                "stdin": input
            }, options);
            return response.data;
        } catch(error) {
            console.log(error);
        }
    };
    RequestHandler.getSubmissionStatus = async function(token, fields) {
        try {
            const options = {
                headers: {
                    "x-rapidapi-host": "judge0.p.rapidapi.com",
                    "x-rapidapi-key": KEY,
                    "content-type": "application/json",
                    "accept": "application/json",
                    "useQueryString": true
                },
                query: {
                    "fields": fields
                }
            };
            const url = `${JUDGE0_ENDPOINT_2}/${token}?base64_encoded=true`;
            const response = await axios.get(url, options);
            return response.data;
        } catch(error) {
            console.log(error);
        }
    }
    return RequestHandler;
}());
exports.RequestHandler = RequestHandler;