import { Component, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import firebase from "firebase/compat/app";
import { combineLatest, forkJoin, switchMap } from 'rxjs';
import { FfmpegService } from 'src/app/ffmpeg.service';
import { IClip } from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { v4 as uuid } from "uuid";
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnDestroy {

  nextStep = false;
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
  task?: AngularFireUploadTask;
  screenshots: string[] = [];
  selectedScreenshot = '';
  screenshotTask?: AngularFireUploadTask;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe(user => this.user = user);
    this.ffmpegService.init();
  }

  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) return;
    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);

    this.selectedScreenshot = this.screenshots[0];
    this.uploadForm.get('title')?.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    );
    this.nextStep = true;
  }

  async uploadFile() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your clip is being uploaded.';
    this.inSubmission = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot);
    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    const screenshotRef = this.storage.ref(screenshotPath);

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges()
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;
      if (!clipProgress || !screenshotProgress) return;
      const total = clipProgress + screenshotProgress;

      this.percentage = total as number / 200;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges()
    ]).pipe(
      switchMap(() => forkJoin([
        clipRef.getDownloadURL(),
        screenshotRef.getDownloadURL()
      ]))
    ).subscribe({
      next: async (urls) => {
        const [clipURL, screenshotURL] = urls;

        const clip: IClip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value as string,
          fileName: `${clipFileName}.mp4`,
          url: clipURL,
          screenshotURL,
          screenshotFileName: `${clipFileName}.png`,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const clipDocRef = await this.clipService.createClip(clip);

        this.alertColor = 'green';
        this.alertMsg = 'Success! Your clip is now ready to share with the world!';
        this.percentage = null;

        setTimeout(() => {
          this.router.navigate([
            'clip', clipDocRef.id
          ]);
        }, 1000);
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

  ngOnDestroy(): void {
    this.task?.cancel();
  }

}
