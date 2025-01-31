import { Injectable } from '@angular/core';
import { Config } from 'app/core/classes/Config';
import { HttpClient } from '@angular/common/http';
import { GoalProgress } from 'app/features/goal/classes/GoalProgress';

@Injectable({
    providedIn: 'root',
})
export class GoalService {

    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<GoalProgress[]>(`${Config.getRoot()}/back/get_goals.php`);
    }
}
