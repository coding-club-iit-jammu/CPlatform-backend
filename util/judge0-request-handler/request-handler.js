const request = require("request");
const JUDGE0_ENDPOINT_1 = 'https://api.judge0.com/submissions/?base64_encoded=true';
const JUDGE0_ENDPOINT_2 = 'https://api.judge0.com/submissions/';
const axios = require('axios').default;

const RequestHandler = /** @class */ (function () {
    function RequestHandler() {
    }
    RequestHandler.postRunRequest = async function (id, program, input) {
        try {
            const response = await axios.post(JUDGE0_ENDPOINT_1, {
                "source_code": program,
                "language_id": id,
                "stdin": input
            });
            return response.data;
        } catch(error) {
            console.log(error);
        }
    };
    RequestHandler.getSubmissionStatus = async function(token, fields) {
        try {
            const url = `${JUDGE0_ENDPOINT_2}/${token}?base64_encoded=true`;
            const response = await axios.get(url, {
                "content-type": 'application/json',
                "fields": fields,
            });
            return response.data;
        } catch(error) {
            console.log(error);
        }
    }
    return RequestHandler;
}());
exports.RequestHandler = RequestHandler;