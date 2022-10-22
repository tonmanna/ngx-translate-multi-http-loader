import { HttpBackend, HttpClient } from '@angular/common/http'
import { TranslateLoader } from '@ngx-translate/core'
import * as merge from 'deepmerge'
import { forkJoin, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(private _handler: HttpBackend, private _resourcesPrefix: string[]) {}

  public getTranslation(lang: string): Observable<any> {
    const requests = this._resourcesPrefix.map((prefix) => {
      const path = `${prefix}${lang}.json`

      return new HttpClient(this._handler).get(path).pipe(
        catchError((res) => {
          console.error('Something went wrong for the following translation file:', path)
          console.error(res.message)
          return of({})
        }),
      )
    })

    return forkJoin(requests).pipe(map((response) => merge.all(response)))
  }
}
