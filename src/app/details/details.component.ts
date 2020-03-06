import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseServicesService } from '../firebase-services.service'
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
        private firebase: FirebaseServicesService
      ) {
    }

    async ngOnInit() {
      this.showSpinner = true;
      this.form = this.formBuilder.group({
        fullName : this.formBuilder.control('', Validators.required),
        userType : this.formBuilder.control('', Validators.required),
        branch: this.formBuilder.control('', Validators.required)
      });
      
      if(this.firebase.userid == undefined || this.firebase.userid == null){
        await this.firebase.getCurrentUser().then((user)=>{
            this.firebase.setUserID(user["email"].split('@')[0])
          }
        ).catch(()=>{
          this.router.navigateByUrl('');
        })
      }

      var userExists = await this.firebase.userExists(this.firebase.userid);
      if(userExists){
          var type = await this.firebase.getUserType();
          this.showSpinner = false;
          this.router.navigateByUrl('/'+type)
      }
      this.showSpinner = false;
    }

   async onSubmit() {
     this.showSpinner = true;
      await this.firebase.createUser(this.form.value).then(()=>{
        alert("Registration Complete.")
        this.firebase.userType = this.form.value.userType;
        this.showSpinner = false;
        this.router.navigateByUrl('/'+this.firebase.userType);
      });
      this.showSpinner = false;
    }

}
