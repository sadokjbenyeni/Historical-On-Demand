import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TemplatesModule } from '../templates/templates.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { searchRoutes } from './search.routing';




@NgModule({
  declarations: [
    SearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TemplatesModule,
    NgbModule,
    RouterModule.forRoot(searchRoutes)

  ],
  exports: [
    SearchComponent,
    RouterModule
  ]
})
export class SearchModule { }
