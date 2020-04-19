import * as request from 'request';

const JDOODLE_ENDPOINT = 'https://api.jdoodle.com/v1/execute';

export class RequestHandler {
    
    public static postRunRequest(lang: string, index: string, program: string): request.Request {
        const runRequestBody = {
            script: program,
            language: lang,
            versionIndex: index,
            clientId: process.env.JDOODLE_CLIENT_ID,
            clientSecret: process.env.JDOODLE_CLIENT_SECRET
        };
        console.log(runRequestBody);
        // console.log(process.env);
        return request.post({
            url: JDOODLE_ENDPOINT,
            json: runRequestBody
        })
        .on('data', function(data: Buffer) {
            const parsedData = JSON.parse(data.toString());
            parsedData.error ?
                this.emit('jdoodle-error', parsedData) :
                this.emit('jdoodle-success', parsedData);
        })
    }
}