#!/usr/bin/env python3

from flask import Flask, jsonify, request, abort
import pika
import uuid

app = Flask(__name__)

rmq_adr = '127.0.0.1'
rmq_credentials = pika.PlainCredentials('pi', 'raspberry')
rmq_exchange = 'raspi.live'
rmq_par = pika.ConnectionParameters(host=rmq_adr,
                                    credentials=rmq_credentials)


@app.route('/api/binding/<int:binding_id>', methods=['PUT'])
def put_binding(binding_id):
    if not request.json:
        abort(400)
    if 'routing_key' not in request.json:
        abort(400)

    connection = pika.BlockingConnection(rmq_par)
    channel = connection.channel()
    channel.exchange_declare(exchange=rmq_exchange,
                             exchange_type='direct',
                             durable=True)
    queue_name = "gen_" + str(uuid.uuid4())
    channel.queue_declare(queue_name,
                          auto_delete=True,
                          arguments={'x-expires': 1000*60*2})
    channel.queue_bind(exchange=rmq_exchange,
                       queue=queue_name,
                       routing_key=request.json['routing_key'])
    connection.close()
    return jsonify({
        'queue_name': queue_name,
    })


@app.route('/api/stomp')
def stomp_parameters():
    return jsonify({
        'login': 'read',
        'passcode': 'only',
        'url': 'ws://' + rmq_adr + ':15674/ws',
    })


if __name__ == '__main__':
    app.run(debug=True)
