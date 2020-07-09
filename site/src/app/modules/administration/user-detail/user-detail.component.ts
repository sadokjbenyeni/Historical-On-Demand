import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';



import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  user: { firstname: string; lastname: string; roleName: string[]; };
  userSelect: string;
  message: string;
  role: string;
  roles: Array<string>;
  private id: string;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    route.params.subscribe(_ => this.id = _.id);
  }

  @ViewChild('utilisateurForm', { static: false })
  private userForm: NgForm;

  ngOnInit() {
    this.message = '';
    this.role = '';
    this.user = { firstname: '', lastname: '', roleName: [] };
    this.userService.getRoles().subscribe(res => {
      this.roles = res.roles;
    });
    this.userService.getCompte().subscribe(res => {
      this.user = res.user;
      this.user['id'] = res.user['_id'];
    });
  }
  roleChange(role) {
    const rolsplit = role.split('|');
    const rol = rolsplit[0];
    const rolN = rolsplit[1];
    this.user['role'] = rol;
    this.user['roleName'] = rolN;
    this.userSelect = rol + '|' + rolN;
  }
  addRole(e) {
    if (e) {
      this.user['roleName'].push(e);
    }
  }
  delRole(e) {
    this.user['roleName'].splice(this.user['roleName'].indexOf(e), 1);
  }
  save() {
    this.userService.updateUser(this.user).subscribe(res => {
      this.router.navigateByUrl('/admin/users');
    });
  }

}
