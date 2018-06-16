import {HttpClient} from "@angular/common/http";
import {TranslateLoader} from "@ngx-translate/core";
import {Observable, forkJoin} from "rxjs";
import {map} from "rxjs/operators";


interface ITranslationResource {
  prefix: string;
  suffix: string;
}

export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private resources: ITranslationResource[],
  ) {}

  public getTranslation(lang: string): Observable<any> {
    const requests = this.resources.map(resource => {
      return this.http.get(resource.prefix + lang + resource.suffix);
    });
    return forkJoin(requests).pipe(map(response => response.reduce((a, b) => Object.assign(a, b))));
  }
}
