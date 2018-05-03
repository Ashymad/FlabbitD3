#!/usr/bin/env python3

import uuid
import time
import random
import sys
import signal

from kombu import Connection, Producer, Exchange, Queue

def sigint_handler(signal, frame):
    print('Exiting...')
    global loop
    loop = False

signal.signal(signal.SIGINT, sigint_handler)

piid = 'pc.' + str(uuid.uuid1().node)

print("Starting with id: " + piid)

exch = Exchange('raspi-live', type='direct')

loop = True

with Connection('amqp://guest:guest@SKRADAK') as conn:
    channel = conn.channel()
    producer = Producer(channel)

    while loop:
        producer.publish(
            {
                'x': random.randrange(-2**15, 2**15-1),
                'y': random.randrange(-2**15, 2**15-1),
                'z': random.randrange(-2**15, 2**15-1),
            },
            retry=True,
            exchange=exch,
            routing_key=piid,
        )
        time.sleep(1)

