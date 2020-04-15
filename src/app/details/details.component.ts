import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';
import { MaterialComponentService } from '../services/material-component.service';

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
        private storeInfo: StoreInfoService,
        private matComp: MaterialComponentService
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
          this.matComp.openSnackBar('Sign Up Failed!',2500);
        }
        this.showSpinner = false;
        this.router.navigate(['/']);
      },error=>{
        this.matComp.openSnackBar('Network Problem!',2500);
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
