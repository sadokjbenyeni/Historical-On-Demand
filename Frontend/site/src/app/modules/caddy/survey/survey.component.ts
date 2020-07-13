import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {
  surveyForm: { dd: string; dt: string; du: { cb: any[]; other: string; }; };
  @Output() surveyChange = new EventEmitter();
  @Input() surveyPage: number = 0
  @Input() getSurvey: BehaviorSubject<any>;
  noDd: boolean = false;
  noDu: boolean = false;
  noDt: boolean = false;
  form: FormGroup;
  constructor(private formBuilder: FormBuilder) { }
  ngOnInit() {
    this.form = this.formBuilder.group({
      ddctl: ['', Validators.required],

    });
    this.surveyForm = { dd: '', dt: '', du: { cb: [], other: '' } };
    this.getSurvey.subscribe((result) => {
      // if (!result)
      //   this.surveyChange.emit(this.surveyForm);
      if (result == "Next") {
        this.GoNext()
      }
      if (result == "Previous") {
        this.GoPrevious()
      }
    })
  }
  GoPrevious() {
    if (this.surveyPage == 0)
      this.surveyChange.emit("Previous")
    else
      this.surveyPage--
  }
  GoNext() {
    if (this.surveyPage == 0) {
      if (this.surveyForm.dd) {
        this.surveyPage++
      }
      else {
        this.noDd = true
      }
    }
    else if (this.surveyPage == 1) {
      if (this.surveyForm.dt) {
        this.surveyPage++
      }
      else {
        this.noDt = true
      }
    }
    else {
      if (this.surveyForm.du.cb.length == 0 || (this.surveyForm.du.cb.indexOf("Other") != -1 && !this.surveyForm.du.other)) {
        this.noDu = true
      }
      else {
        this.surveyChange.emit(this.surveyForm);
      }
    }
  }

  logCheckbox(element: HTMLInputElement): void {
    if (element.checked) {
      this.surveyForm.du.cb.push(element.value);
    } else {
      this.surveyForm.du.cb.splice(this.surveyForm.du.cb.indexOf(element.value), 1);
      this.surveyForm.du.other = '';
    }
  }


  // next() {
  //   this.survey++
  // }
  // previous() {
  //   this.survey--
  // }

}
