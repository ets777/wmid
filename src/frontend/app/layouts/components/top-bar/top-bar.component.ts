import { Component } from '@angular/core';
import { AuthService } from 'app/features/auth/services/auth.service';

@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.sass'],
    standalone: false,
})
export class TopBarComponent {
    constructor(public authService: AuthService) { }
}
