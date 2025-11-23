import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-collapse',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss']
})
export class CollapseComponent {
  @Input() title: string = '';
  @Input() isOpen: boolean = true;
  @Output() isOpenChange = new EventEmitter<boolean>();

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }
}
