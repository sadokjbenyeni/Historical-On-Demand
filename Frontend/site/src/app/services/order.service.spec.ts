import { TestBed, inject } from '@angular/core/testing';

import { OrderService } from './order.service';
import { HttpClientModule, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';

let httpClientSpy: { put: jasmine.Spy };
let orderService: OrderService;

describe('OrderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [OrderService]

    });
  });


  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['put']);
    orderService = new OrderService(<any>httpClientSpy);
  });


  it('should be created', inject([OrderService], (service: OrderService) => {
    expect(service).toBeTruthy();
  }));

  it('should return 200 when metadata updated', () => {

    httpClientSpy.put.and.returnValue(of(new HttpResponse().status));

    orderService.SaveOrderMetadata(5, 'Some random note', 'Mr X', "internal").subscribe(res => expect(res).toBe(200));
  });

  it('should return 400 when orderId is Null', () => {

    httpClientSpy.put.and.returnValue(of(new HttpErrorResponse({ status: 400 })));

    orderService.SaveOrderMetadata(NaN, 'Some random note', 'Mr X', "internal").subscribe(res => expect(res.status).toBe(400));
  });

});
