import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string;
  newPassword: string;
  constructor(private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private swalService: SwalAlertService) { }

  ngOnInit(): void {
    this.token = this.activatedRoute.snapshot.params.token;
  }

  getPassword(password) {
    this.newPassword = password;
    if (this.newPassword) {
      this.resetPassword();
    }
  }
  resetPassword() {
    let title = "Confirm your new password !"
    let text = "Do you confirm to save your new password ?"
    this.swalService.getSwalForConfirm(title, text).then(result => {
      if (result) {
        this.userService.resetPassword(this.token, this.newPassword).subscribe(res => {
          if (res.updated) {
            this.swalService.getSwalForNotification("New password saved !", "Your new password has been saved with success");
            this.router.navigate(['/login'])
          }
          else {
            this.swalService.getSwalForNotification("Reset password failed !", "Your reset password was failed, please try again or contact support!");
          }
        });
      }
      else {

      }
    });
  }

}
