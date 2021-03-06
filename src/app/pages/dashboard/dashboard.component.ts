import { Component, OnInit} from '@angular/core';
import { HttpServiceService } from '../../http-service.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  public fileToDelete ;
  public files = [];
  public disk;
  public clicked = true;
  public clicked1 = false;
  public fileToUpload: File = null;
  public fileUpload = { status: '', message: '', filePath: '' };
  public error;
  public loading: boolean;
  public uploadButton: boolean;
  public sb = {type: '', orderAsc: true};
  public iconSize = 10;
  public subFolders = [];
  public humanizeSpeed: string;
  public newFolderName: string;
  public folder = '\\';

  constructor(
    private folderService: HttpServiceService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private userService: UserService,
    private router: Router
    ) {}

  ngOnInit() {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.getFolderData();
      this.changeIconSize(30);
    }
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadFileToActivity() {
    if (this.fileToUpload === null) {
      this.error = 'No file selected!';
      this.uploadButton = false;
    } else {
      const time: number = new Date().getTime();
      let speed = 0;
      this.uploadButton = true;
      this.folderService.postFile(this.folder, this.fileToUpload).subscribe(
        res => {
          this.fileUpload = res;
          const diff = new Date().getTime() - time;
          speed = Math.round(res.loaded / diff * 1000);
          this.humanizeSpeed = this.humanizeBytes(speed) + '/s';
          if (res.status === true) {
            this.uploadButton = false;
            this.toastr.show('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> File: ' + this.fileToUpload.name + ' Has been uploaded succesfully', 'File Upload' , {
              disableTimeOut: true,
              closeButton: true,
              enableHtml: true,
              toastClass: 'alert alert-success alert-with-icon',
              positionClass: 'toast-' + 'top' + '-' +  'right'
            });
            this.getFolderData();
          }
        },
        err => {
          this.uploadButton = false;
          this.error = err;
      });
    }
  }

  newFolder() {
    this.folderService.postCreateNewFolder(this.folder + '\\' + this.newFolderName).subscribe(res => {
      this.error = res;
      this.getFolderData();
    },
    err => this.error = err.error);
  }

  getFolderData() {
    this.loading = true;
    this.folderService.getData(this.folder).subscribe((data: any) => {
      this.files = data.files;
      this.disk = data.disk;
      this.loading = false;
    });
  }

  getSubFolder(folder) {
    this.folder += '\\' + folder;
    this.subFolders.push(folder);
    this.getFolderData();
  }

  goBackFolder() {
    this.folder = this.folder.substring(0, this.folder.lastIndexOf('\\'));
    this.subFolders.pop();
    this.getFolderData();
  }

  getFreeDiskPrec() {
    return 'width:' + ((this.disk.free * 100) / this.disk.size).toFixed(0) + '%';
  }

  getUsedDiskPrec() {
    return 'width:' + (((this.disk.size - this.disk.free) * 100) / this.disk.size).toFixed(0) + '%';
  }

  open(content, extraData) {
    this.fileToDelete = extraData;
    this.modalService.open(content).result.then((result) => {
      this.getFolderData();
    }, (reason) => {
      this.fileToDelete = null;
    });
  }

  getFileUploadProgr() {
    return 'width:' + this.fileUpload.message + '%';
  }

  async getFile(file) {
    const blob = await this.folderService.getFile(this.folder, file);
    const binaryData = [];
    binaryData.push(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: blob.type}));
    downloadLink.setAttribute('download', file);
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

  deleteFile() {
    if (this.fileToDelete.isDir) {
      this.folderService.deleteFolder(this.folder, this.fileToDelete.filename).subscribe(res => {
        this.toastr.show('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> Folder Has been delete succesfully', 'Folder Deletion' , {
          disableTimeOut: false,
          closeButton: true,
          enableHtml: true,
          toastClass: 'alert alert-success alert-with-icon',
          positionClass: 'toast-' + 'top' + '-' +  'right'
        });
        this.getFolderData();
      }, err => {
        this.toastr.show('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span>'
        + err.error.errorMessage , 'Folder Deletion' , {
          disableTimeOut: false,
          closeButton: true,
          enableHtml: true,
          toastClass: 'alert alert-danger alert-with-icon',
          positionClass: 'toast-' + 'top' + '-' +  'right'
        });
      });
    } else {
      this.folderService.deleteFile(this.folder,this.fileToDelete.filename).subscribe(
        (data) => {
          this.toastr.show('<span class="tim-icons icon-bell-55" [data-notify]="icon"></span> File Has been deleted succesfully', 'File Deleted' , {
            disableTimeOut: false,
            closeButton: true,
            enableHtml: true,
            toastClass: 'alert alert-success alert-with-icon',
            positionClass: 'toast-' + 'top' + '-' +  'right'
          });
          this.getFolderData();
        },
        (error) => console.log(error));
      this.getFolderData();
    }
  }

  shortBy(type: string) {
    switch (type) {
      case 'name':
        (this.sb.type === 'name') ? this.sb.orderAsc = !this.sb.orderAsc : this.sb.type = type;
        this.files.sort((a, b) => (a.filename > b.filename) ? 1 : -1);
        if (this.sb.orderAsc) { this.files.reverse(); }
        break;
      case 'size':
        (this.sb.type === 'size') ? this.sb.orderAsc = !this.sb.orderAsc : this.sb.type = type;
        this.files.sort((a, b) => (a.size > b.size) ? 1 : -1);
        if (this.sb.orderAsc) { this.files.reverse(); }
        break;
      case 'date':
        (this.sb.type === 'date') ? this.sb.orderAsc = !this.sb.orderAsc : this.sb.type = type;
        this.files.sort((a, b) => (a.lastDate > b.lastDate) ? 1 : -1);
        if (this.sb.orderAsc) { this.files.reverse(); }
        break;
      default:
        this.files.sort();
        break;
    }
  }

  getFiletypeIcon(fileName: string) {
   const ext = fileName.split('.')[fileName.split('.').length - 1].toLowerCase();
   switch (ext){
     case 'txt':
       return 'fa fa-file-text-o';
       break;
      case 'mp4':
      case 'mkv':
      case 'mov':
        return 'fa fa-file-video-o';
        break;
      case 'pdf':
        return 'fa fa-file-pdf-o';
        break;
      case 'png':
      case 'jpg':
      case 'bmp':
        return 'fa fa-file-photo-o';
        break;
      case 'rar':
      case 'zip':
      case '7z':
        return 'fa fa-file-archive-o';
        break;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'fa fa-file-video-o';
        break;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return 'fa fa-file-excel-o';
        break;
      case 'doc':
      case 'docx':
        return 'fa fa-file-word-o';
        break;
      case 'ogg':
        return 'fa fa-file-video-o';
        break;
      default:
        return 'fa fa-file-o';
        break;
   }
  }

  changeIconSize(value) {
    this.iconSize = value;
  }
  getIconSize() {
    return 'max-height: ' +
    this.iconSize + '%; max-width: ' +
    this.iconSize + '%; height: ' + this.iconSize + '%; width: ' + this.iconSize + '%;';
  }

  humanizeBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 Byte';
    }
    const k = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i: number = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get onlyTheFolders() {
    return this.files.filter(v => v.isDir);
  }

  get onlyTheFiles() {
    return this.files.filter(v => !v.isDir);
  }
}
