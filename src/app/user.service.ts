import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://192.168.1.103:9090';

  constructor(
    private httpClient: HttpClient
    ) { }

  login(un, pass) {
    return this.httpClient.post(this.apiUrl + '/users/login', { username: un, password: pass });
  }

  isLoggedIn() {
    console.log(localStorage.getItem('user'));
    if (localStorage.getItem('user') === null) {
      return false;
    } else {
      try {
        const token = JSON.parse(localStorage.getItem('user')).token;
        const exp = JSON.parse(atob(token.split('.')[1])).exp;
        const ct = (new Date().getTime() / 1000);
        console.log(ct);
        console.log(exp);
        console.log('Session Expires in: ' + (ct - exp));
        if (ct > exp) {
          localStorage.removeItem('user');
          return false;
        } else {
          return true;
        }
      } catch (e) {
        localStorage.removeItem('user');
        return false;
      }
    }
  }
}
