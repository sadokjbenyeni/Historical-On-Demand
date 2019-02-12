import { Component, Input } from '@angular/core';
import { AbstractControlDirective, AbstractControl } from '@angular/forms';

@Component({
  selector: 'show-errors',
  template: `
  <div class="alert alert-danger" *ngIf="shouldShowErrors()">
    <span *ngFor="let error of listOfErrors()">{{error}}</span>
  </div>
  `,
})
export class ShowErrorsComponent {

  private static readonly errorMessages = {
    'required': () => 'The field is required',
    'minlength': (params) => 'The minimum number of characters is ' + params.requiredLength,
    'maxlength': (params) => 'The maximum number of characters is ' + params.requiredLength,
    'pattern': (params) => 'The field is required : ' + params.requiredPattern,
    'years': (params) => params.message,
    'countryCity': (params) => params.message,
    'uniqueName': (params) => params.message,
    'emailString': (params) => params.message,
    'emaillogin': (params) => params.message,
    'dateverif': (params) => params.message,
    'mdp': (params) => params.message,
    'champIdem': (params) => params.message,
    'telephoneNumbers': (params) => params.message,
    'telephoneNumber': (params) => params.message
  };

  @Input()
  private control: AbstractControlDirective | AbstractControl;

  shouldShowErrors(): boolean {
    return this.control &&
      this.control.errors &&
      (this.control.dirty || this.control.touched);
  }

  listOfErrors(): string[] {
    return Object.keys(this.control.errors)
      .map(field => this.getMessage(field, this.control.errors[field]));
  }

  private getMessage(type: string, params: any) {
    return ShowErrorsComponent.errorMessages[type](params);
  }
}
