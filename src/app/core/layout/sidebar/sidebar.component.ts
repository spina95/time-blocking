import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { TodoManagerComponent } from '../../../shared/components/todo-manager/todo-manager.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    TodoManagerComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  sidebarWidth = 250;
  isResizing = false;

  ngOnInit() {
    this.sidebarWidth = Math.max(250, window.innerWidth * 0.2);
  }

  startResizing(event: MouseEvent): void {
    this.isResizing = true;
    event.preventDefault();
    document.addEventListener('mousemove', this.handleResizing);
    document.addEventListener('mouseup', this.stopResizing);
  }

  handleResizing = (event: MouseEvent): void => {
    if (this.isResizing) {
      // Limit width between 250px and 500px
      const newWidth = Math.max(250, Math.min(event.clientX, 400));
      this.sidebarWidth = newWidth;
    }
  };

  stopResizing = (): void => {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.handleResizing);
    document.removeEventListener('mouseup', this.stopResizing);
  };
}
