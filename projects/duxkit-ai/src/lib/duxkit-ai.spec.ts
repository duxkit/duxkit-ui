import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuxkitAi } from './duxkit-ai';

describe('DuxkitAi', () => {
  let component: DuxkitAi;
  let fixture: ComponentFixture<DuxkitAi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuxkitAi],
    }).compileComponents();

    fixture = TestBed.createComponent(DuxkitAi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
