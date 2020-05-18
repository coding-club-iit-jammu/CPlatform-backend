const request = require("request");
const JDOODLE_ENDPOINT = 'https://api.jdoodle.com/v1/execute';

const JDOODLE_CLIENT_ID = "ce137fd653023b4e9e569fd10276d19d";
const JDOODLE_CLIENT_SECRET = "eea9ea7fa16dea142bbbc168153607b2547080a328edab2e908621b2bbac8e2f";
const RequestHandler = /** @class */ (function () {
    function RequestHandler() {
    }
    RequestHandler.postRunRequest = function (lang, index, program) {
        let runRequestBody = {
            script: program,
            language: lang,
            versionIndex: index,
            clientId: JDOODLE_CLIENT_ID,
            clientSecret: JDOODLE_CLIENT_SECRET
        };
        console.log(runRequestBody);
        // console.log(process.env);
        return request.post({
            url: JDOODLE_ENDPOINT,
            json: runRequestBody
        })
            .on('data', function (data) {
            var parsedData = JSON.parse(data.toString());
            parsedData.error ?
                this.emit('jdoodle-error', parsedData) :
                this.emit('jdoodle-success', parsedData);
        });
    };
    return RequestHandler;
}());
exports.RequestHandler = RequestHandler;