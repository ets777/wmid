import { Component, OnInit } from '@angular/core';
import { GrowthService } from '../growth.service';
import { GrowthProgress } from '../../classes/GrowthProgress';

@Component({
  selector: 'app-growth-progress-index-block',
  templateUrl: './growth-progress-index-block.component.html',
  styleUrls: ['./growth-progress-index-block.component.sass']
})
export class GrowthProgressIndexBlockComponent implements OnInit {

  growthProgress?: GrowthProgress;
  percent: number = 0;

  constructor(
    private growthService: GrowthService
  ) { }
  
  ngOnInit(): void {
    this
      .growthService
      .getGrowthProgress()
      .toPromise()
      .then(a => {
        if (a) {
          this.growthProgress = a;
          this.percent = Math.round(this.growthProgress?.completed * 100 / this.growthProgress?.total);
        }
      });
  }
}
