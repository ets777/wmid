import { Component } from '@angular/core';
import { AuthService } from 'app/auth/auth.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.sass'],
})
export class TopBarComponent {
  constructor(public authService: AuthService) {}
}
