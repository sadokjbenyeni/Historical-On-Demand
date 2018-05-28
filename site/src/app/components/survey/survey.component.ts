import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {
  surveyForm: { dd: string; dt: string; du: { cb: any[]; other: string; }; };
  @Input() survey: number;
  @Output() surveyChange = new EventEmitter();
  

  ngOnInit() {
    this.survey = 0;
    this.surveyForm = {dd: '', dt: '', du: { cb: [], other: ''} };
    if (JSON.parse(sessionStorage.getItem('surveyForm'))) {
      this.surveyForm = JSON.parse(sessionStorage.getItem('surveyForm'));
    }
  }

  logCheckbox(element: HTMLInputElement): void {
    if (element.checked) {
      this.surveyForm.du.cb.push(element.value);
    } else {
      this.surveyForm.du.cb.splice( this.surveyForm.du.cb.indexOf(element.value), 1 );
      this.surveyForm.du.other = '';
    }
  }

  updtSurvey(){
    this.surveyChange.emit({
      value: this.surveyForm
    });
  }

}
