import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, delay, filter, map, of, switchMap } from 'rxjs';
import { IUser } from '../models/user.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  isAuthenticated$: Observable<boolean>;
  isAuthenticatedWithDelay$: Observable<boolean>;
  redirect = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usersCollection = this.db.collection('users');
    this.isAuthenticated$ = auth.user.pipe(map(user => !!user));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.route),
      switchMap(route => route?.data ?? of({ authOnly: false }))
    ).subscribe((data) => this.redirect = data['authOnly'] ?? false);
  }

  async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error('Password not provided');
    }
    const userCred = await this.auth.createUserWithEmailAndPassword(userData.email, userData.password);
    if (!userCred.user) {
      throw new Error("User can't be found");
    }
    await this.usersCollection.doc(userCred.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber
    })

    await userCred.user.updateProfile({
      displayName: userData.name
    })
  }

  async logout($event?: Event) {
    $event?.preventDefault();
    await this.auth.signOut();
    await this.router.navigateByUrl('/');
  }

}
