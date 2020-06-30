import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';

export interface DialogData {
  idCmd: string;
  status: string;
  referer: string;
  orderId: string;
}
@Component({
  selector: 'app-cancel-order-dialog',
  templateUrl: './cancel-order-dialog.component.html',
  styleUrls: ['./cancel-order-dialog.component.css']
})
export class CancelOrderDialogComponent implements OnInit {

  commandId: any;

  constructor(
    public dialogReference: MatDialogRef<CancelOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private router: Router,
    private orderService: OrderService) { }

    
  ngOnInit(): void {
    this.commandId = this.data.orderId;
  }

  onNoClick(): void {
    this.dialogReference.close();
  }
  confirm() {
    this.orderService.state({ idCmd: this.data.idCmd, status: this.data.status, referer: this.data.referer }).subscribe(() => { });
    this.router.navigateByUrl('/order/history');
  }

}




