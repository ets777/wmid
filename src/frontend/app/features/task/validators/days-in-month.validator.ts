import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function daysInMonthValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const month = formGroup.value.month;
        const day = formGroup.value.day;
        const year = 2025;

        if (month === null || day === null) {
            return null;
        }

        const daysInMonth = new Date(year, month, 0).getDate();

        return day > daysInMonth
            ? { invalidDays: { maxDays: daysInMonth } }
            : null;
    };
}