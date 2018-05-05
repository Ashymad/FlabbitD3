#!/usr/bin/env python3

import uuid
import time
import sys
import signal

from kombu import Connection, Producer, Exchange, Queue
import numpy

def sigint_handler(signal, frame):
    print('Exiting...')
    global loop
    loop = False

signal.signal(signal.SIGINT, sigint_handler)

piid = 'pc.' + str(uuid.uuid1().node)

print("Starting with id: " + piid)

exch = Exchange('raspi.live', type='direct')

loop = True

with Connection('amqp://guest:guest@SKRADAK') as conn:
    channel = conn.channel()
    b_exch = exch(channel)
    producer = Producer(channel, exchange=b_exch, routing_key=piid)

    while loop:
        ranums = 4*(numpy.random.rand(3, 3)-0.5)
        producer.publish(
            {
                'x': ranums[0,:].tolist(),
                'y': ranums[1,:].tolist(),
                'z': ranums[2,:].tolist(),
            },
            retry=True,
        )
        time.sleep(1)

