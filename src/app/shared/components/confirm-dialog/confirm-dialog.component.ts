import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
    @Input() visible = false;
    @Input() title = 'Confirm';
    @Input() message = 'Are you sure?';
    @Input() confirmText = 'Confirm';
    @Input() cancelText = 'Cancel';
    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm(): void {
        this.confirm.emit();
    }

    onCancel(): void {
        this.cancel.emit();
    }

    onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
            this.onCancel();
        }
    }
}
