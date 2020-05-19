const request = require("request");
const JUDGE0_ENDPOINT_1 = 'https://api.judge0.com/submissions/?base64_encoded=true';
const JUDGE0_ENDPOINT_2 = 'https://api.judge0.com/submissions/';
// const json = require('big-json');
// const JSONStream = require('JSONStream');
// const es = require('event-stream');
// const fs = require('fs');
// var s = require('stream');
// const split = require('split');

const RequestHandler = /** @class */ (function () {
    function RequestHandler() {
    }
    RequestHandler.postRunRequest = function (id, program, input) {
        // program = encode(program);
        // input = encode(input);
        let runRequestBody = {
            "source_code": program,
            "language_id": id,
            "stdin": input,
        };
        // console.log(runRequestBody);
        // console.log(process.env);
        return request.post({
            url: JUDGE0_ENDPOINT_1,
            json: runRequestBody
        })
            .on('data', function (data) {
            let parsedData = JSON.parse(data);
            // console.log(parsedData);
            if (parsedData.token) {
                this.emit('success', parsedData);
            } else {
                this.emit('error', parsedData);
            }
        });
    };
    RequestHandler.getSubmissionStatus = function(token, fields) {
        let requestBody = {
            'content-type': 'application/json',
            "fields": fields,
        };
        let finalData = "";
        let res = request.get({
            url: JUDGE0_ENDPOINT_2 + "/" + token + "?base64_encoded=true",
            json: requestBody
        })
            .on('data', function(data) {
                finalData += data.toString();
        });
        setTimeout(() => {
            // console.log(finalData);
            let parsedData = JSON.parse(finalData);
            // console.log(parsedData);
            if (parsedData.error) {
                res.emit('error', parsedData);
            } else {
                res.emit('success', parsedData);
            }
        }, 3000);
        return res;
    }
    return RequestHandler;
}());
exports.RequestHandler = RequestHandler;