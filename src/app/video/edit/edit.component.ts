import { Component, OnDestroy, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IClip } from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {

  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter<IClip>();

  clipId = new FormControl('')
  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  editForm = new FormGroup({
    title: this.title,
    id: this.clipId
  });

  showAlert = false;
  alertMsg = 'Please wait! Updating clip.';
  alertColor = 'blue';
  inSubmission = false;

  constructor(
    private modal: ModalService,
    private clipService: ClipService
  ) { }

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return;
    }
    this.inSubmission = false;
    this.showAlert = false;
    this.clipId.setValue(this.activeClip.docID as string | null);
    this.title.setValue(this.activeClip.title);
  }

  ngOnDestroy(): void {
    // this.modal.unregister('editClip');
  }

  async submit() {
    if (!this.activeClip) {
      return;
    }
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Updating clip.';
    this.activeClip.title = this.title.value as string;
    try {
      await this.clipService.updateClip(this.clipId.value as string, this.title.value as string);
      this.alertColor = 'green';
      this.alertMsg = 'Success!';
      this.update.emit(this.activeClip);
    } catch (error) {
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong. Try again later';
    }
    this.inSubmission = false;
  }

}
