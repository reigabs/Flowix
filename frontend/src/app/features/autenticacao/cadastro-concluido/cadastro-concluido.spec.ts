import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroConcluido } from './cadastro-concluido';

describe('CadastroConcluido', () => {
  let component: CadastroConcluido;
  let fixture: ComponentFixture<CadastroConcluido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroConcluido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroConcluido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});