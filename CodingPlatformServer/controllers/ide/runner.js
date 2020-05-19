const _ = require("lodash");
const languagesTable = require("../../util/languages-table");
const LanguagesManager = require("../../util/languagesManager");
const RequestHandler = require("../../util/judge0-request-handler/request-handler");

exports.getLanguages = async (req, res, next) => {
    console.log('GET: \'/langs\'');
    res.status(200).send({ langs: languagesTable.languagesTable});
};

function validatePostRun (reqBody) {
    return !_.some(reqBody, function (value) { return _.isNil(value); })
        && _.isString(reqBody.lang)
        && _.isString(reqBody.version)
        && _.isString(reqBody.program)
        && !_.isEqual(reqBody.program, '')
        && LanguagesManager.LanguagesManager.isLangSupported(reqBody.lang, reqBody.version);
};

exports.postCode = async (req, res, next) => {
    console.log({ msg: 'POST: \'/run\'' });
    let body = _.pick(req.body, ['lang', 'version', 'program', 'input', 'fields']);
    // console.log(body);
    if (!validatePostRun(body)) {
        console.log('Invalid body parameters!');
        res.status(400).send('Invalid body parameters');
        return;
    }

    // get the language id to run the program
    let id, token;
    try {
        id = LanguagesManager.LanguagesManager.
                                getLanguageVersionIndex(body.lang, body.version);
    }
    catch (error) {
        console.log({ msg: 'unable to get language ID error'});
        return res.status(400).send("Language Manager not working");
    }

    // fetch the token using postRunRequest handler
    try {
        let tokenData = await RequestHandler.RequestHandler.postRunRequest(id, body.program, body.input);
        token = tokenData.token;
        if (token == null) {
            console.log({ msg: 'postRunRequest on error'});
            return res.status(400).send("Token not received");
        }
        console.log(token);
    }
    catch(error) {
        console.log({ msg: 'postRunRequest on error', params: error });
        console.log(error);
        return res.status(400).send(error);
    }

    // send another request after a delay of 2 seconds so that program is run till then
    setTimeout( async() => {
        // fetch the submission status using getSubmissionStatus handler
        try {
            let submissionData = await RequestHandler.RequestHandler.getSubmissionStatus(token, body.fields);
            console.log({ msg: 'getSubmissionStatus on success', params: submissionData });
            return res.status(200).send({ runResult: submissionData });
        }
        catch (error) {
            console.log({ msg: 'getSubmissionStatus on error', params: error });
            return res.status(400).send(error);
        };
    }, 2000);
};
