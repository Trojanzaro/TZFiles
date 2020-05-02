import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Http, ResponseContentType, Headers } from '@angular/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpServiceService {
  private finaldata = [];
  private apiurl = 'http://192.168.1.103:3000';
  constructor(
    private httpClient: HttpClient,
    private http: Http) { }

  private getHeaders() {
    const Auth = (JSON.parse(localStorage.getItem('user')) !== undefined) ? JSON.parse(localStorage.getItem('user')).token : '';
    return { headers: { authorization: `Bearer ${Auth}`} };
  }

  deleteFolder(folder) {
    return this.httpClient.delete(this.apiurl + '/folder/' + folder, this.getHeaders());
  }

  postCreateNewFolder(newfolder) {
    return this.httpClient.post(this.apiurl + '/mkdir', { folder: newfolder }, this.getHeaders());
  }
  postNewFolder(subFolder) {
    return this.httpClient.post(this.apiurl + '/folder', { folder: subFolder }, this.getHeaders() );
  }

  getData() {
     return this.httpClient.get(this.apiurl + '/folder', this.getHeaders());
  }

  getFile(filename): Observable<any> {
    return this.http.get(this.apiurl + '/file/' + filename, {
      headers: new Headers({ authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`}),
      responseType: ResponseContentType.Blob});
  }

  deleteFile(filename) {
    return this.httpClient.delete(this.apiurl + '/file/' + filename, this.getHeaders());
  }

  postFile(fileToUpload: File) {
    const endpoint = this.apiurl + '/file';
    const formData: FormData = new FormData();
    formData.append('avatar', fileToUpload, fileToUpload.name);
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
