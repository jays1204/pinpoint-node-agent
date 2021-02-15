/**
 * Pinpoint Node.js Agent
 * Copyright 2021-present NAVER Corp.
 * Apache License v2.0
 */


const test = require('tape')
const grpc = require('@grpc/grpc-js')
const services = require('../../lib/data/grpc/Service_grpc_pb')
const { log } = require('../test-helper')
const GrpcDataSender = require('../../lib/client/grpc-data-sender')

// https://github.com/agreatfool/grpc_tools_node_protoc_ts/blob/v5.0.0/examples/src/grpcjs/server.ts
function pingSession(call) {
    call.on('data', (ping) => {
        log.debug(`pingSession in data: ${JSON.stringify(ping.toObject())}`)
        call.write(ping)
    })
    call.on('end', (arg1) => {
        log.debug(`pingSession in end: ${JSON.stringify(arg1)}`)
        call.end()
    })
}

test('gRPC bidirectional stream Ping write ', function (t) {
    const server = new GrpcServer()

    server.addService(services.AgentService, {
        pingSession: pingSession
    })
    server.startup((port) => {
        this.grpcDataSender = new GrpcDataSender('localhost', port, port, port, {
            'agentid': '12121212',
            'applicationname': 'applicationName',
            'starttime': Date.now()
        })
      
        t.equal(this.grpcDataSender.pingStream.constructor.name, 'GrpcBidirectionalStream', `pingStream is the GrpcBidirectionalStream`)

        this.grpcDataSender.pingStream.stream.write = (data) => {

        }

        this.grpcDataSender.sendPing()

        setTimeout((error) => {
            t.false(error, 'server graceful shutdown')
            server.shutdown(() => {
                t.end()
            })
        }, 0)
    })
})

class GrpcServer {
    constructor() {
        this.server = new grpc.Server()
    }

    addService(service, implementation) {
        this.server.addService(service, implementation)
    }

    startup(callback) {    
        this.server.bindAsync('localhost:0', grpc.ServerCredentials.createInsecure(), (err, port) => {
            this.server.start()

            if (err) {
                throw new Error('this.server.bindAsync error')
            }
        
            if (callback) {
                callback(port)
            }
        })
    }
    
    shutdown(callback) {
        this.server.tryShutdown((error) => {
            if (callback) {
                callback(error)
            }
        })
    }
}