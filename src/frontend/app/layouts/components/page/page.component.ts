import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
    selector: 'app-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.scss'],
    standalone: false,
})
export class PageComponent {
    @Input() title = '';

    constructor(
        private navCtrl: NavController,
        private router: Router,
    ) {}

    protected goBack(): void {
        this.navCtrl.back();
    }

    protected isHomePage(): boolean {
        return this.router.url === '/';
    }
}
