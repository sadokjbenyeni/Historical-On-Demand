import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmIdentityModalComponent } from '../confirm-identity-modal/confirm-identity-modal.component';
import Swal from 'sweetalert2';
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
      emailAdress: [this.emailAdress, [Validators.email]],
    });

    this.passwordForm = this.formBuilder.group({
      oldPassword: ["", []],
      newPassword: ["", []],
      confirmPassword: ["", []],
    });
  }


  updateUserEmailAdress() {
    this.checkEmailIfExist();
    if (this.emailForm.valid) {
      this.openDialogForUpdateEmailAdress();
    }
  }

  checkEmailIfExist() {
    this.updateMail = true;
    let email = this.emailForm.controls["emailAdress"].value;
    if (email) {
      if (email != this.emailAdress) {
        this.userService.checkEmailIfExist(email).subscribe(result => {
          this.emailExist = result.exist;

          if (!result.exist) {
            this.updateMail = false;
          }
        });
      }
    }

  }

  async updateUserPassword() {
    var result = await this.swalService.getSwalForConfirm('Are you sure?', "You are going to update your password!")
    if (result.value) {
      this.userService.updateUserPassword(this.passwordForm.controls.oldPassword.value, this.passwordForm.controls.newPassword.value)
        .subscribe(result => {
          if (result.updated) {
            this.initFields();
            this.swalService.getSwalForNotification('password updated', 'Your password have been updated!'),
              error => {
                this.initFields();
                this.swalService.getSwalForNotification('Updating password Failed !', error.message, 'error')
              }
          }
        })
    }
  }

  openDialogForUpdateEmailAdress(): void {
    this.swalService.getSwalForConfirm('Are you sure?', "You are going to update your email adress!")
      .then((result) => {
        if (result.value) {
          this.userService.UpdateEmailAdress(this.emailForm.controls.emailAdress.value)
            .subscribe(result => {
              if (result) {
                this.emailAdress = result.user.email;
                this.user.emit(result.user);
                this.swalService.getSwalForNotification('Email updated', 'Your email adress have been updated!'),
                  error => {
                    this.swalService.getSwalForNotification('Updating email adress Failed !', error.message, 'error')
                  }
              }
            })
        }
      })
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
