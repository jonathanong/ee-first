/* eslint-env mocha */

var EventEmitter = require('events').EventEmitter
var assert = require('assert')

var first = require('..')

describe('first', function () {
  var ee1 = new EventEmitter()
  var ee2 = new EventEmitter()
  var ee3 = new EventEmitter()

  it('should require array argument', function () {
    assert.throws(first.bind())
    assert.throws(first.bind(null, 'string'))
    assert.throws(first.bind(null, 42))
    assert.throws(first.bind(null, {}))
  })

  it('should require array of arrays argument', function () {
    assert.throws(first.bind(null, [0]))
    assert.throws(first.bind(null, ['string']))
    assert.throws(first.bind(null, [[ee1], 'string']))
  })

  it('should emit the first event', function (done) {
    first([
      [ee1, 'a', 'b', 'c'],
      [ee2, 'a', 'b', 'c'],
      [ee3, 'a', 'b', 'c']
    ], function (err, ee, event, args) {
      assert.ifError(err)
      assert.equal(ee, ee2)
      assert.equal(event, 'b')
      assert.deepEqual(args, [1, 2, 3])
      done()
    })

    ee2.emit('b', 1, 2, 3)
  })

  it('it should return an error if event === error', function (done) {
    first([
      [ee1, 'error', 'b', 'c'],
      [ee2, 'error', 'b', 'c'],
      [ee3, 'error', 'b', 'c']
    ], function (err, ee, event, args) {
      assert.equal(err.message, 'boom')
      assert.equal(ee, ee3)
      assert.equal(event, 'error')
      done()
    })

    ee3.emit('error', new Error('boom'))
  })

  it('should cleanup after itself', function (done) {
    first([
      [ee1, 'a', 'b', 'c'],
      [ee2, 'a', 'b', 'c'],
      [ee3, 'a', 'b', 'c']
    ], function (err, ee, event, args) {
      assert.ifError(err)
      ;[ee1, ee2, ee3].forEach(function (ee) {
        ['a', 'b', 'c'].forEach(function (event) {
          assert(!ee.listeners(event).length)
        })
      })
      done()
    })

    ee1.emit('a')
  })

  it('should return a thunk', function (done) {
    var thunk = first([
      [ee1, 'a', 'b', 'c'],
      [ee2, 'a', 'b', 'c'],
      [ee3, 'a', 'b', 'c']
    ])
    thunk(function (err, ee, event, args) {
      assert.ifError(err)
      assert.equal(ee, ee2)
      assert.equal(event, 'b')
      assert.deepEqual(args, [1, 2, 3])
      done()
    })

    ee2.emit('b', 1, 2, 3)
  })

  it('should not emit after thunk.cancel()', function (done) {
    var thunk = first([
      [ee1, 'a', 'b', 'c'],
      [ee2, 'a', 'b', 'c'],
      [ee3, 'a', 'b', 'c']
    ])
    thunk(function () {
      assert.ok(false)
    })

    thunk.cancel()

    ee2.emit('b', 1, 2, 3)

    setTimeout(done, 10)
  })

  it('should cleanup after thunk.cancel()', function (done) {
    var thunk = first([
      [ee1, 'a', 'b', 'c'],
      [ee2, 'a', 'b', 'c'],
      [ee3, 'a', 'b', 'c']
    ])

    thunk.cancel()

    ;[ee1, ee2, ee3].forEach(function (ee) {
      ['a', 'b', 'c'].forEach(function (event) {
        assert(!ee.listeners(event).length)
      })
    })
    done()
  })
})
