import { Component, Input } from '@angular/core';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{title}}</h4>
      <button *ngIf="link === ''" type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
      <button *ngIf="link !== ''" type="button" class="close" aria-label="Close" [routerLink]="[link]" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body scroll">
      <p *ngFor="let m of message">{{m}}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')" *ngIf="link === ''">Close</button>
      <button type="button" class="btn btn-outline-dark" [routerLink]="[link]" (click)="activeModal.close('Close click')" *ngIf="link !== ''">Close</button>
    </div>
  `,
  styleUrls: ['./modal-content.css']
})
export class NgbdModalContent {
  @Input() link;
  @Input() title;
  @Input() message;

  constructor(public activeModal: NgbActiveModal) { }
}


