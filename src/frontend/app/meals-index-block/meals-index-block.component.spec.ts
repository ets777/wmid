import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealsIndexBlockComponent } from './meals-index-block.component';

describe('MealsIndexBlockComponent', () => {
  let component: MealsIndexBlockComponent;
  let fixture: ComponentFixture<MealsIndexBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MealsIndexBlockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealsIndexBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
