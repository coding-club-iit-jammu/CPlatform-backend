import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminpageComponent } from './adminpage/adminpage.component';
import { StudenthomeComponent } from './studenthome/studenthome.component';
import { InstructorhomeComponent } from './instructorhome/instructorhome.component';
import { CoursehomeComponent } from './coursehome/coursehome.component';
import { DetailsComponent } from './details/details.component';
import { QuizComponent } from './quiz/quiz.component'

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
  },
  {
    path: 'course',
    component: CoursehomeComponent
  },
  {
    path: 'details',
    component: DetailsComponent
  },
  {
    path: 'quiz',
    component: QuizComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
