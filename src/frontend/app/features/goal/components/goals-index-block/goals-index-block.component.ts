import { Component, OnInit } from '@angular/core';
import { GoalService } from 'app/features/goal/services/goal.service';
import { GoalProgress } from 'app/features/goal/classes/GoalProgress';

@Component({
    selector: 'app-goals-index-block',
    templateUrl: './goals-index-block.component.html',
    styleUrls: ['./goals-index-block.component.sass'],
    standalone: false,
})
export class GoalsIndexBlockComponent implements OnInit {

    goalProgress: GoalProgress[] = [];

    constructor(
        private goalService: GoalService
    ) { }

    ngOnInit(): void {
        this
            .goalService
            .getAll()
            .subscribe(a => {
                if (a) {
                    this.goalProgress = a;
                }
            });
    }

}
