import { ChangeDetectorRef, Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-account-side-bar',
  templateUrl: './account-side-bar.component.html',
  styleUrls: ['./account-side-bar.component.css']
})
export class AccountSideBarComponent implements OnInit {
  sectionName: string;
  @Output() getSection = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}
  
  getSectionName(event) {
    this.sectionName = event.toElement.textContent;
    this.getSection.emit(this.sectionName);
  }

}
