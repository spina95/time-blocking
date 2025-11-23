import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { MainContentComponent } from './core/layout/main-content/main-content.component';
import { AppDialogComponent } from './shared/components/app-dialog/app-dialog.component';
import { CreateTaskFormComponent } from './shared/components/create-task-form/create-task-form.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { DialogService } from './shared/services/dialog.service';
import { TodoService } from './shared/services/todo.service';
import { EventService } from './shared/services/event.service';

interface Todo {
  id: number;
  title: string;
  duration: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzLayoutModule,
    NzInputModule,
    NzSelectModule,
    NzInputNumberModule,
    NzButtonModule,
    SidebarComponent,
    MainContentComponent,
    AppDialogComponent,
    CreateTaskFormComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'time-blocking';

  isDialogOpen = false;
  dialogTitle = '';
  isEditMode = false;
  newTodo: Partial<Todo> = {
    title: '',
    duration: 1,
    priority: 'medium'
  };
  dialogContext: any = null;

  // Confirmation dialog state
  isConfirmDialogOpen = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  pendingDeleteTodoId: number | null = null;

  constructor(
    private dialogService: DialogService,
    private todoService: TodoService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.dialogService.dialogState$.subscribe(state => {
      // Check if this is a delete confirmation
      if (state.visible && state.content?.message && state.content?.todoId) {
        this.isConfirmDialogOpen = true;
        this.confirmDialogTitle = state.title;
        this.confirmDialogMessage = state.content.message;
        this.pendingDeleteTodoId = state.content.todoId;
      } else {
        this.isDialogOpen = state.visible;
        this.dialogTitle = state.title;
        this.dialogContext = state.context;
        if (state.content && !state.content.message) {
          this.newTodo = state.content;
          this.isEditMode = !!state.content.id; // Edit mode if id exists
        }
      }
    });
  }

  closeDialog(): void {
    this.dialogService.closeDialog();
    this.isEditMode = false;
    this.dialogContext = null;
  }

  closeConfirmDialog(): void {
    this.isConfirmDialogOpen = false;
    this.confirmDialogTitle = '';
    this.confirmDialogMessage = '';
    this.pendingDeleteTodoId = null;
    this.dialogService.closeDialog();
  }

  handleDeleteConfirm(): void {
    if (this.pendingDeleteTodoId !== null) {
      this.todoService.deleteTodo(this.pendingDeleteTodoId);
    }
    this.closeConfirmDialog();
  }

  addTodo(): void {
    if (this.newTodo.title && this.newTodo.duration) {
      if (this.isEditMode && this.newTodo.id) {
        // Update existing todo
        this.todoService.updateTodo(this.newTodo as Todo);
      } else {
        // Create new todo
        const createdTodo = this.todoService.addTodo(this.newTodo);

        // If context has start/end, create calendar event
        if (this.dialogContext && this.dialogContext.start && this.dialogContext.end) {
          const newEvent = {
            id: String(Date.now()),
            title: createdTodo.title,
            start: this.dialogContext.start,
            end: this.dialogContext.end,
            allDay: this.dialogContext.allDay,
            extendedProps: {
              todoId: createdTodo.id,
              completed: false
            }
          };
          this.eventService.addEvent(newEvent);
        }
      }
      this.closeDialog();
    }
  }
}
