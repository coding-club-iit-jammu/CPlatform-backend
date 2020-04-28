import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HttpStatusService {

  constructor(private router:Router) { }

  //Check for 401
  checkAuthorization(status){
    if(status == 401){
      this.router.navigateByUrl('/');
    }
  }
  
}
