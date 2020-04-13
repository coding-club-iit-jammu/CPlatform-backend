import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

    form: FormGroup;
    showSpinner:boolean = false;
    
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private http: HttpClient,
        private storeInfo: StoreInfoService
      ) {
    }

    async ngOnInit() {
      this.showSpinner = true;
      this.form = this.formBuilder.group({
        name : this.formBuilder.control('', Validators.required),
        branch: this.formBuilder.control('', Validators.required),
        email: this.formBuilder.control('',Validators.required),
        password: this.formBuilder.control('',Validators.required),
        confirmPassword: this.formBuilder.control('',Validators.required)
      });
      
      this.showSpinner = false;
    }

   async onSubmit(data) {
    this.showSpinner = true;
    if(data.confirmPassword === data.password){
      this.http.post(this.storeInfo.serverUrl + '/createUser',data).subscribe((response)=>{
        if(!data.added){
          alert('Sign Up Failed.')
        }
        this.showSpinner = false;
        this.router.navigate(['/']);
      },error=>{
        console.log(error)
        this.showSpinner = false
      })

    } else {
      this.showSpinner = false;
    }
  }

  navToLogin(){
    this.router.navigate(['/']);
  }

}
