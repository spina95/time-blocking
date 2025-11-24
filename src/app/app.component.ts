import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { SidebarComponent } from './core/layout/sidebar/sidebar.component';
import { MainContentComponent } from './core/layout/main-content/main-content.component';
import { AppDialogComponent } from './shared/components/app-dialog/app-dialog.component';
import { CreateTaskFormComponent } from './shared/components/create-task-form/create-task-form.component';
import { ButtonComponent } from './shared/components/button/button.component';
import { InputComponent } from './shared/components/input/input.component';
import { DialogService } from './shared/services/dialog.service';
import { TodoService } from './shared/services/todo.service';
import { EventService } from './shared/services/event.service';

interface Todo {
  id: number;
  title: string;
  duration: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  deadline?: Date | null;
  category?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  projectId?: number;
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
    NzIconModule,
    SidebarComponent,
    MainContentComponent,
    AppDialogComponent,
    CreateTaskFormComponent,
    ButtonComponent,
    InputComponent
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
  pendingDeleteEventId: string | null = null;

  // Project dialog state
  isProjectDialogOpen = false;
  newProject = { name: '', icon: 'folder', color: '#1890ff' };
  availableIcons = [
    'briefcase', 'user', 'heart', 'folder', 'star',
    'calendar', 'clock-circle', 'check-circle', 'flag',
    'rocket', 'thunderbolt', 'trophy', 'coffee', 'home'
  ];
  availableColors = [
    '#1890ff', // Blue
    '#52c41a', // Green
    '#fa8c16', // Orange
    '#f5222d', // Red
    '#722ed1', // Purple
    '#eb2f96', // Magenta
    '#13c2c2', // Cyan
    '#fadb14', // Yellow
  ];

  currentProjectId: number = 1;

  constructor(
    private dialogService: DialogService,
    private todoService: TodoService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.todoService.selectedProjectId$.subscribe(id => {
      this.currentProjectId = id;
    });

    this.dialogService.dialogState$.subscribe(state => {
      // Check dialog type
      if (state.type === 'confirm') {
        this.isConfirmDialogOpen = true;
        this.confirmDialogTitle = state.title;
        this.confirmDialogMessage = state.content?.message || '';
        this.pendingDeleteTodoId = state.content?.todoId || null;
        this.pendingDeleteEventId = state.content?.eventId || null;
      } else if (state.type === 'project') {
        this.isProjectDialogOpen = state.visible;
        this.newProject = { name: '', icon: 'folder', color: '#1890ff' }; // Reset form
      } else {
        this.isDialogOpen = state.visible;
        this.dialogTitle = state.title;
        this.dialogContext = state.context;
        if (state.content && !state.content.message) {
          this.newTodo = state.content;
          this.isEditMode = !!state.content.id; // Edit mode if id exists
        } else {
          // Initialize new task with default project
          this.newTodo = {
            title: '',
            duration: 1,
            priority: 'medium',
            projectId: this.currentProjectId,
            recurrence: 'none'
          };
          this.isEditMode = false;
        }
      }
    });
  }

  closeDialog(): void {
    this.dialogService.closeDialog();
    this.isEditMode = false;
    this.dialogContext = null;
    this.isProjectDialogOpen = false;
  }

  closeConfirmDialog(): void {
    this.isConfirmDialogOpen = false;
    this.confirmDialogTitle = '';
    this.confirmDialogMessage = '';
    this.pendingDeleteTodoId = null;
    this.pendingDeleteEventId = null;
    this.dialogService.closeDialog();
  }

  handleDeleteConfirm(): void {
    if (this.pendingDeleteTodoId !== null) {
      this.todoService.deleteTodo(this.pendingDeleteTodoId);
    } else if (this.pendingDeleteEventId !== null) {
      this.eventService.deleteEvent(this.pendingDeleteEventId);
    }
    this.closeConfirmDialog();
  }

  createProject(): void {
    if (this.newProject.name && this.newProject.icon && this.newProject.color) {
      this.todoService.addProject(this.newProject.name, this.newProject.icon, this.newProject.color);
      this.closeDialog();
    }
  }

  addTodo(task?: Partial<Todo>): void {
    // Use the task from the form if provided, otherwise use newTodo
    const todoToSave = task || this.newTodo;

    if (todoToSave.title && todoToSave.duration) {
      if (this.isEditMode && todoToSave.id) {
        // Update existing todo
        this.todoService.updateTodo(todoToSave as Todo);
      } else {
        // Create new todo
        this.todoService.createTodo(todoToSave, this.dialogContext);
      }
      this.closeDialog();
    }
  }
}
