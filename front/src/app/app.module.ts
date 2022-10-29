import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { IndexPageComponent } from './index-page/index-page.component';
import { TaskAddPageComponent } from './task-add-page/task-add-page.component';
import { GrowthHistoryIndexBlockComponent } from './growth-history-index-block/growth-history-index-block.component';
import { GrowthProgressIndexBlockComponent } from './growth-progress-index-block/growth-progress-index-block.component';
import { LoginPageComponent } from './login-page/login-page.component';

import { AuthGuard } from './auth.guard';
import { GoalsIndexBlockComponent } from './goals-index-block/goals-index-block.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    RouterModule.forRoot([
      { path: '', component: IndexPageComponent, canActivate: [AuthGuard] },
      { path: 'add-task', component: TaskAddPageComponent, canActivate: [AuthGuard] },
      { path: 'login', component: LoginPageComponent },
    ])
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    IndexPageComponent,
    TaskAddPageComponent,
    GrowthHistoryIndexBlockComponent,
    GrowthProgressIndexBlockComponent,
    LoginPageComponent,
    GoalsIndexBlockComponent
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }