import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminpageComponent } from './adminpage/adminpage.component';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { InstructorhomeComponent } from './instructorhome/instructorhome.component';


const routes: Routes = [
  {
    path:"",
    component: LoginComponent
  },
  {
    path:'admin',
    component: AdminpageComponent
  },
  {
    path: 'student',
    component: StudenthomeComponent
  },
  {
    path: 'instructor',
    component: InstructorhomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
