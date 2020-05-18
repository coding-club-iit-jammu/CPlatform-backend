const _ = require("lodash");
const languagesTable = require("../../util/languages-table");
const LanguagesManager = require("../../util/languagesManager");
const RequestHandler = require("../../util/jdoodle-request-handler/request-handler");

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
    let body = _.pick(req.body, ['lang', 'version', 'program', 'input']);
    // console.log(body);
    if (!validatePostRun(body)) {
        console.log('Invalid body parameters!');
        res.status(400).send('Invalid body parameters');
        return;
    }
    try {
        let id = LanguagesManager.LanguagesManager.
                                    getLanguageVersionIndex(body.lang, body.version);
        RequestHandler.RequestHandler.postRunRequest(id, body.program, body.input)
            .on('error', function(error) {
                console.log({ msg: 'postRunRequest on error', params: error });
                return res.status(400).send(error);
        })
            .on('success', function (result) {
            console.log({ msg: 'postRunRequest on success', params: result });
            // TODO: Fetch token and get submission response
            return res.status(200).send({ runResult: result });
        });
    }
    catch (error) {
        console.log('request fail');
        return res.status(400).send('request fail');
    }
};
