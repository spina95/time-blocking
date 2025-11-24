import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventService } from './event.service';

export interface Project {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Todo {
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

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosSubject = new BehaviorSubject<Todo[]>([
    { id: 1, title: 'Complete project proposal', duration: 2, priority: 'high', completed: false, projectId: 1, category: 'Deep Work' },
    { id: 2, title: 'Review team updates', duration: 0.5, priority: 'medium', completed: true, projectId: 1, category: 'Quick Tasks' },
    { id: 3, title: 'Prepare presentation slides', duration: 1.5, priority: 'high', completed: false, projectId: 1, category: 'Deep Work' },
    { id: 4, title: 'Email client regarding feedback', duration: 0.25, priority: 'low', completed: false, projectId: 1, category: 'Communication' },
    { id: 5, title: 'Buy groceries', duration: 1, priority: 'medium', completed: false, projectId: 2, category: 'Errands' },
    { id: 6, title: 'Call mom', duration: 0.5, priority: 'high', completed: false, projectId: 2, category: 'Communication' },
    { id: 7, title: 'Paint a landscape', duration: 3, priority: 'medium', completed: false, projectId: 3, category: 'Creative' }
  ]);

  private projectsSubject = new BehaviorSubject<Project[]>([
    { id: 1, name: 'Work', icon: 'briefcase', color: '#1890ff' }, // Blue
    { id: 2, name: 'Personal', icon: 'user', color: '#52c41a' }, // Green
    { id: 3, name: 'Hobby', icon: 'heart', color: '#fa8c16' }   // Orange
  ]);

  private selectedProjectIdSubject = new BehaviorSubject<number>(1);

  todos$ = this.todosSubject.asObservable();
  projects$ = this.projectsSubject.asObservable();
  selectedProjectId$ = this.selectedProjectIdSubject.asObservable();

  activeTodos$ = combineLatest([this.todos$, this.selectedProjectId$]).pipe(
    map(([todos, selectedProjectId]) => todos.filter(todo => todo.projectId === selectedProjectId))
  );

  constructor(private eventService: EventService) { }

  addTodo(todo: Partial<Todo>): Todo {
    const currentProjectId = this.selectedProjectIdSubject.value;
    const newTodo: Todo = {
      id: Date.now(),
      title: todo.title || 'New Task',
      duration: todo.duration || 1,
      priority: todo.priority || 'medium',
      completed: false,
      projectId: todo.projectId || currentProjectId, // Use provided projectId or current
      category: todo.category || 'Uncategorized',
      deadline: todo.deadline,
      recurrence: todo.recurrence
    };

    const currentTodos = this.todosSubject.value;
    this.todosSubject.next([...currentTodos, newTodo]);
    return newTodo;
  }

  createTodo(todo: Partial<Todo>, context?: any): void {
    const createdTodo = this.addTodo(todo);

    // If context has start/end, create calendar event(s)
    if (context && context.start && context.end) {
      const recurrence = createdTodo.recurrence || 'none';

      if (recurrence === 'none') {
        // Single event
        const newEvent = {
          id: String(Date.now()),
          title: createdTodo.title,
          start: context.start,
          end: context.end,
          allDay: context.allDay,
          extendedProps: {
            todoId: createdTodo.id,
            completed: false
          }
        };
        this.eventService.addEvent(newEvent);
      } else {
        // Recurring events
        this.createRecurringEvents(createdTodo, context.start, context.end, context.allDay, recurrence);
      }
    }
  }

  private createRecurringEvents(todo: Todo, startDate: Date, endDate: Date, allDay: boolean, recurrence: 'daily' | 'weekly' | 'monthly'): void {
    const occurrences = recurrence === 'daily' ? 30 : 12;
    const duration = endDate.getTime() - startDate.getTime();

    for (let i = 0; i < occurrences; i++) {
      let newStart: Date;
      let newEnd: Date;

      if (recurrence === 'daily') {
        newStart = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
        newEnd = new Date(newStart.getTime() + duration);
      } else if (recurrence === 'weekly') {
        newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() + (i * 7));
        newEnd = new Date(newStart.getTime() + duration);
      } else { // monthly
        newStart = new Date(startDate);
        newStart.setMonth(startDate.getMonth() + i);
        newEnd = new Date(newStart.getTime() + duration);
      }

      const event = {
        id: `${Date.now()}-${i}`,
        title: todo.title,
        start: newStart,
        end: newEnd,
        allDay: allDay,
        extendedProps: {
          todoId: todo.id,
          completed: false,
          recurrenceIndex: i
        }
      };

      this.eventService.addEvent(event);
    }
  }

  selectProject(projectId: number): void {
    this.selectedProjectIdSubject.next(projectId);
  }

  getProjects(): Project[] {
    return this.projectsSubject.value;
  }

  getTodoById(id: number): Todo | undefined {
    return this.todosSubject.value.find(t => t.id === id);
  }

  addProject(name: string, icon: string, color: string): void {
    const currentProjects = this.projectsSubject.value;
    const newProject: Project = {
      id: Date.now(),
      name,
      icon,
      color
    };
    this.projectsSubject.next([...currentProjects, newProject]);
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
      // Create new array but preserve references to unchanged todos
      const newTodos = currentTodos.map((todo, i) =>
        i === index ? { ...todo, completed } : todo
      );
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
