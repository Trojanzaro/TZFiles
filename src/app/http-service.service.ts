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
  private apiurl = 'http://192.168.1.103:3000/folder';
  constructor(
    private httpClient: HttpClient,
    private http: Http) { }

  postNewFolder(subFolder) {
    return this.httpClient.post(this.apiurl, { folder: subFolder } );
  }

  getData() {
     return this.httpClient.get(this.apiurl);
  }

  getFile(filename): Observable<any> {
    return this.http.get('http://192.168.1.103:3000/file/' + filename, { responseType: ResponseContentType.Blob});
  }

  deleteFile(filename): Observable<any> {
    return this.http.delete('http://192.168.1.103:3000/file/' + filename);
  }

  postFile(fileToUpload: File) {
    const endpoint = 'http://192.168.1.103:3000/file';
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
