import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  credentials = {
    email: '',
    password: ''
  }
  showAlert = false;
  alertMsg = 'Please wait, we are logging you in.';
  alertColor = 'blue';
  inSubmission = false;

  constructor(private auth: AngularFireAuth) { }

  async login() {
    this.showAlert = true;
    this.alertMsg = 'Please wait, we are logging you in.';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      await this.auth.signInWithEmailAndPassword(this.credentials.email, this.credentials.password);
      this.alertMsg = 'Sucess! Your account has been created!';
      this.alertColor = 'green';
    } catch (error) {
      console.error(error);
      this.inSubmission = false;
      this.alertMsg = 'An unexpected error ocurred. Please try again later.';
      this.alertColor = 'red';
    }
  }

}
