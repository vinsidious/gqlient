/**
 * Adapted from 'real-isomorphic-fetch'
 *
 * https://github.com/JonnyBurger/real-isomorphic-fetch
 */

import * as _ from 'lodash';
import * as Bluebird from 'bluebird';

declare function require(path: string): any

const ToughCookie = require('tough-cookie-no-native');

class IsomorphicFetch {
  public getCookieString: any;
  public setCookie: any;

  constructor(public fetch = window.fetch, public jar = new ToughCookie.CookieJar()) {
    this.fetch = fetch;
    this.jar = jar;

    this.getCookieString = Bluebird.promisify(jar.getCookieString, { context: jar });
    this.setCookie = Bluebird.promisify(jar.setCookie, { context: jar });

    return this.makeRequest.bind(this);
  }

  makeRequest(url: string, options: any) {
    options.credentials = 'include';
    options.redirect = 'manual';

    return new Promise((resolve, reject) => {
      this.getCookieString(url)
        .then((cookie: any) => {
          if (!options.headers) options.headers = {};
          if (typeof window === 'undefined') options.headers.Cookie = cookie;
          options.headers = this.normalizeHeaders(options.headers);
          return this.fetch(url, options);
        })
        .then((response: any) => {
          const cookies = response.headers.getAll('Set-Cookie');
          if (!cookies.length) {
            return [response];
          }
          const saveAllCookies = cookies.map((cookie: any) =>
            this.setCookie(cookie, url),
          );
          return Promise.all([response, Promise.all(saveAllCookies)]);
        })
        .then((afterSaved: any) => {
          const [response] = afterSaved;
          const redirect = response.headers.get('Location');
          const optionsToCarry = this.getOptionsToCarry(options);
          if (redirect) {
            return this.makeRequest(redirect, optionsToCarry);
          }
          return response;
        })
        .then(resolve)
        .catch(reject);
    });
  }

  normalizeHeaders(headers: any) {
    _.forEach(_.keys(headers), key => {
      const lowercasedKey = key.toLowerCase();
      if (!headers[lowercasedKey]) {
        headers[lowercasedKey] = headers[key];
        delete headers[key];
      }
    });
    return headers;
  }

  getOptionsToCarry(options: any) {
    const headers: any = {};
    if (options.headers['user-agent']) {
      headers['user-agent'] = options.headers['user-agent'];
    }
    return {
      headers,
    };
  }
}

(global as any).fetch = new IsomorphicFetch(require('node-fetch'));
