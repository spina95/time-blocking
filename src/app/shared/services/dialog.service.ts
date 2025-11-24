import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DialogConfig {
  visible: boolean;
  title: string;
  content?: any;
  context?: any; // Extra data like start/end time
  type?: 'default' | 'confirm' | 'project';
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogState = new BehaviorSubject<DialogConfig>({
    visible: false,
    title: '',
    content: null,
    context: null,
    type: 'default'
  });

  dialogState$ = this.dialogState.asObservable();

  openDialog(title: string, content?: any, context?: any, type: 'default' | 'confirm' | 'project' = 'default'): void {
    this.dialogState.next({ visible: true, title, content, context, type });
  }

  closeDialog(): void {
    this.dialogState.next({ visible: false, title: '', content: null, context: null, type: 'default' });
  }
}
