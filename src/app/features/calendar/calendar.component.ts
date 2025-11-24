import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService } from '../../shared/services/event.service';
import { TodoService } from '../../shared/services/todo.service';

import { DialogService } from '../../shared/services/dialog.service';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, FullCalendarModule],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev next today',
            center: 'title',
            right: 'dayGridMonth timeGridWeek timeGridDay listWeek'
        },
        weekends: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        droppable: true, // Enable dropping
        events: [],
        select: (info) => {
            // Calculate duration in hours
            const start = info.start.getTime();
            const end = info.end.getTime();
            const durationMs = end - start;
            const durationHours = durationMs / (1000 * 60 * 60);
            const roundedDuration = Math.round(durationHours * 10) / 10;

            this.dialogService.openDialog('Create New Task', {
                title: '',
                duration: roundedDuration,
                priority: 'medium'
            }, {
                start: info.start,
                end: info.end,
                allDay: info.allDay
            });
        },
        eventReceive: (info) => {
            // Called when an external element is dropped
            const todoId = info.event.extendedProps['todoId'];

            // Get the full todo to check for recurrence
            const todo = this.todoService.getTodoById(todoId);

            if (todo && todo.recurrence && todo.recurrence !== 'none') {
                // Create recurring events
                const start = info.event.start!;
                const end = info.event.end || new Date(start.getTime() + (todo.duration * 60 * 60 * 1000));
                const allDay = info.event.allDay;

                this.createRecurringEventsFromDrop(todo, start, end, allDay, todo.recurrence);

                // Remove the temporary event created by FullCalendar
                info.event.remove();
            } else {
                // Single event (no recurrence)
                const newEvent = {
                    id: String(Date.now()),
                    title: info.event.title,
                    start: info.event.start!,
                    end: info.event.end || undefined,
                    allDay: info.event.allDay,
                    extendedProps: {
                        todoId: todoId,
                        completed: false
                    }
                };
                this.eventService.addEvent(newEvent);
            }
        },
        eventContent: (arg) => {
            const container = document.createElement('div');
            container.className = 'custom-event-content';

            // Header Row (Checkbox + Title)
            const headerRow = document.createElement('div');
            headerRow.className = 'event-header-row';

            // Checkbox
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'event-checkbox-wrapper';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'event-checkbox';
            checkbox.checked = arg.event.extendedProps['completed'] || false;

            checkbox.addEventListener('change', (e) => {
                e.stopPropagation(); // Prevent event click
                const isChecked = (e.target as HTMLInputElement).checked;
                const todoId = arg.event.extendedProps['todoId'];

                // Update local event state
                arg.event.setExtendedProp('completed', isChecked);

                // Update TodoService
                if (todoId) {
                    this.todoService.updateTodoCompletion(todoId, isChecked);
                }

                // Update EventService
                const updatedEvent = {
                    id: arg.event.id,
                    title: arg.event.title,
                    start: arg.event.start!,
                    end: arg.event.end || undefined,
                    allDay: arg.event.allDay,
                    extendedProps: { ...arg.event.extendedProps, completed: isChecked }
                };
                this.eventService.updateEvent(updatedEvent);
            });

            // Prevent click propagation on wrapper too
            checkboxWrapper.addEventListener('click', (e) => e.stopPropagation());
            checkboxWrapper.addEventListener('mousedown', (e) => e.stopPropagation());

            checkboxWrapper.appendChild(checkbox);
            headerRow.appendChild(checkboxWrapper);

            // Title
            const title = document.createElement('div');
            title.className = 'fc-event-title';
            title.innerText = arg.event.title;
            if (arg.event.extendedProps['completed']) {
                title.style.textDecoration = 'line-through';
                title.style.opacity = '0.7';
            }
            headerRow.appendChild(title);

            container.appendChild(headerRow);

            // Delete button (positioned absolutely in bottom-right)
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'event-delete-btn';
            deleteBtn.setAttribute('nz-icon', '');
            deleteBtn.setAttribute('nzType', 'delete');
            deleteBtn.setAttribute('nzTheme', 'outline');
            deleteBtn.title = 'Delete event';
            deleteBtn.innerHTML = '<svg viewBox="64 64 896 896" focusable="false" fill="currentColor" width="1em" height="1em"><path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path></svg>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dialogService.openDialog('Delete Event', {
                    message: `Are you sure you want to delete "${arg.event.title}"? This action cannot be undone.`,
                    eventId: arg.event.id
                }, null, 'confirm');
            });
            deleteBtn.addEventListener('mousedown', (e) => e.stopPropagation());
            container.appendChild(deleteBtn);

            // Time (if not all day) - Placed below header
            if (!arg.event.allDay && arg.timeText) {
                const time = document.createElement('div');
                time.className = 'fc-event-time';
                time.innerText = arg.timeText;
                container.appendChild(time);
            }

            return { domNodes: [container] };
        },
        eventResize: (info) => {
            const todoId = info.event.extendedProps['todoId'];
            if (todoId) {
                // Calculate new duration in hours
                const start = info.event.start!.getTime();
                const end = info.event.end!.getTime();
                const durationMs = end - start;
                const durationHours = durationMs / (1000 * 60 * 60);

                // Round to 1 decimal place for cleaner display
                const roundedDuration = Math.round(durationHours * 10) / 10;

                this.todoService.updateTodoDuration(todoId, roundedDuration);
            }

            // Also update the event in the event service
            const updatedEvent = {
                id: info.event.id,
                title: info.event.title,
                start: info.event.start!,
                end: info.event.end || undefined,
                allDay: info.event.allDay,
                extendedProps: info.event.extendedProps
            };
            this.eventService.updateEvent(updatedEvent);
        },
        eventDrop: (info) => {
            // Handle internal drops (moving events)
            const updatedEvent = {
                id: info.event.id,
                title: info.event.title,
                start: info.event.start!,
                end: info.event.end || undefined,
                allDay: info.event.allDay,
                extendedProps: info.event.extendedProps
            };
            this.eventService.updateEvent(updatedEvent);
        }
    };

    constructor(
        private eventService: EventService,
        private todoService: TodoService,
        private dialogService: DialogService
    ) { }

    ngOnInit(): void {
        this.eventService.events$.subscribe(events => {
            this.calendarOptions.events = events as EventInput[];
        });
    }

    private createRecurringEventsFromDrop(todo: any, startDate: Date, endDate: Date, allDay: boolean, recurrence: 'daily' | 'weekly' | 'monthly'): void {
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
}
