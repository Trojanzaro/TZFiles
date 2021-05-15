import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Http, ResponseContentType, Headers } from '@angular/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { fileURLToPath } from 'url';

@Injectable({
  providedIn: 'root'
})
export class HttpServiceService {
  private finaldata = [];
  private apiurl = 'http://10.147.17.182:3000';
  constructor(
    private httpClient: HttpClient,
    private http: Http) { }

  private getHeaders(): any {
    const Auth = (JSON.parse(localStorage.getItem('user')) !== undefined) ? JSON.parse(localStorage.getItem('user')).token : '';
    return { headers: { authorization: `Bearer ${Auth}`} };
  }

  deleteFolder(fld, folder) {
    const httpopt = this.getHeaders();
    httpopt.body = {folder: fld};
    return this.httpClient.delete(this.apiurl + '/folder/' + folder, httpopt);
  }

  postCreateNewFolder(newfolder) {
    return this.httpClient.post(this.apiurl + '/mkdir', { folder: newfolder }, this.getHeaders());
  }

  getData(fld) {
     return this.httpClient.post(this.apiurl + '/folder', { folder: fld }, this.getHeaders());
  }

  async getFile(fld, filename) {
    const file = await this.httpClient.post<Blob>(
      this.apiurl + '/file/' + filename,
      { folder: fld },
      {
        headers: {
          authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
        },
        responseType: 'blob' as 'json'
      }).toPromise();
    return file;
  }

  deleteFile(fld, filename) {
    const httpopt = this.getHeaders();
    httpopt.body = {folder: fld};
    return this.httpClient.delete(this.apiurl + '/file/' + filename, httpopt);
  }

  postFile(folder, fileToUpload: File) {
    const endpoint = this.apiurl + '/file';
    const formData: FormData = new FormData();
    formData.append('avatar', fileToUpload, fileToUpload.name);
    formData.append('folder', folder);
    return this.httpClient
      .post<any>(endpoint, formData, {
        reportProgress: true,
        observe: 'events',
        headers: {
          authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
        }
      }
      ).pipe(map((event) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = Math.round(100 * event.loaded / event.total);
            return { status: 'progress', message: progress, loaded: event.loaded };
          case HttpEventType.Response:
            return event.body;
          default:
            return `Unhandled event: ${event.type}`;
        }
      })
    );
  }
}
