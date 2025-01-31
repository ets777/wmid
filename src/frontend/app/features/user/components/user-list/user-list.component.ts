import { Component, OnInit } from '@angular/core';
import { UsersService } from 'app/features/user/services/users.service';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.sass'],
    standalone: false,
})
export class UserListComponent implements OnInit {
    constructor(private usersService: UsersService) { }

    ngOnInit(): void {
        this.usersService.getAll().subscribe((result) => {
            console.log(result);
        });
    }
}
