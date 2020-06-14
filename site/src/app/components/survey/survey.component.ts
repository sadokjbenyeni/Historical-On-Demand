import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {
  surveyForm: { dd: string; dt: string; du: { cb: any[]; other: string; }; };
  @Output() surveyChange = new EventEmitter();
  survey: number = 0

  ngOnInit() {
    this.survey = 0;
    this.surveyForm = { dd: '', dt: '', du: { cb: [], other: '' } };
  }

  logCheckbox(element: HTMLInputElement): void {
    if (element.checked) {
      this.surveyForm.du.cb.push(element.value);
    } else {
      this.surveyForm.du.cb.splice(this.surveyForm.du.cb.indexOf(element.value), 1);
      this.surveyForm.du.other = '';
    }
  }

  updtSurvey() {
    this.surveyChange.emit(this.surveyForm);}
  next() {
    this.survey++
  }
  previous() {
    this.survey--
  }

}
