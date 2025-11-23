import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [CommonModule, FormsModule, NzInputNumberModule],
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true
    }
  ]
})
export class NumberInputComponent implements ControlValueAccessor {
  @Input() min: number = 0;
  @Input() max: number = Infinity;
  @Input() step: number = 1;
  @Input() placeholder: string = '';

  value: number | null = null;
  disabled: boolean = false;

  onChange: (value: number | null) => void = () => { };
  onTouched: () => void = () => { };

  writeValue(value: number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onModelChange(value: number | null): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}
