import {HttpClient} from "@angular/common/http";
import {TranslateLoader} from "@ngx-translate/core";
import {Observable, forkJoin, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
// @ts-ignore
import merge from 'deepmerge';


export interface ITranslationResource {
  prefix: string;
  suffix: string;
}

export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(
    private handler: HttpBackend,
    private resources: ITranslationResource[],
  ) {}

  public getTranslation(lang: string): Observable<any> {
    const requests = this.resources.map(resource => {
      const path = resource.prefix + lang + resource.suffix;
      return new HttpClient(this._handler).get(path).pipe(catchError(res => {
        console.error("Something went wrong for the following translation file:", path);
        console.error(res.message);
        return of({});
      }));
    });
    return forkJoin(requests).pipe(map(response => merge.all(response)));
  }
}
