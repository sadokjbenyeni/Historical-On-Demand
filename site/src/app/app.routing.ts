import { Routes } from '@angular/router';
import { HomeComponent } from './modules/templates/home/home.component';
import { AboutComponent } from './modules/templates/about/about.component';
import { HelpPageComponent } from './modules/templates/help-page/help-page.component';


export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'help', component: HelpPageComponent },
  { path: '**', component: HomeComponent }
];
