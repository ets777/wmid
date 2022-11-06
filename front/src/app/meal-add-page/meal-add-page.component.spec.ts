import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealAddPageComponent } from './meal-add-page.component';

describe('MealAddPageComponent', () => {
  let component: MealAddPageComponent;
  let fixture: ComponentFixture<MealAddPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MealAddPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealAddPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
