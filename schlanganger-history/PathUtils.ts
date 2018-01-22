import { PathLocation } from './types';

export function addLeadingSlash(path: string) {
  return path.charAt(0) === '/' ? path : '/' + path;
};

export function stripLeadingSlash(path: string) {
  return path.charAt(0) === '/' ? path.substr(1) : path;
};

export function stripPrefix(path: string, prefix: string) {
  return path.indexOf(prefix) === 0 ? path.substr(prefix.length) : path;
};

export function stripTrailingSlash(path: string) {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
};

export function parsePath(path: string): PathLocation {
  var pathname = path || '/';
  var search = '';
  var hash = '';

  var hashIndex = pathname.indexOf('#');
  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');
  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  pathname = decodeURI(pathname);

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
};

export function createPath(location: PathLocation): string {
  var pathname = location.pathname,
    search = location.search,
    hash = location.hash;


  var path = encodeURI(pathname || '/');

  if (search && search !== '?') path += search.charAt(0) === '?' ? search : '?' + search;

  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : '#' + hash;

  return path;
};