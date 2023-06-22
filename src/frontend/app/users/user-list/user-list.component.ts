import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.sass'],
})
export class UserListComponent implements OnInit {
  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.usersService.getAll().subscribe((result) => {
      console.log(result);
    });
  }
}
