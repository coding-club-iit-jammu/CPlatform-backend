import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-create-test',
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.css']
})
export class CreateTestComponent implements OnInit {

  code: String;
  testId: String;
  constructor(private router:Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId');
    this.testId = this.activatedRoute.snapshot.paramMap.get('testId');
  }

}
