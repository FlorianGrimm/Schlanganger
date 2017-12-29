declare var global: any;

declare interface InnerError extends Error {
  name: string;
  message: string;
  stack?: string;
  innerError?: Error;
}

declare interface ObjectConstructor {
  getPropertyDescriptor(o: any, p: string): PropertyDescriptor;
}

//declare const Object: ObjectConstructor;
declare namespace Reflect {
  function getOwnMetadata(metadataKey: string, target: Function, targetKey?: string): Object | undefined;
  function defineMetadata(metadataKey: string, metadataValue: Object, target: Function, targetKey?: string): void;
}

(function (globalScope: any) {


  const bind = Function.prototype.bind;

  if (typeof globalScope.Reflect === 'undefined') {
    globalScope.Reflect = {};
  }
  const Reflect = globalScope.Reflect;

  if (typeof Reflect.defineProperty !== 'function') {
    Reflect.defineProperty = function (target: any | null, propertyKey: string, descriptor: PropertyDescriptor & ThisType<any>) {
      if (typeof target === 'object' ? target === null : typeof target !== 'function') {
        throw new TypeError('Reflect.defineProperty called on non-object');
      }
      try {
        Object.defineProperty(target, propertyKey, descriptor);
        return true;
      } catch (e) {
        return false;
      }
    };
  }

  if (typeof Reflect.construct !== 'function') {
    Reflect.construct = function (Target: any, args?: any[]) {
      if (args) {
        switch (args.length) {
          case 0: return new Target();
          case 1: return new Target(args[0]);
          case 2: return new Target(args[0], args[1]);
          case 3: return new Target(args[0], args[1], args[2]);
          case 4: return new Target(args[0], args[1], args[2], args[3]);
        }
      }

      var a = [null];
      a.push.apply(a, args);
      return new (bind.apply(Target, a));
    };
  }

  if (typeof Reflect.ownKeys !== 'function') {
    Reflect.ownKeys = function (o: any) { return (Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o) as any)); }
  }

  const emptyMetadata = Object.freeze({});
  const metadataContainerKey = '__metadata__';

  if (typeof Reflect.getOwnMetadata !== 'function') {
    Reflect.getOwnMetadata = function (metadataKey: any, target: any, targetKey: any) {
      if (target.hasOwnProperty(metadataContainerKey)) {
        return (target[metadataContainerKey][targetKey] || emptyMetadata)[metadataKey];
      }
    };
  }

  if (typeof Reflect.defineMetadata !== 'function') {
    Reflect.defineMetadata = function (metadataKey: any, metadataValue: any, target: any, targetKey: any) {
      let metadataContainer = target.hasOwnProperty(metadataContainerKey) ? target[metadataContainerKey] : (target[metadataContainerKey] = {});
      let targetContainer = metadataContainer[targetKey] || (metadataContainer[targetKey] = {});
      targetContainer[metadataKey] = metadataValue;
    };
  }

  if (typeof Reflect.metadata !== 'function') {
    Reflect.metadata = function (metadataKey: any, metadataValue: any) {
      return function (target: any, targetKey: any) {
        Reflect.defineMetadata(metadataKey, metadataValue, target, targetKey);
      };
    };
  }

})(window);