/**
 * Pinpoint Node.js Agent
 * Copyright 2020-present NAVER Corp.
 * Apache License v2.0
 */

'use strict'

const shimmer = require('shimmer')
const ServiceTypeCode = require('../../constant/service-type').ServiceTypeCode
const AsyncIdAccessor = require('../../context/async-id-accessor')

module.exports = function(agent, version, axios) {

  shimmer.wrap(request, 'request', function (original) {
    return function () {

      const trace = agent.traceContext.currentTraceObject()
      let spanEventRecorder = null
      if (trace) {
        spanEventRecorder = trace.traceBlockBegin()
        spanEventRecorder.recordServiceType(ServiceTypeCode.ASYNC_HTTP_CLIENT_INTERNAL)
        spanEventRecorder.recordApiDesc('axios.request')
      }
      const result = original.apply(this, arguments)
      if (trace) {

        let asyncId = spanEventRecorder.recordNextAsyncId()
        AsyncIdAccessor.setAsyncId(result, asyncId)

        trace.traceBlockEnd(spanEventRecorder)
      }


      return result
    }
  })


  return request
}

