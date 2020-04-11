import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { FirebaseServicesService } from '../firebase-services.service';
import { HttpClient } from '@angular/common/http';
import { StoreInfoService }  from '../services/store-info.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  
  showSpinner:boolean = false;
  showSpinner1:boolean = false;
  
  constructor
    (
      private formBuilder: FormBuilder, 
      private router: Router,
      private http: HttpClient,
      private storeInfo: StoreInfoService,
      private zone: NgZone
    ){ 
      
    }

  async ngOnInit() {
    this.showSpinner = true;
    this.form = this.formBuilder.group({
      email : this.formBuilder.control(''),
      password : this.formBuilder.control('')
    });
    this.showSpinner = false;
  }

  async login(){
    this.showSpinner1 = true;
    this.http.post(this.storeInfo.serverUrl + '/login',this.form.value).pipe().subscribe((data)=>{
      if(!data["userId"]){
        alert(data['message']);
        this.router.navigateByUrl('/');
        return;
      }
      sessionStorage.setItem('token',data['token']);
      sessionStorage.setItem('userId',data['userId']);
      sessionStorage.setItem('email',data['email']);
      this.showSpinner1 = false;
      this.router.navigateByUrl('/home');
    },error =>{
      console.log(error);
    })
  }

  reset(){
    this.form = this.formBuilder.group({
      email : this.formBuilder.control(''),
      password : this.formBuilder.control('')
    });
  }
}
