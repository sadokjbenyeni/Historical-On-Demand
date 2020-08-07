import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-password-informations',
  templateUrl: './password-informations.component.html',
  styleUrls: ['./password-informations.component.css']
})
export class PasswordInformationsComponent implements OnInit {
  @Output() emitPassword = new EventEmitter();
  @Input() forRegister: boolean;
  loginForm: FormGroup;
  hideConfirm: boolean = true;
  hideNew: boolean = true;
  disableNew: boolean;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.initFields();
  }

  initFields() {
    this.loginForm = this.formBuilder.group({
      newPassword: ["", []],
      confirmPassword: ["", []],
    });
  }

  disableViewNew() {
    if (this.loginForm.controls.confirmPassword.value === '') {
      this.disableNew = false;
    }
    else {
      this.disableNew = true;
      this.hideNew = true;
    }
  }

  sendPassword() {
    this.emitPassword.emit(this.loginForm.controls.newPassword.value)
  }

}
