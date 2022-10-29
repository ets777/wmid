import { Component, OnInit } from '@angular/core';
import { GoalService } from '../goal.service';
import { GoalProgress } from '../../classes/GoalProgress';

@Component({
  selector: 'app-goals-index-block',
  templateUrl: './goals-index-block.component.html',
  styleUrls: ['./goals-index-block.component.sass']
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
