# @ngx-translate/multi-http-loader [![Build Status](https://travis-ci.org/denniske/ngx-translate-multi-http-loader.svg?branch=master)](https://travis-ci.org/denniske/ngx-translate-multi-http-loader) [![npm version](https://badge.fury.io/js/%40denniske%2Fngx-translate-multi-http-loader.svg)](https://badge.fury.io/js/%40denniske%2Fngx-translate-multi-http-loader)

A loader for [ngx-translate](https://github.com/ngx-translate/core) that loads translations using http.

Simple example using ngx-translate: https://stackblitz.com/github/ngx-translate/example

Get the complete changelog here: https://github.com/ngx-translate/multi-http-loader/releases

* [Installation](#installation)
* [Usage](#usage)

## Installation

We assume that you already installed [ngx-translate](https://github.com/ngx-translate/core).

Now you need to install the npm module for `MultiTranslateHttpLoader`:

```sh
npm install @ngx-translate/multi-http-loader --save
```

Choose the version corresponding to your Angular version:

 Angular     | @ngx-translate/core | @ngx-translate/multi-http-loader
 ----------- | ------------------- | --------------------------
 6           | 10.x+               | 3.x+
 5           | 8.x to 9.x          | 1.x to 2.x
 4.3         | 7.x or less         | 1.x to 2.x
 2 to 4.2.x  | 7.x or less         | 0.x

## Usage
#### 1. Setup the `TranslateModule` to use the `MultiTranslateHttpLoader`:

The `MultiTranslateHttpLoader` uses HttpClient to load translations, which means that you have to import the HttpClientModule from `@angular/common/http` before the `TranslateModule`:

```ts
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/multi-http-loader';
import {AppComponent} from "./app";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

The `MultiTranslateHttpLoader` also has two optional parameters:
- prefix: string = "/assets/i18n/"
- suffix: string = ".json"

By using those default parameters, it will load your translations files for the lang "en" from: `/assets/i18n/en.json`.

You can change those in the `HttpLoaderFactory` method that we just defined. For example if you want to load the "en" translations from `/public/lang-files/en-lang.json` you would use:

```ts
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "/public/lang-files/", "-lang.json");
}
```

For now this loader only support the json format.
