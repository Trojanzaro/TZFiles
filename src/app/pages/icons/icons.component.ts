import { Component, OnInit } from "@angular/core";
import { HttpServiceService } from '../../http-service.service';
import { UserService } from 'src/app/user.service';
import { Router } from '@angular/router';

@Component({
  selector: "app-icons",
  templateUrl: "icons.component.html"
})
export class IconsComponent implements OnInit {

  public disk;

  constructor(
    private folderService: HttpServiceService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.getFolderData();
    }
  }

  getSizeString(byteNumber: number) {
    const nu = byteNumber / 1024;
    if (nu <= 1) {
      return byteNumber.toString()  + ' B';
    } else if (nu > 1 && nu <= 1024) {
      return nu.toFixed(2)  + ' KB';
    } else if (nu > 1024 && nu <= 921600) {
      return (nu / 1024).toFixed(2) + ' MB';
    } else if (nu > 921600) { return ((nu / 1000000)).toFixed(2) + ' GB'; }
  }

  getFolderData() {
    this.folderService.getData('\\').subscribe((data: any) => {
      this.disk = data.disk;
    });
  }

  getFreeDiskPrec() {
    return 'width:' + ((this.disk.free * 100) / this.disk.size).toFixed(0) + '%';
  }

  getUsedDiskPrec() {
    return 'width:' + (((this.disk.size - this.disk.free) * 100) / this.disk.size).toFixed(0) + '%';
  }
}
