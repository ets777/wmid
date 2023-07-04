import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { IndexPageComponent } from './index-page/index-page.component';
import { TaskAddPageComponent } from './tasks/component/task-add-page/task-add-page.component';
import { GrowthHistoryIndexBlockComponent } from './growth-history-index-block/growth-history-index-block.component';
import { GrowthProgressIndexBlockComponent } from './growth-progress-index-block/growth-progress-index-block.component';
import { SignInComponent } from './auth/component/sign-in/sign-in.component';
import { GoalsIndexBlockComponent } from './goals-index-block/goals-index-block.component';
import { MealsIndexBlockComponent } from './meals-index-block/meals-index-block.component';
import { MealAddPageComponent } from './meal-add-page/meal-add-page.component';
import { UserListComponent } from './users/user-list/user-list.component';

import { AuthGuard } from './auth/guard/auth.guard';
import { TokenInterceptorService } from './interceptors/token-interceptor.service';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    RouterModule.forRoot([
      { path: '', component: IndexPageComponent, canActivate: [AuthGuard] },
      {
        path: 'add-task',
        component: TaskAddPageComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'users/list',
        component: UserListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'add-meal',
        component: MealAddPageComponent,
        canActivate: [AuthGuard],
      },
      { path: 'sign-in', component: SignInComponent },
    ]),
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    IndexPageComponent,
    TaskAddPageComponent,
    GrowthHistoryIndexBlockComponent,
    GrowthProgressIndexBlockComponent,
    SignInComponent,
    GoalsIndexBlockComponent,
    MealsIndexBlockComponent,
    MealAddPageComponent,
    UserListComponent,
  ],
  bootstrap: [AppComponent],
  providers: [
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
  ],
})
export class AppModule {}
