import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AppComponent } from './app.component';
import { SessionInterceptorService } from './core/interceptors/session-interceptor.interceptor';
import { IonicModule } from '@ionic/angular';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [
        AppComponent,
    ],
    bootstrap: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        IonicModule.forRoot({
            rippleEffect: false,
            mode: 'md',
        }),
        RouterModule.forRoot([]),
        CoreModule,
    ],
    providers: [
        CookieService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: SessionInterceptorService,
            multi: true,
        },
        provideHttpClient(withInterceptorsFromDi()),
    ],
})
export class AppModule { }
