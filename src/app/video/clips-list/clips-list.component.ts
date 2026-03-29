import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  input,
  computed,
} from '@angular/core';
import { ClipService } from '../../services/clip.service';
import { RouterLink } from '@angular/router';
import { FbTimestampPipe } from '../../shared/pipes/fb-timestamp.pipe';

@Component({
  selector: 'app-clips-list',
  imports: [RouterLink, FbTimestampPipe],
  templateUrl: './clips-list.component.html',
  styleUrl: './clips-list.component.scss',
})
export class ClipsListComponent implements OnInit, OnDestroy {
  clipService = inject(ClipService);

  scrollable = input(true);
  docID = input('');
  clips = computed(() => {
    return this.docID()
      ? this.clipService.pageClips().filter((pc) => pc.docID !== this.docID())
      : this.clipService.pageClips();
  });

  constructor() {
    this.clipService.getClips();
  }

  ngOnInit() {
    if (this.scrollable()) {
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  ngOnDestroy() {
    if (this.scrollable()) {
      window.removeEventListener('scroll', this.handleScroll);
    }

    this.clipService.pageClips.set([]);
  }

  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;

    const bottomOfWindow =
      Math.round(scrollTop) + innerHeight > offsetHeight - 150;

    if (bottomOfWindow) {
      this.clipService.getClips();
    }
  };
}
