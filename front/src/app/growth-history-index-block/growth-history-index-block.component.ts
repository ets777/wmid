import { Component, OnInit } from '@angular/core';
import { GrowthService } from '../growth.service';
import { GrowthHistory } from '../../classes/GrowthHistory';

@Component({
  selector: 'app-growth-history-index-block',
  templateUrl: './growth-history-index-block.component.html',
  styleUrls: ['./growth-history-index-block.component.sass']
})
export class GrowthHistoryIndexBlockComponent implements OnInit {

  growthHistory?: GrowthHistory[] = [];

  constructor(
    private growthService: GrowthService
  ) { }

  ngOnInit(): void {
    this
      .growthService
      .getLastGrowth()
      .subscribe(a => this.growthHistory = a);
  }

}
