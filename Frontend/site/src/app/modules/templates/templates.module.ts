import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { RouterModule } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { HomeComponent } from './home/home.component';



@NgModule({
  declarations: [
    MenuComponent,
    AboutComponent,
    HelpPageComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports:[
    MenuComponent,
    AboutComponent,
    HelpPageComponent,
    HomeComponent
  ]
})
export class TemplatesModule { }
