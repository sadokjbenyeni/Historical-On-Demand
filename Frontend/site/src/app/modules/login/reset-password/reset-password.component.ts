import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';
import { JwtService } from '../../../services/jwt.service';
import { result } from 'lodash';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string;
  tokenValidity: boolean = false;
  newPassword: string;
  constructor(private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private swalService: SwalAlertService,
    private jwtService: JwtService) { }

  ngOnInit(): void {
    this.token = this.activatedRoute.snapshot.params.token;
    if (this.token) {
      this.jwtService.verifyTokenValidity(this.token).subscribe(result => {
        if (result.valid) {
          this.tokenValidity = true
        }
      },
        error => {
          if (error.error.error == "jwt expired") {
            this.swalService.getSwalForNotification("Reset password failed !", "<b>The link is expired, please try again or contact the support team </b>!", "error", 2000);
            this.router.navigate(['/login'])
          }
          else {
            this.swalService.getSwalForNotification("Reset password failed !", error.error.error, "error", 2000);
            this.router.navigate(['/login'])
          }
        });
    }
  }

  getPassword(password) {
    this.newPassword = password;
    if (this.newPassword) {
      this.resetPassword();
    }
  }
  resetPassword() {
    let title = "Confirm your new password!"
    let text = "Do you confirm to save your new password ?"
    this.swalService.getSwalForConfirm(title, text).then(result => {
      if (result.value) {
        debugger
        this.userService.resetPassword(this.token, this.newPassword).subscribe(res => {
          if (res.updated) {
            debugger
            this.swalService.getSwalForNotification("New password saved !", "Your new password has been saved with success");
            this.router.navigate(['/login'])
          }
        },
          error => {
            this.swalService.getSwalForNotification("Reset password failed !", error.error.error, "error");
          });
      }
    });
  }

}
