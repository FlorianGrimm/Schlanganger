(function(PolyNumber:any){
  if (typeof(PolyNumber.isNaN) === "undefined"){
    PolyNumber.isNaN = function Number_isNaN(value:any) {     
      return value !== value;
    };
  }
  if (typeof(PolyNumber.isFinite) === "undefined"){
    if (typeof(isFinite) === "undefined"){
      PolyNumber.isFinite = function Number_isFinite(value:any) {     
        // 1. If Type(number) is not Number, return false.
        if (typeof value !== 'number') {
            return false;
        }
        // 2. If number is NaN, +∞, or −∞, return false.
        if (value !== value || value === Infinity || value === -Infinity) {
            return false;
        }
        // 3. Otherwise, return true.
        return true;
      };
    } else {
      PolyNumber.isFinite = function Number_isFinite(value:any) {     
        return (typeof value === "number") && isFinite(value);
      };  
    }
  }
})(Number);