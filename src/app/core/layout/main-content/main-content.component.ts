import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, NzLayoutModule, RouterOutlet],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent {

}
