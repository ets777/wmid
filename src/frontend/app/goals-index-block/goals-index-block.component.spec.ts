import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalsIndexBlockComponent } from './goals-index-block.component';

describe('GoalsIndexBlockComponent', () => {
  let component: GoalsIndexBlockComponent;
  let fixture: ComponentFixture<GoalsIndexBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoalsIndexBlockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalsIndexBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
