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
      const token = JSON.parse(localStorage.getItem('user')).token;
      const exp = JSON.parse(atob(token.split('.')[1])).exp;
      const iat = JSON.parse(atob(token.split('.')[1])).iat;
      console.log(new Date());
      console.log(new Date(exp));
      if ((new Date(iat)) > new Date(exp)) {
        localStorage.removeItem('user');
        return false;
      } else {
        return true;
      }
    }
  }
}
