import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HttpService {
    constructor(private http: HttpClient) { }

    public get<T> (queryUrl: string, headers?: HttpHeaders, params?: HttpParams): Observable<T> {
        try {
            return this.http.get<T>(queryUrl, {
                observe: 'response', headers, params
            }).pipe(map(result => result.body) );
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    public post<T> (queryUrl: string, requestBody: object, headers?: HttpHeaders, params?: HttpParams) : Observable<T> {
        try {
            return this.http.post<T>(queryUrl, requestBody, {
                observe: 'response', headers, params
            }).pipe(map(result => result.body));
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}