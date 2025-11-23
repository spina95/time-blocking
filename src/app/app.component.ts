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
import { DialogService } from './shared/services/dialog.service';
import { TodoService } from './shared/services/todo.service';

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
    CreateTaskFormComponent
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

  constructor(
    private dialogService: DialogService,
    private todoService: TodoService
  ) { }

  ngOnInit(): void {
    this.dialogService.dialogState$.subscribe(state => {
      this.isDialogOpen = state.visible;
      this.dialogTitle = state.title;
      if (state.content) {
        this.newTodo = state.content;
        this.isEditMode = !!state.content.id; // Edit mode if id exists
      }
    });
  }

  closeDialog(): void {
    this.dialogService.closeDialog();
    this.isEditMode = false;
  }

  addTodo(): void {
    if (this.newTodo.title && this.newTodo.duration) {
      if (this.isEditMode && this.newTodo.id) {
        // Update existing todo
        this.todoService.updateTodo(this.newTodo as Todo);
      } else {
        // Create new todo
        this.todoService.addTodo(this.newTodo);
      }
      this.closeDialog();
    }
  }
}
