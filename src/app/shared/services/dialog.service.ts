import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DialogConfig {
  visible: boolean;
  title: string;
  content?: any;
  context?: any; // Extra data like start/end time
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogState = new BehaviorSubject<DialogConfig>({
    visible: false,
    title: '',
    content: null,
    context: null
  });

  dialogState$ = this.dialogState.asObservable();

  openDialog(title: string, content?: any, context?: any): void {
    this.dialogState.next({ visible: true, title, content, context });
  }

  closeDialog(): void {
    this.dialogState.next({ visible: false, title: '', content: null, context: null });
  }
}
