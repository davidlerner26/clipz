import { Component } from '@angular/core';
import { ClipsListComponent } from '../../video/clips-list/clips-list.component';

@Component({
  selector: 'app-home',
  imports: [ClipsListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
