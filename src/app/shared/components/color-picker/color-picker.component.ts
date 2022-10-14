import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { colorPickerHelper } from '@helpers';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ColorPickerComponent,
    },
  ],
})
export class ColorPickerComponent implements ControlValueAccessor {
  @Input() public label: string;
  @Input() public placeholder: string;
  public value: string;
  public touched = false;
  public disabled = false;
  public preset = colorPickerHelper.preset;

  onTouched = () => {};

  onChange = (values: any) => {
    console.log(values);
  };

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  writeValue(value: string) {
    if (!value) return;
    this.value = value;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  public colorChange(): void {
    this.onChange(this.value);
  }
}
