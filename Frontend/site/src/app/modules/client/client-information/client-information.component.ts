import { Component, OnInit, Input } from '@angular/core';
import { ClientInformation } from '../models/client-information.model';

@Component({
  selector: 'app-client-information',
  templateUrl: './client-information.component.html',
  styleUrls: ['./client-information.component.css']
})
export class ClientInformationComponent implements OnInit {

  @Input() clientInfo: ClientInformation;

  constructor() { }
  ngOnInit() { }

}
