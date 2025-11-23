import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './app-dialog.component.html',
  styleUrls: ['./app-dialog.component.scss']
})
export class AppDialogComponent {
  @Input() visible = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.onClose();
    }
  }
}
