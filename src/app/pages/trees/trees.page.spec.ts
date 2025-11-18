import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreesPage } from './trees.page';

describe('TreesPage', () => {
  let component: TreesPage;
  let fixture: ComponentFixture<TreesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TreesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
