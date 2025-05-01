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

    protected getCurrentPoints(): number {
        if (!this.user) {
            return 0;
        }
        
        const earned = this.user.totalEarnedPoints || 0;
        const spent = this.user.totalSpentPoints || 0;
        const current = earned - spent;
        
        return current > 0 ? current : 0;
    }
}
