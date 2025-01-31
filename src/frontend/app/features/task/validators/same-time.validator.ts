import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function sameTimeValidator(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
        if (!formArray || !formArray['controls']) {
            return null;
        }

        const controls = formArray['controls'];

        if (controls.length < 2) {
            return null;
        }

        const controlsWithoutDate = controls
            .filter(
                (control: FormGroup) =>
                    !control.get('date')?.value
                    && !control.get('month')?.value
                    && !control.get('day')?.value
                    && !control.get('weekday')?.value
            );

        const firstTime = controlsWithoutDate[0]?.get('startTime')?.value;
        const endTime = controlsWithoutDate[0]?.get('endTime')?.value;

        const hasDifferentTime = controls
            .filter((_, i) => i > 0)
            .some((control: FormGroup) => control.get('startTime')?.value
                && control.get('startTime')?.value !== firstTime
                || control.get('endTime')?.value
                && control.get('endTime')?.value !== endTime
            );

        return hasDifferentTime ? { timesNotMatching: true } : null;
    };
}
