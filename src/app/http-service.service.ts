import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Http, ResponseContentType } from '@angular/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpServiceService {
  private finaldata = [];
  private apiurl = 'http://localhost:3000';
  constructor(
    private httpClient: HttpClient,
    private http: Http) { }

  deleteFolder(folder) {
    return this.httpClient.delete(this.apiurl + '/folder/' + folder, );
  }

  postCreateNewFolder(newfolder) {
    return this.httpClient.post(this.apiurl + '/mkdir', { folder: newfolder } );
  }
  postNewFolder(subFolder) {
    return this.httpClient.post(this.apiurl + '/folder', { folder: subFolder } );
  }

  getData() {
     return this.httpClient.get(this.apiurl + '/folder');
  }

  getFile(filename): Observable<any> {
    return this.http.get(this.apiurl + '/file/' + filename, { responseType: ResponseContentType.Blob});
  }

  deleteFile(filename): Observable<any> {
    return this.http.delete(this.apiurl + '/file/' + filename);
  }

  postFile(fileToUpload: File) {
    const endpoint = this.apiurl + '/file';
    const formData: FormData = new FormData();
    formData.append('avatar', fileToUpload, fileToUpload.name);
    return this.httpClient
      .post<any>(endpoint, formData, {
        reportProgress: true,
        observe: 'events'}
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
