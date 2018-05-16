#!/usr/bin/env python3

import uuid
import time
import signal
import random

from kombu import Connection, Producer, Exchange


def sigint_handler(signal, frame):
    print('Exiting...')
    global loop
    loop = False


signal.signal(signal.SIGINT, sigint_handler)

piid = 'pc.' + str(uuid.uuid1().node)

print("Starting with id: " + piid)

exch = Exchange('raspi.live', type='direct')

loop = True

with Connection('amqp://guest:guest@127.0.0.1') as conn:
    channel = conn.channel()
    b_exch = exch(channel)
    producer = Producer(channel, exchange=b_exch, routing_key=piid)

    while loop:
        producer.publish(
            {
                'x': 4*(random.random()-0.5),
                'y': 4*(random.random()-0.5),
                'z': 4*(random.random()-0.5),
            },
            retry=True,
        )
        time.sleep(0.05)

