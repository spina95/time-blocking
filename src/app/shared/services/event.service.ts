import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date | string;
    end?: Date | string;
    allDay?: boolean;
    extendedProps?: any;
}

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
    events$ = this.eventsSubject.asObservable();

    constructor() {
        // Initialize with some dummy data if needed
        this.eventsSubject.next([
            { id: '1', title: 'Meeting', start: new Date() }
        ]);
    }

    getEvents(): CalendarEvent[] {
        return this.eventsSubject.value;
    }

    addEvent(event: CalendarEvent): void {
        const currentEvents = this.getEvents();
        this.eventsSubject.next([...currentEvents, event]);
    }

    updateEvent(updatedEvent: CalendarEvent): void {
        const currentEvents = this.getEvents();
        const index = currentEvents.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
            currentEvents[index] = updatedEvent;
            this.eventsSubject.next([...currentEvents]);
        }
    }

    deleteEvent(eventId: string): void {
        const currentEvents = this.getEvents();
        this.eventsSubject.next(currentEvents.filter(e => e.id !== eventId));
    }

    updateEventByTodoId(todoId: number, changes: Partial<CalendarEvent>, durationHours?: number): void {
        const currentEvents = this.getEvents();
        const index = currentEvents.findIndex(e => e.extendedProps?.todoId === todoId);

        if (index !== -1) {
            const event = currentEvents[index];

            // Handle extendedProps merge
            let mergedExtendedProps = event.extendedProps;
            if (changes.extendedProps) {
                mergedExtendedProps = { ...event.extendedProps, ...changes.extendedProps };
            }

            let newEvent = {
                ...event,
                ...changes,
                extendedProps: mergedExtendedProps
            };

            // If duration is provided, calculate new end time
            if (durationHours !== undefined && event.start) {
                const startTime = new Date(event.start).getTime();
                const newEndTime = new Date(startTime + durationHours * 60 * 60 * 1000);
                newEvent.end = newEndTime;
            }

            currentEvents[index] = newEvent;
            this.eventsSubject.next([...currentEvents]);
        }
    }
}
