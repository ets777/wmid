import { Component, OnInit } from '@angular/core';
import { GrowthService } from '../tasks/service/growth.service';
import { IGrowthHistory } from '../tasks/interface/growth-history.interface';

@Component({
  selector: 'app-growth-history-index-block',
  templateUrl: './growth-history-index-block.component.html',
  styleUrls: ['./growth-history-index-block.component.sass']
})
export class GrowthHistoryIndexBlockComponent implements OnInit {
  growthHistory?: IGrowthHistory[] = [];

  constructor(private growthService: GrowthService) { }

  ngOnInit(): void {
    this.growthService
      .getLastGrowth()
      .subscribe((a) => (this.growthHistory = a));
  }
}
