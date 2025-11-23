import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { Draggable } from '@fullcalendar/interaction';

import { ButtonComponent } from '../button/button.component';
import { TodoCardComponent } from '../todo-card/todo-card.component';
import { CollapseComponent } from '../collapse/collapse.component';
import { DialogService } from '../../services/dialog.service';
import { TodoService, Todo } from '../../services/todo.service';

interface TodoGroup {
  category: string;
  todos: Todo[];
  active: boolean;
}

@Component({
  selector: 'app-todo-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzInputNumberModule,
    TodoCardComponent,
    ButtonComponent,
    CollapseComponent
  ],
  templateUrl: './todo-manager.component.html',
  styleUrls: ['./todo-manager.component.scss']
})
export class TodoManagerComponent implements OnInit, AfterViewInit, OnDestroy {
  todos: Todo[] = [];
  groupedTodos: TodoGroup[] = [];
  draggable: Draggable | null = null;

  @ViewChild('categoryList', { static: false }) categoryListEl!: ElementRef;

  constructor(
    private dialogService: DialogService,
    private todoService: TodoService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.todoService.todos$.subscribe(todos => {
      this.todos = todos;
      this.groupTodosByCategory();
      // Re-initialize draggable after view updates if needed, but usually one init on container is enough if using itemSelector
      // However, since items are dynamic, we might need to ensure the container is ready.
      // The AfterViewInit handles the initial setup.
    });
  }

  ngAfterViewInit(): void {
    // We need to wait for the view to be ready.
    // Using a timeout to ensure DOM is rendered for the selector to work if items are added dynamically
    setTimeout(() => {
      this.initDraggable();
    });
  }

  ngOnDestroy(): void {
    if (this.draggable) {
      this.draggable.destroy();
    }
  }

  initDraggable(): void {
    if (this.draggable) {
      this.draggable.destroy();
    }

    // Initialize Draggable on the main container that holds the lists
    // We use the component's native element as the container
    this.draggable = new Draggable(this.elementRef.nativeElement, {
      itemSelector: '.fc-draggable-event',
      eventData: (eventEl) => {
        const title = eventEl.getAttribute('data-event-title');
        const duration = eventEl.getAttribute('data-event-duration');
        const todoId = eventEl.getAttribute('data-event-id');

        // Convert duration (hours) to HH:mm format
        const durationNum = parseFloat(duration || '1');
        const hours = Math.floor(durationNum);
        const minutes = Math.round((durationNum - hours) * 60);
        const durationStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        return {
          title: title,
          duration: durationStr,
          create: true, // Make sure it's created as a real event upon drop
          extendedProps: {
            todoId: todoId ? parseInt(todoId, 10) : null
          }
        };
      }
    });
  }

  groupTodosByCategory(): void {
    const groups = new Map<string, Todo[]>();

    this.todos.forEach(todo => {
      const category = todo.category || 'Uncategorized';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(todo);
    });

    this.groupedTodos = Array.from(groups.entries()).map(([category, todos]) => ({
      category,
      todos,
      active: true // All panels open by default
    }));
  }

  drop(event: CdkDragDrop<Todo[]>, targetCategory: string): void {
    if (event.previousContainer === event.container) {
      // Same category - just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Different category - transfer and update category
      const movedTodo = event.previousContainer.data[event.previousIndex];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update the todo's category
      movedTodo.category = targetCategory;
    }

    // Rebuild the full todos array maintaining the new order
    const allTodos: Todo[] = [];
    this.groupedTodos.forEach(group => {
      allTodos.push(...group.todos);
    });

    this.todoService.updateTodos(allTodos);
  }

  openDialog(): void {
    this.dialogService.openDialog('Create New Task', {
      title: '',
      duration: 1,
      priority: 'medium'
    });
  }

  editTodo(todo: Todo): void {
    this.dialogService.openDialog('Edit Task', {
      id: todo.id,
      title: todo.title,
      duration: todo.duration,
      priority: todo.priority,
      deadline: todo.deadline,
      category: todo.category
    });
  }

  toggleTodoCompletion(todo: Todo, completed: boolean): void {
    this.todoService.updateTodoCompletion(todo.id, completed);
  }
}
