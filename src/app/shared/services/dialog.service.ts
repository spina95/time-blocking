import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DialogConfig {
  visible: boolean;
  title: string;
  content?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogState = new BehaviorSubject<DialogConfig>({
    visible: false,
    title: '',
    content: null
  });

  dialogState$ = this.dialogState.asObservable();

  openDialog(title: string, content?: any): void {
    this.dialogState.next({ visible: true, title, content });
  }

  closeDialog(): void {
    this.dialogState.next({ visible: false, title: '', content: null });
  }
}
