import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';

@Component({
  selector: "app-user",
  templateUrl: "login.component.html"
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  error = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
  }

  login() {
    this.userService.login(this.username, this.password).subscribe(
        (data: any) => {
          localStorage.removeItem('user');
          localStorage.setItem('user', JSON.stringify({
            username: this.username,
            token: data.token
          }));
          this.router.navigate(['/dashboard']);
        }
        , (err) => {
          this.error = err.error.errorMessage;
        });
  }
}
