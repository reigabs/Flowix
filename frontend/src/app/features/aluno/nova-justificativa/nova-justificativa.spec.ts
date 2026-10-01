import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaJustificativa } from './nova-justificativa';

describe('NovaJustificativa', () => {
  let component: NovaJustificativa;
  let fixture: ComponentFixture<NovaJustificativa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaJustificativa],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaJustificativa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
