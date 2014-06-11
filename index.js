
var slice = require('sliced')

module.exports = function first(stuff, done) {
  if (!Array.isArray(stuff))
    throw new TypeError('arg must be an array of [ee, events...] arrays')

  var cleanups = []

  stuff.forEach(function (arr) {
    if (!Array.isArray(arr) || arr.length < 2)
      throw new TypeError('each array member must be [ee, events...]')

    var ee = arr.shift()

    arr.forEach(function (event) {
      // listen to the event
      ee.on(event, fn)
      // push this listener to the list of cleanups
      cleanups.push({
        ee: ee,
        event: event,
        fn: fn,
      })

      function fn(err) {
        cleanup()
        if (event === 'error') return done(err, ee, 'error')
        done(null, ee, event, arguments.length > 1
          ? slice(arguments)
          : err)
      }
    })
  })

  return function (fn) {
    done = fn
  }

  function cleanup() {
    while (cleanups.length) {
      var x = cleanups.shift()
      x.ee.removeListener(x.event, x.fn)
    }
  }
}
