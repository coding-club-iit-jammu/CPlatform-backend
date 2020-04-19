import { Router } from 'express';
import * as _ from 'lodash';
import { languagesTable} from '../utils/languages-table';
import { LanguagesManager } from '../utils/languagesManager';
import { RequestHandler } from '../utils/jdoodle-request-handler/request-handler';

type ClientRunRequestBody = {
    lang: string,
    version: string,
    program: string
};

type JdoodleResponseBody = {
    output: string,
    statusCode: number,
    memory: string,
    cpuTime: string
};

class AppRoutes {
    public routes: Router;
    constructor() {
        this.routes = Router();
        this._init();
        this.initRoutes();
    }
    private _init(): void {
        this.routes.get('/', (req, res) => {
            console.log('POST: \'/\'');
            res.send('hello from server');
        })
    }
    private initRoutes(): void {
        this.routes
        .get('/langs', (req, res) => {
            console.log('GET: \'/langs\'');
            return res.status(200).send({langs: languagesTable});
        })

        .post('/run', (req, res) => {
            console.log({msg: 'POST: \'/run\''});
            const body = _.pick(req.body, ['lang', 'version', 'program']) as ClientRunRequestBody;
            if (!this.validatePostRun(body)) {
                console.log('invalid body parameters');
                return res.status(400).send('invalid body parameters');
            }
            
            try {
                const index = LanguagesManager.getLanguageVersionIndex(body.lang, body.version);
                RequestHandler.postRunRequest(body.lang, index, body.program)
                    .on('error', (error) => {
                        console.log({msg: 'postRunRequest on error', params:error});
                        return res.status(400).send(error);
                    })
                    .on('jdoodle-error', (error) => {
                        console.log({msg: 'postRunRequest on jdoodle-error', params:error});
                        return res.status(400).send(error);
                    })
                    .on('jdoodle-success', (result: JdoodleResponseBody) => {
                        console.log({msg: 'postRunRequest on jdoodle-success', params:result});
                        return res.status(200).send({runResult: result});
                    })

            } catch (error) {
                console.log('request fail');
                return res.status(400).send('request fail');
            }
        })
    }

    private validatePostRun(reqBody: ClientRunRequestBody) : boolean {
        return !_.some(reqBody, (value) => _.isNil(value))
            && _.isString(reqBody.lang)
            && _.isString(reqBody.version)
            && _.isString(reqBody.program)
            && !_.isEqual(reqBody.program, '')
            && LanguagesManager.isLangSupported(reqBody.lang, reqBody.version);
    }
}

const appRoutes = new AppRoutes().routes;
export { appRoutes };