import { Component, OnInit, Input, OnChanges, ɵConsole, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AdministratorServiceService } from '../../../services/administrator-service.service';
import { SwalAlertService } from '../../../shared/swal-alert/swal-alert.service';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.css']
})
export class UserRolesComponent implements OnInit, OnChanges {

  userRoles: any = [];
  @Input() user: any = [];
  roles: any;


  constructor(private userService: UserService, private swalService: SwalAlertService, private adminsitratorService: AdministratorServiceService) { }
  ngOnChanges(userChanged): void {
    this.userRoles = userChanged.user.currentValue.roleName;
  }

  ngOnInit(): void {
    this.userRoles = this.user.roleName;
    this.getRoles();
  }

  getRoles() {
    this.userService.getRoles().subscribe(res => {
      this.roles = res.roles;
    });
  }


  toggleRole = (role: any) => {
    const addChip = () => {
      this.userRoles.push(role);
    };
    const removeChip = () => {
      this.userRoles.splice(this.userRoles.findIndex(item => item == role), 1)
    };
    this.hasRole(role) ? removeChip() : addChip();
  }

  hasRole(role) {
    return this.userRoles.findIndex(item => item == role) != -1;
  }

  async updateUser() {
    var result = await this.swalService.getSwalForConfirm('Are you sure?', `You are going to update <b> ${this.user.firstname} ${this.user.lastname} </b> roles!`)
    if (result.value) {
      this.adminsitratorService.updateUser(this.user)
        .subscribe(result => {
          if (result) {
            this.swalService.getSwalForNotification(`${this.user.firstname} ${this.user.lastname} roles updated`, ` <b> ${this.user.firstname} ${this.user.lastname} </b>  roles have been updated!`),
              error => {
                this.swalService.getSwalForNotification('Updating roles Failed !', error.message, 'error')
              }
          }
        })
    }
  }
}
