const Agent = require('../../../src/agent')
const agent = new Agent()

const test = require('tap').test
const axios = require('axios')

function startServer() {
  const express = require('express')
  return new express()
}

test('Should create a context', function (t) {
  t.plan(1)

  const app = startServer()
  app.get('/test', function (req, res) {
    res.send('hello')
  })

  const server = app.listen(5005, async function () {
    await axios.get('http://localhost:5005/test')

    t.equal(agent.contextManger.getContextCount(), 1)

    server.close()
  })
})
