import { resolvePathname } from './resolve-pathname';
import { valueEqual } from 'recyclejs-helpers';
import { parsePath } from './PathUtils';
import { PathLocation } from './types';

var _extends = Object.assign || function (target: any) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; }
    }
  }
  return target;
};


export function createLocation(path: string | PathLocation, state?: any, key?: any, currentLocation?: PathLocation) {
  var location: PathLocation;
  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = parsePath(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = _extends({}, path);

    if (location.pathname === undefined) location.pathname = '';

    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
    } else {
      location.search = '';
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
    }
  }

  return location;
};

export function locationsAreEqual(a: PathLocation, b: PathLocation) {
  return a.pathname === b.pathname
    && a.search === b.search
    && a.hash === b.hash
    && a.key === b.key
    && valueEqual(a.state, b.state);
};