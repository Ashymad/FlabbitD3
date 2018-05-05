#!/usr/bin/env python3

from flask import Flask, jsonify, request
import pika

app = Flask(__name__)

rmq_adr = '127.0.0.1'
rmq_exchange = 'raspi.live'
rmq_par = pika.ConnectionParameters(host=rmq_adr)
connection = pika.BlockingConnection(rmq_par)
channel = connection.channel()
channel.exchange_declare(exchange=rmq_exchange,
                         exchange_type='direct',
                         durable=True)

@app.route('/api/binding/<int:binding_id>', methods=['PUT'])
def put_binding(binding_id):
    if not request.json:
        abort(400)
    if 'routing_key' not in request.json:
        abort(400)

    result = channel.queue_declare(auto_delete=True,
                                   arguments={'x-expires': 1000*60*2})
    queue_name = result.method.queue
    channel.queue_bind(exchange=rmq_exchange,
                       queue=queue_name,
                       routing_key=request.json['routing_key'])
    return jsonify({
        'exchange': rmq_exchange,
        'queue_name': queue_name,
    })

@app.route('/api/stomp')
def stomp_parameters():
    return jsonify({
        'login': 'guest',
        'passcode': 'guest',
        'url': 'ws://' + rmq_adr + ':15674/ws',
    })

if __name__ == '__main__':
    app.run(debug=True)
