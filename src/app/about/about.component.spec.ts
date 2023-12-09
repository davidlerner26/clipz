import { ComponentFixture, TestBed } from "@angular/core/testing"
import { AboutComponent } from "./about.component";

describe('About Component', () => {
  let fixture: ComponentFixture<AboutComponent>;
  let component: AboutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AboutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
})