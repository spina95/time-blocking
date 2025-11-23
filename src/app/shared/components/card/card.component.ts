import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';

/**
 * Reusable Card Component
 * Wraps NG-ZORRO card with glassmorphism styling.
 * 
 * @example
 * <app-card title="My Card">Content</app-card>
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, NzCardModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  /**
   * Title of the card.
   */
  @Input() title: string | TemplateRef<void> | undefined = undefined;

  /**
   * Extra content in the top right corner.
   */
  @Input() extra: string | TemplateRef<void> | undefined = undefined;

  /**
   * Whether to show a loading indicator.
   */
  @Input() loading: boolean = false;

  /**
   * Whether the card has a transparent glass effect.
   * Default is true.
   */
  @Input() glass: boolean = true;
}
