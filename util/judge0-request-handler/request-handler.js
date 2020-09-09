const request = require("request");
const JUDGE0_ENDPOINT_1 = 'http://azure.codingclubiitjammu.tech/submissions/?base64_encoded=true';
const JUDGE0_ENDPOINT_2 = 'http://azure.codingclubiitjammu.tech/submissions';
const axios = require('axios').default;
const KEY = "abhishek";

const RequestHandler = /** @class */ (function () {
    function RequestHandler() {
    }
    RequestHandler.postRunRequest = async function (id, program, input) {
        try {
            const options = {
                headers: {
                    "X-Auth-Token": KEY,
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
                    "X-Auth-Token": KEY,
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
