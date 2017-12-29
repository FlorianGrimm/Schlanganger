(function (PolyString: any) {
  if ((!PolyString.prototype.endsWith) || ((function () { try { return !("ab".endsWith("a", 1)); } catch (e) { return true; } })())) {
    PolyString.prototype.endsWith = function (searchString: string, position?: number) {
      let subjectString = this.toString();
      let pos: number;
      if ((typeof (position) === 'undefined')
        || (typeof (position) !== 'number')
        || !isFinite(position)
        || (Math.floor(position) !== position)
        || (position > subjectString.length)) {
        pos = subjectString.length - searchString.length;
      } else {
        pos = position - searchString.length;
      }
      //pos -= searchString.length;
      let lastIndex = subjectString.indexOf(searchString, pos);
      return (lastIndex !== -1) && (lastIndex === pos);
    };
  }

  if ((typeof(PolyString.prototype.startsWith) === "undefined")
    || (!PolyString.prototype.startsWith)
    || ((function () { try { return !("ab".startsWith("b", 1)); } catch (e) { return true; } })())) {
    PolyString.prototype.startsWith = function String_startsWith(searchString: string, position?: number) {
      return this.substr(position || 0, searchString.length) === searchString;
    };
  }
})(String);