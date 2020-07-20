import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-identity-modal',
  templateUrl: './confirm-identity-modal.component.html',
  styleUrls: ['./confirm-identity-modal.component.css']
})
export class ConfirmIdentityModalComponent implements OnInit {

  password: string;
  constructor(private dialogRef: MatDialogRef<ConfirmIdentityModalComponent>) { }

  ngOnInit(): void {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

}
