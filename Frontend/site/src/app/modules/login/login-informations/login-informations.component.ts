import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';

@Component({
  selector: 'app-login-informations',
  templateUrl: './login-informations.component.html',
  styleUrls: ['./login-informations.component.css']
})
export class LoginInformationsComponent implements OnInit {

  @Input() emailAdress: string;
  @Output() user = new EventEmitter<any>();
  emailForm: FormGroup;
  passwordForm: FormGroup;
  oldPassword: any;
  updateMail: boolean = true;
  updatePassword: boolean = true;
  hideConfirm: boolean = true;
  hideNew: boolean = true;
  hideOld: boolean = true;

  disableNew: boolean = false;
  disableOld: boolean = false;
  emailExist: boolean;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    public dialog: MatDialog,
    private swalService: SwalAlertService) { }

  ngOnInit(): void {
    this.initFields();
  }

  initFields() {
    this.emailForm = this.formBuilder.group({
      emailAdress: [this.emailAdress, [Validators.email]]
    });

    this.passwordForm = this.formBuilder.group({
      oldPassword: ["", []],
      newPassword: ["", []],
      confirmPassword: ["", []],
    });
  }

  sendEmailVerificationForUpdateEmailAdress() {
    this.userService.requestUpdateEmailAdress(this.emailForm.controls.emailAdress.value).subscribe(res => {

      if (res.mail) {
        const swalTitle = "Email for update sent";
        const swalText = "Please check your email, <b>you have 30 minutes</b> to confirm the email adress update !"
        this.swalService.getSwalForNotification(swalTitle, swalText, 'success', 1900);
      }
      else {
        const swalTitle = "Email not sent";
        const swalText = "Some error occured !"
        this.swalService.getSwalForNotification(swalTitle, swalText, 'error', 1700);
      }

    },
      error => {
        console.log(error);
      });
  }


  updateUserPassword() {
    this.userService.updateUserPassword(this.passwordForm.controls.oldPassword.value, this.passwordForm.controls.newPassword.value).subscribe(res => {

      if (res.updated) {
        const swalTitle = "Password updated !";
        const swalText = "Your password has been updated with success"
        this.swalService.getSwalForNotification(swalTitle, swalText, 'success', 1900);
      }
      else {
        const swalTitle = "Update failed !";
        const swalText = "Some error occured !"
        this.swalService.getSwalForNotification(swalTitle, swalText, 'error', 1700);
      }

    },
      error => {
        console.log(error);
      });
  }

  checkEmailIfExist() {
    debugger
    this.updateMail = false;
    let email = this.emailForm.controls["emailAdress"].value;
    if (email) {
      if (email != this.emailAdress) {
        this.userService.checkEmailIfExist(email).subscribe(result => {
          this.emailExist = result.exist;
          if (result.exist) {
            this.updateMail = true;
          }
        });
      }
    }
  }

  disableViewOld() {
    if (this.passwordForm.controls.newPassword.value === '') {
      this.disableOld = false;
    }
    else {
      this.disableOld = true;
      this.hideOld = true;
    }
  }


  disableViewNew() {
    if (this.passwordForm.controls.confirmPassword.value === '') {
      this.disableNew = false;
    }
    else {
      this.disableNew = true;
      this.hideNew = true;
    }
  }

}
