import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePublica } from './home-publica';

describe('HomePublica', () => {
  let component: HomePublica;
  let fixture: ComponentFixture<HomePublica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePublica],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePublica);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
