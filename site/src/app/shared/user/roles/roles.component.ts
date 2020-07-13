import { Component, OnInit, Input, OnChanges, ɵConsole } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit { // OnChanges,

  @Input() userRoles: any;
  roleOfUser: any = [];
  roles: any;


  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getRoles();
  }

  ngOnChanges(): void {
    this.setUserRoles();
  }

  getRoles() {
    this.userService.getRoles().subscribe(res => {
      this.roles = res.roles;
      this.setUserRoles();
    });
  }


  toggleRole = (role: any) => {
    const addChip = () => { this.roleOfUser.push(role); };
    console.log(role)
    const removeChip = () => {
      this.roleOfUser.splice(this.roleOfUser.findIndex(item => item == role), 1)
    };


    this.hasRole(role) ? removeChip() : addChip();

  }

  private setUserRoles() {
    this.roleOfUser = [];
    this.userRoles.forEach(role => {
      this.roleOfUser.push(role);
    });
  }


  hasRole(role) {
    return this.roleOfUser.findIndex(item => item == role) != -1;
  }
}
