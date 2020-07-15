import { Component, OnInit, Input, OnChanges, ɵConsole, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  @Input() userRoles: any = [];
  @Output() newUserRoles = new EventEmitter<any>();
  roles: any;


  constructor(private userService: UserService) { }

  ngOnInit(): void {
    debugger
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
    this.newRoles();
  }

  hasRole(role) {
    return this.userRoles.findIndex(item => item == role) != -1;
  }

  newRoles() {
    this.newUserRoles.emit(this.userRoles);
  }
}
