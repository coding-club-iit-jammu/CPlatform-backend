const request = require("request");
const JUDGE0_ENDPOINT_1 = 'https://api.judge0.com/submissions/?base64_encoded=true';
const JUDGE0_ENDPOINT_2 = 'https://api.judge0.com/submissions/';

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
        console.log(runRequestBody);
        // console.log(process.env);
        return request.post({
            url: JUDGE0_ENDPOINT_1,
            json: runRequestBody
        })
            .on('data', function (data) {
            let parsedData = JSON.parse(data);
            console.log(parsedData);
            if (parsedData.token) {
                this.emit('success', parsedData);
            } else {
                this.emit('error', parsedData);
            }
        });
    };
    RequestHandler.getSubmissionStatus = function(token, fields) {
        let requestBody = {
            "fields": fields,
        };
        return request.get({
            url: JUDGE0_ENDPOINT_2 + "/" + token + "?base64_encoded=true",
            json: requestBody
        })
            .on('data', function(data) {
                var parsedData = JSON.parse(data);
                console.log(parsedData);
                if (parsedData.error) {
                    this.emit('error', parsedData);
                } else {
                    this.emit('success', parsedData);
                }
        });
    }
    return RequestHandler;
}());
exports.RequestHandler = RequestHandler;