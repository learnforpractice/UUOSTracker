import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() onMenuToggle = new EventEmitter();

  logoUrl = environment.logoUrl;
  logoUrl_1 = environment.logoUrl1;
  appName = environment.appName;
  searchExpanded = false;

  constructor() { }

  ngOnInit() {
  }

}
