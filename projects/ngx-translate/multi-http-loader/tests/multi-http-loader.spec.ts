import {HttpClient} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {TestBed} from "@angular/core/testing";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {MultiTranslateHttpLoader} from "../src/public_api";

describe('MultiTranslateHttpLoader - Single Translation File', () => {
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (httpClient: HttpClient) => new MultiTranslateHttpLoader(httpClient, [
              {prefix: "/assets/i18n/", suffix: ".json"},
            ]),
            deps: [HttpClient]
          }
        })
      ],
      providers: [TranslateService]
    });
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    translate = undefined;
    http = undefined;
  });

  it('should be able to provide MultiTranslateHttpLoader', () => {
    expect(MultiTranslateHttpLoader).toBeDefined();
    expect(translate.currentLoader).toBeDefined();
    expect(translate.currentLoader instanceof MultiTranslateHttpLoader).toBeTruthy();
  });

  it('should be able to get translations', () => {
    translate.use('en');

    // this will request the translation from the backend because we use a static files loader for TranslateService
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is a test');
    });

    // mock response after the xhr request, otherwise it will be undefined
    http.expectOne('/assets/i18n/en.json').flush({
      "TEST": "This is a test",
      "TEST2": "This is another test"
    });

    // this will request the translation from downloaded translations without making a request to the backend
    translate.get('TEST2').subscribe((res: string) => {
      expect(res).toEqual('This is another test');
    });
  });

  it('should be able to reload a lang', () => {
    translate.use('en');

    // this will request the translation from the backend because we use a static files loader for TranslateService
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is a test');

      // reset the lang as if it was never initiated
      translate.reloadLang('en').subscribe((res2: string) => {
        expect(translate.instant('TEST')).toEqual('This is a test 2');
      });

      http.expectOne('/assets/i18n/en.json').flush({"TEST": "This is a test 2"});
    });

    // mock response after the xhr request, otherwise it will be undefined
    http.expectOne('/assets/i18n/en.json').flush({"TEST": "This is a test"});
  });

  it('should be able to reset a lang', (done: Function) => {
    translate.use('en');
    spyOn(http, 'expectOne').and.callThrough();

    // this will request the translation from the backend because we use a static files loader for TranslateService
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is a test');
      expect(http.expectOne).toHaveBeenCalledTimes(1);

      // reset the lang as if it was never initiated
      translate.resetLang('en');

      expect(translate.instant('TEST')).toEqual('TEST');

      // use set timeout because no request is really made and we need to trigger zone to resolve the observable
      setTimeout(() => {
        translate.get('TEST').subscribe((res2: string) => {
          expect(res2).toEqual('TEST'); // because the loader is "pristine" as if it was never called
          expect(http.expectOne).toHaveBeenCalledTimes(1);
          done();
        });
      }, 10);
    });

    // mock response after the xhr request, otherwise it will be undefined
    http.expectOne('/assets/i18n/en.json').flush({"TEST": "This is a test"});
  });
});

describe('MultiTranslateHttpLoader - Multiple Translation Files', () => {
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: (httpClient: HttpClient) => new MultiTranslateHttpLoader(httpClient, [
              {prefix: "/assets/i18n/core/", suffix: ".json"},
              {prefix: "/assets/i18n/shared/", suffix: ".json"},
            ]),
            deps: [HttpClient]
          }
        })
      ],
      providers: [TranslateService]
    });
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    translate = undefined;
    http = undefined;
  });

  it('should be able to get translations from multiple files', () => {
    translate.use('en');

    // this will request the translation from the backend because we use a static files loader for TranslateService
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is a test (core)');
    });
    translate.get('TEST-SHARED').subscribe((res: string) => {
      expect(res).toEqual('This is a test (shared)');
    });

    // mock response after the xhr request, otherwise it will be undefined
    http.expectOne('/assets/i18n/core/en.json').flush({
      "TEST": "This is a test (core)",
      "TEST2": "This is another test (core)",
      "DEEP": {
        "some": "thing"
      }
    });
    http.expectOne('/assets/i18n/shared/en.json').flush({
      "TEST-SHARED": "This is a test (shared)",
      "TEST2-SHARED": "This is another test (shared)",
      "DEEP": {
        "another": "something"
      }
    });

    // this will request the translation from downloaded translations without making a request to the backend
    translate.get('TEST2').subscribe((res: string) => {
      expect(res).toEqual('This is another test (core)');
    });
    translate.get('TEST2-SHARED').subscribe((res: string) => {
      expect(res).toEqual('This is another test (shared)');
    });
    translate.get('DEEP').subscribe((res: any) => {
      expect(res).toEqual({
        "some": "thing",
        "another": "something"
      });
    });
  });
});
