import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class TimeAPIClientService {

  constructor(private http: HttpClient) { }
  time:Date;
  async getTime(){
    await this.assignTime();
    return this.time;
  }
  async assignTime()
  {
        var url = 'http://worldclockapi.com/api/json/utc/now';
        var onlineTime;
        let tt = await new Promise(resolve => {
        this.http.get(url).subscribe(data => {
            var tt = data;//.currentDateTime;
            onlineTime = tt['currentDateTime'];
            resolve(onlineTime);
            this.time = new Date(onlineTime);
          });
        });
  }
}
