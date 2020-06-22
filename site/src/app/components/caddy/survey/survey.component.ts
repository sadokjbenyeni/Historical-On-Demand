import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  ngOnInit() {
    this.surveyForm = { dd: '', dt: '', du: { cb: [], other: '' } };
    this.getSurvey.subscribe((result) => {
      if (!result)
        this.surveyChange.emit(this.surveyForm);
    })
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
