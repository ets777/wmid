import { Component, OnInit } from '@angular/core';
import { GrowthService } from '../tasks/service/growth.service';
import { IGrowthProgress } from '../tasks/interface/growth-progress.interface';

@Component({
  selector: 'app-growth-progress-index-block',
  templateUrl: './growth-progress-index-block.component.html',
  styleUrls: ['./growth-progress-index-block.component.sass'],
})
export class GrowthProgressIndexBlockComponent implements OnInit {
  growthProgress?: IGrowthProgress;
  percent = 0;

  constructor(private growthService: GrowthService) {}

  ngOnInit(): void {
    this.growthService.getGrowthProgress().subscribe((a) => {
      if (a) {
        this.growthProgress = a;
        this.percent = Math.round(
          (this.growthProgress?.completed * 100) / this.growthProgress?.total,
        );
      }
    });
  }
}
