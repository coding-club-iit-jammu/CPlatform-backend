const request = require("request");
const JUDGE0_ENDPOINT = 'https://api.judge0.com/submissions';

const RequestHandler = /** @class */ (function () {
    function RequestHandler() {
    }
    RequestHandler.postRunRequest = function (id, program, input) {
        let runRequestBody = {
            source_code: program,
            language_id: id,
            stdin: input,
        };
        // console.log(runRequestBody);
        // console.log(process.env);
        return request.post({
            url: JUDGE0_ENDPOINT,
            json: runRequestBody
        })
            .on('data', function (data) {
            var parsedData = JSON.parse(data.toString());
            console.log(parsedData);
            if (parsedData.token) {
                this.emit('success', parsedData);
            } else if (parsedData.status()) {
                this.emit('error', parsedData);
            }
        });
    };
    return RequestHandler;
}());
exports.RequestHandler = RequestHandler;