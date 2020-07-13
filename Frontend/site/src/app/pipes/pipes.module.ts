import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CeilPipe } from './ceil.pipe';
import { PurchaseTypePipe } from './purchaseType.pipe';
import { SafeHtmlPipePipe } from './safe-html-pipe.pipe';
import { CallbackPipe } from './callback.pipe';



@NgModule({
  declarations: [
    CeilPipe,
    PurchaseTypePipe,
    SafeHtmlPipePipe,
    CallbackPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CeilPipe,
    PurchaseTypePipe,
    SafeHtmlPipePipe,
    CallbackPipe
  ]
})
export class PipesModule { }
