import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyA5gR6RTFwvNJJTTR0Irqu3hzAE4Bz77VQ',
        authDomain: 'clipz-fd6fb.firebaseapp.com',
        projectId: 'clipz-fd6fb',
        storageBucket: 'clipz-fd6fb.appspot.com',
        messagingSenderId: '424332989480',
        appId: '1:424332989480:web:ef24db87cb6abc9986111d',
      }),
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
};
