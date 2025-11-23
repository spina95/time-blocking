import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Reusable Button Component
 * Wraps NG-ZORRO button with custom styling and behavior.
 * 
 * @example
 * <app-button label="Click Me" (onClick)="handleClick()"></app-button>
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  /**
   * The text to display on the button.
   */
  @Input() label: string = '';

  /**
   * The type of the button.
   * Can be 'primary', 'default', 'dashed', 'text', 'link'.
   * Default is 'primary'.
   */
  @Input() type: 'primary' | 'default' | 'dashed' | 'text' | 'link' = 'primary';

  /**
   * The size of the button.
   * Can be 'large', 'default', 'small'.
   * Default is 'default'.
   */
  @Input() size: 'large' | 'default' | 'small' = 'default';

  /**
   * Whether the button is disabled.
   */
  @Input() disabled: boolean = false;

  /**
   * Whether the button is in loading state.
   */
  @Input() loading: boolean = false;

  /**
   * Optional icon to display.
   */
  @Input() icon: string | null = null;

  /**
   * Whether the button fits the width of its parent container.
   */
  @Input() block: boolean = false;

  /**
   * Event emitted when the button is clicked.
   */
  @Output() onClick = new EventEmitter<MouseEvent>();

  @HostBinding('class.block-button')
  get isBlock(): boolean {
    return this.block;
  }

  /**
   * Handles the button click event.
   * @param event The mouse event.
   */
  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }
}
