import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { SelectComponent, SelectOption } from '../select/select.component';
import { NumberInputComponent } from '../number-input/number-input.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';

interface Todo {
  id?: number;
  title: string;
  duration: number;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
  deadline?: Date | null;
  category?: string;
}

@Component({
  selector: 'app-create-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    NumberInputComponent,
    DatePickerComponent
  ],
  templateUrl: './create-task-form.component.html',
  styleUrls: ['./create-task-form.component.scss']
})
export class CreateTaskFormComponent {
  @Input() task: Partial<Todo> = {
    title: '',
    duration: 1,
    priority: 'medium'
  };

  @Input() isEditMode: boolean = false;

  @Output() save = new EventEmitter<Partial<Todo>>();
  @Output() cancel = new EventEmitter<void>();

  priorityOptions: SelectOption[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }
  ];

  onSave(): void {
    if (this.task.title && this.task.duration) {
      this.save.emit(this.task);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
