import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from "video.js";
import Player from 'video.js/dist/types/player';
@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClipComponent implements OnInit {

  @ViewChild('videoPlayer', { static: true }) target?: ElementRef;
  player?: Player;
  id = '';

  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.player = videojs.getPlayer(this.target?.nativeElement);
    this.id = this.route.snapshot.params['id'];
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
    })
  }


}
