import { AbstractControl } from '@angular/forms';

export function getErrorMessage(control: AbstractControl): string {
    if (control.hasError('required')) {
        return 'This field is required';
    }

    if (control.hasError('minlength')) {
        return `Minimum length is ${control.errors?.['minlength'].requiredLength}`
    };

    if (control.hasError('email')) {
        return 'Invalid email address'
    };

    if (control.hasError('usernameTaken')) {
        return 'This username is already taken';
    }

    if (control.hasError('emailTaken')) {
        return 'This email is already registered';
    }
    
    return '';
}