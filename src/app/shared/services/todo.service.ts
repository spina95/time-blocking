import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventService } from './event.service';

export interface Todo {
  id: number;
  title: string;
  duration: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  deadline?: Date | null;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosSubject = new BehaviorSubject<Todo[]>([
    { id: 1, title: 'Review PR #123', duration: 1.5, priority: 'high', completed: false, category: 'Work' },
    { id: 2, title: 'Update Documentation', duration: 0.5, priority: 'medium', completed: true, category: 'Work' },
    { id: 3, title: 'Team Meeting', duration: 1.0, priority: 'low', completed: false, category: 'Meetings' }
  ]);

  todos$ = this.todosSubject.asObservable();

  constructor(private eventService: EventService) { }

  addTodo(todo: Partial<Todo>): Todo {
    const newTodo: Todo = {
      id: Date.now(),
      title: todo.title || '',
      duration: todo.duration || 1,
      priority: todo.priority || 'medium',
      completed: false,
      deadline: todo.deadline || null,
      category: todo.category || 'Uncategorized'
    };

    const currentTodos = this.todosSubject.value;
    this.todosSubject.next([...currentTodos, newTodo]);

    return newTodo;
  }

  updateTodo(updatedTodo: Todo): void {
    const currentTodos = this.todosSubject.value;
    const index = currentTodos.findIndex(t => t.id === updatedTodo.id);

    if (index !== -1) {
      const newTodos = [...currentTodos];
      newTodos[index] = { ...updatedTodo };
      this.todosSubject.next(newTodos);

      // Sync with Calendar Event
      this.eventService.updateEventByTodoId(updatedTodo.id, { title: updatedTodo.title }, updatedTodo.duration);
    }
  }

  updateTodoDuration(id: number, duration: number): void {
    const currentTodos = this.todosSubject.value;
    const index = currentTodos.findIndex(t => t.id === id);

    if (index !== -1) {
      const newTodos = [...currentTodos];
      newTodos[index] = { ...newTodos[index], duration };
      this.todosSubject.next(newTodos);

      // Sync with Calendar Event
      this.eventService.updateEventByTodoId(id, {}, duration);
    }
  }

  updateTodoCompletion(id: number, completed: boolean): void {
    const currentTodos = this.todosSubject.value;
    const index = currentTodos.findIndex(t => t.id === id);

    if (index !== -1) {
      const newTodos = [...currentTodos];
      newTodos[index] = { ...newTodos[index], completed };
      this.todosSubject.next(newTodos);

      // Sync with Calendar Event
      this.eventService.updateEventByTodoId(id, {
        extendedProps: { completed: completed }
      });
    }
  }

  deleteTodo(id: number): void {
    const currentTodos = this.todosSubject.value;
    const filteredTodos = currentTodos.filter(t => t.id !== id);
    this.todosSubject.next(filteredTodos);

    // Delete associated calendar event
    this.eventService.deleteEventByTodoId(id);
  }

  updateTodos(todos: Todo[]): void {
    this.todosSubject.next(todos);
  }

  getTodos(): Todo[] {
    return this.todosSubject.value;
  }
}
