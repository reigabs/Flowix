import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilFilhos } from './perfil-filhos';

describe('PerfilFilhos', () => {
  let component: PerfilFilhos;
  let fixture: ComponentFixture<PerfilFilhos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilFilhos],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilFilhos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
