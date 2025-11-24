import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { SelectComponent, SelectOption } from '../select/select.component';
import { NumberInputComponent } from '../number-input/number-input.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { TodoService, Todo } from '../../services/todo.service';

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
    priority: 'medium',
    recurrence: 'none',
    projectId: 1
  };

  @Input() isEditMode: boolean = false;

  @Output() save = new EventEmitter<Partial<Todo>>();
  @Output() cancel = new EventEmitter<void>();

  priorityOptions: SelectOption[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' }
  ];

  recurrenceOptions: SelectOption[] = [
    { label: 'None', value: 'none' },
    { label: 'Every Day', value: 'daily' },
    { label: 'Every Week', value: 'weekly' },
    { label: 'Every Month', value: 'monthly' }
  ];

  projects: { label: string; value: number }[] = [];

  constructor(private todoService: TodoService) {
    this.projects = this.todoService.getProjects().map(p => ({ label: p.name, value: p.id }));
  }

  onSave(): void {
    if (this.task.title && this.task.duration) {
      this.save.emit(this.task);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
