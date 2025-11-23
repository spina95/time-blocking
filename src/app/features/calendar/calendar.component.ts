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
            const newEvent = {
                id: String(Date.now()), // Generate a simple ID
                title: info.event.title,
                start: info.event.start!,
                end: info.event.end || undefined,
                allDay: info.event.allDay,
                extendedProps: {
                    todoId: info.event.extendedProps['todoId'],
                    completed: false // Default to not completed
                }
            };
            this.eventService.addEvent(newEvent);
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
}
