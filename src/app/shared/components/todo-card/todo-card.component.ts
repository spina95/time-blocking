import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'app-todo-card',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, CheckboxComponent],
  templateUrl: './todo-card.component.html',
  styleUrls: ['./todo-card.component.scss']
})
export class TodoCardComponent {
  @Input() title: string = '';
  @Input() duration: number = 0; // Duration in hours
  @Input() priority: 'low' | 'medium' | 'high' = 'low';
  @Input() checked: boolean = false;
  @Input() deadline: Date | null = null;
  @Output() checkedChange = new EventEmitter<boolean>();
  @Output() cardClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>();

  onCheckedChange(value: boolean): void {
    this.checked = value;
    this.checkedChange.emit(value);
  }

  onCardClick(event: MouseEvent): void {
    // Don't emit click if clicking on checkbox or delete button
    const target = event.target as HTMLElement;
    if (!target.closest('app-checkbox') && !target.closest('.delete-btn')) {
      this.cardClick.emit();
    }
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteClick.emit();
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }
}
