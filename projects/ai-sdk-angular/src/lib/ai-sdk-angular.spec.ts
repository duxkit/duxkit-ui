import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSdkAngular } from './ai-sdk-angular';

describe('AiSdkAngular', () => {
  let component: AiSdkAngular;
  let fixture: ComponentFixture<AiSdkAngular>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSdkAngular],
    }).compileComponents();

    fixture = TestBed.createComponent(AiSdkAngular);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
