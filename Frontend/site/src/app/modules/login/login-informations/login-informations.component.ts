import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmIdentityModalComponent } from '../confirm-identity-modal/confirm-identity-modal.component';
import Swal from 'sweetalert2';

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
    public dialog: MatDialog) { }

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
      this.openDialog();
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
  updateUserPassword() {

    Swal.fire({
      title: 'Are you sure?',
      text: "You are going to update your password!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm'
    }).then((result) => {
      if (result.value) {
        this.userService.updateUserPassword(this.passwordForm.controls.oldPassword.value, this.passwordForm.controls.newPassword.value).subscribe(result => {
          if (result.updated) {
            Swal.fire({
              icon: 'success',
              title: 'password updated',
              showConfirmButton: false,
              timer: 1500
            })
              ,
              error => {
                Swal.fire({
                  icon: 'error',
                  title: 'Updating password Failed !',
                  text: error.message,
                })
              }
          }
        });
      }
    })
  }

  openDialog(): void {


    Swal.fire({
      title: 'Are you sure?',
      text: "You are going to update your email adress!!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm'
    }).then((result) => {
      if (result.value) {
        this.userService.UpdateEmailAdress(this.emailForm.controls.emailAdress.value).subscribe(result => {
          if (result) {
            this.emailAdress = result.user.email;
            this.user.emit(result.user);
            Swal.fire({
              icon: 'success',
              title: 'Email updated',
              showConfirmButton: false,
              timer: 1500
            })
              ,
              error => {
                Swal.fire({
                  icon: 'error',
                  title: 'Update Failed !',
                  text: error.message,
                })
              }
          }
        });
      }
    })
  }


  disableViewOld() {
    if (this.disableOld == false) { this.disableOld = true; }
  }


  disableViewNew() {
    if (this.disableNew == false) { this.disableNew = true; }
  }

}
