import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/features/auth/services/auth.service';
import { IUser } from 'app/features/auth/interfaces/User.interface';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: false,
})
export class ProfileComponent implements OnInit {
    protected user: IUser;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.user = this.authService.getUser();
    }

    protected signOut(): void {
        this.authService.signOut().subscribe();
    }
}
