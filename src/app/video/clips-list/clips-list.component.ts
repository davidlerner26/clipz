import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  input,
  computed,
  signal,
} from '@angular/core';
import { ClipService } from '../../services/clip.service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { FbTimestampPipe } from '../../shared/pipes/fb-timestamp.pipe';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-clips-list',
  imports: [RouterLink, FbTimestampPipe],
  templateUrl: './clips-list.component.html',
  styleUrl: './clips-list.component.scss',
})
export class ClipsListComponent implements OnInit, OnDestroy {
  clipService = inject(ClipService);
  route = inject(ActivatedRoute);
  getDocIDSubscription = new Subscription();
  private router = inject(Router);

  scrollable = input(true);
  docID = signal('');
  clips = computed(() => {
    return this.docID()
      ? this.clipService.pageClips()?.filter((pc) => pc.docID !== this.docID())
      : this.clipService.pageClips();
  });

  constructor() {
    this.clipService.getClips();
    this.getDocIDSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.getDocID();
      });
  }

  ngOnInit() {
    if (this.scrollable()) {
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  private getDocID() {
    const { params } = this.route?.snapshot;
    this.docID.set(params ? params['id'] : '');
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

  ngOnDestroy() {
    if (this.scrollable()) {
      window.removeEventListener('scroll', this.handleScroll);
    }

    this.clipService.pageClips.set([]);
    this.getDocIDSubscription?.unsubscribe();
  }
}
