import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TodoService, Project } from '../../services/todo.service';
import { DialogService } from '../../services/dialog.service';

@Component({
    selector: 'app-project-carousel',
    standalone: true,
    imports: [
        CommonModule,
        NzIconModule
    ],
    templateUrl: './project-carousel.component.html',
    styleUrls: ['./project-carousel.component.scss']
})
export class ProjectCarouselComponent implements OnInit {
    projects: Project[] = [];
    selectedProjectId: number = 1;

    @ViewChild('projectList') projectList!: ElementRef<HTMLElement>;
    isDragging = false;
    startX = 0;
    scrollLeft = 0;

    availableIcons = [
        'briefcase', 'user', 'heart', 'folder', 'star',
        'calendar', 'clock-circle', 'check-circle', 'flag',
        'rocket', 'thunderbolt', 'trophy', 'coffee', 'home'
    ];

    constructor(
        private todoService: TodoService,
        private dialogService: DialogService // Injected DialogService
    ) { }

    ngOnInit(): void {
        this.todoService.projects$.subscribe(projects => {
            this.projects = projects;
        });

        this.todoService.selectedProjectId$.subscribe(id => {
            this.selectedProjectId = id;
        });
    }

    selectProject(project: Project): void {
        if (!this.isDragging) {
            this.todoService.selectProject(project.id);
        }
    }

    openAddProjectDialog(): void {
        if (!this.isDragging) {
            this.dialogService.openDialog('Create New Project', null, null, 'project');
        }
    }

    onMouseDown(e: MouseEvent): void {
        this.isDragging = false;
        this.startX = e.pageX - this.projectList.nativeElement.offsetLeft;
        this.scrollLeft = this.projectList.nativeElement.scrollLeft;

        // Add listeners to document to handle drag outside component
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    onMouseMove = (e: MouseEvent): void => {
        if (!this.startX) return;

        e.preventDefault();
        const x = e.pageX - this.projectList.nativeElement.offsetLeft;
        const walk = (x - this.startX) * 2; // Scroll-fast

        // If moved significantly, consider it a drag
        if (Math.abs(walk) > 5) {
            this.isDragging = true;
            this.projectList.nativeElement.scrollLeft = this.scrollLeft - walk;
        }
    }

    onMouseUp = (): void => {
        // Clean up listeners
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);

        // Reset drag state after a short delay to prevent click event from firing immediately if it was a drag
        setTimeout(() => {
            this.isDragging = false;
        }, 50);
    }
}
