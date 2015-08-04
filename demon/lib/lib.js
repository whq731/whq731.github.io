/**
 *
 * @param function that need limit
 * @param limit run times
 * @returns new {Function}
 *
 * useage :
 * newFunc = limit(func, 2);
 * newFunc();// run
 * newFunc();// run
 * newFunc();// undefined
 *
 * author : way
 */
limit = function(func, times) {
    var times = times,newFunc;
    return function() {
      if (times === 0) return newFunc;
      times--;
      newFunc = func.apply(this, arguments)
      return newFunc;
    };
  };