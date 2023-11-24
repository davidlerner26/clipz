import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from "uuid";
import { last, switchMap } from 'rxjs';
import firebase from "firebase/compat/app";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ClipsService } from 'src/app/services/clips.service';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {

  isDragover = false;
  file: File | null = null;

  title = new FormControl('', [Validators.required, Validators.minLength(3)]);

  uploadForm = new FormGroup({
    title: this.title
  })

  showAlert = false;
  alertMsg = 'Please wait! Your clip is being uploaded.';
  alertColor = 'blue';
  inSubmission = false;
  percentage: number | null = 0;
  user: firebase.User | null = null;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipsService
  ) {
    auth.user.subscribe(user => this.user = user);
  }

  storeFile($event: Event) {
    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.uploadForm.get('title')?.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    );
  }

  uploadFile() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your clip is being uploaded.';
    this.inSubmission = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;
    const task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    task.percentageChanges().subscribe(progress => {
      this.percentage = progress as number / 100;
    });
    task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipRef.getDownloadURL())
    ).subscribe({
      next: (url) => {
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value as string,
          fileName: `${clipFileName}.mp4`,
          url
        }

        this.clipsService.createClip(clip);

        this.alertColor = 'green';
        this.alertMsg = 'Success! Your clip is now ready to share with the world!';
        this.percentage = null;
      },
      error: (error) => {
        this.uploadForm.enable();
        this.alertColor = 'red';
        this.alertMsg = 'Upload failed! Please try again later.'
        this.inSubmission = true;
        this.percentage = null;
        console.error(error);
      }
    })
  }

}
