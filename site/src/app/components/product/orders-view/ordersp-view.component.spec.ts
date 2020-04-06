import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderspViewComponent } from './ordersp-view.component';
import { HttpClientModule, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { OrderService } from '../../../services/order.service';
import { ConfigService } from '../../../services/config.service';
import { CurrencyService } from '../../../services/currency.service';

describe('OrderspViewComponent', () => {
  let component: OrderspViewComponent;
  let fixture: ComponentFixture<OrderspViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      declarations: [OrderspViewComponent],
      providers: [OrderService, ConfigService, CurrencyService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderspViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#updateChanges() should update #internalNote and #choosenSale', () => {
    expect(component.internalNote).toBe(undefined, 'empty at first');
    expect(component.choosenSale).toBe(undefined, 'default value at first');
    component.internalNote = 'my first note';
    component.choosenSale = 'Mr X';
    component.updateChanges();
    expect(component.internalNote).toBe('my first note', 'update first time');
    expect(component.choosenSale).toBe('Mr X', 'update first time');
    component.internalNote = 'my second note';
    component.choosenSale = 'Mr Y';
    component.updateChanges();
    expect(component.internalNote).toBe('my second note', 'update second time');
    expect(component.choosenSale).toBe('Mr Y', 'update second time');
  });

});

describe('Orders Product Component (with beforeEach)', () => {
  let component: OrderspViewComponent;
  let fixture: ComponentFixture<OrderspViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      declarations: [OrderspViewComponent],
      providers: [OrderService, ConfigService, CurrencyService]
    });
    fixture = TestBed.createComponent(OrderspViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should call #updateChanges when clicked on save button', async(() => {
    spyOn(component, 'updateChanges');
    const saveButton: HTMLElement = document.getElementById('save-changes-button');
    saveButton.click();
    fixture.whenStable().then(() => {
      expect(component.updateChanges).toHaveBeenCalled();
    });
  }));
});



