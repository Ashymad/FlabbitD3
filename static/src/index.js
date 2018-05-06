import * as d3 from 'd3';
import * as Stomp from '@stomp/stompjs';
import * as request from 'superagent';

import style from './index.css';

var beAPI = `${window.location.protocol}//${window.location.host}/api/`
var client;
var subscription;

request
    .get(`${beAPI}stomp`)
    .then((res) => {
	client = Stomp.client(res.body.url)
	client.debug = null
	client.connect(res.body.login, res.body.passcode,
	    on_connect,
	    (error) => {
		console.log(error)
	    })
    })
    .catch((err) => {
	console.log(err)
    })

function on_connect() {
    request
	.put(`${beAPI}binding/${Math.floor(Math.random()*1000000000)}`)
	.send({'routing_key': 'pc.11373331246'})
	.then((res) => {
	    subscription = client
		.subscribe(`/amq/queue/${res.body.queue_name}`,
		    on_message)
	    document.getElementById("title")
		.textContent = `Reading from: ${res.body.queue_name}`;

	})
	.catch((err) => {
	    console.log(err)
	})
}

function on_message(message) {
    if (message.body) {
	tick(JSON.parse(message.body))
    } else {
	console.log("got empty message");
    }
}


const limit = 60 * 5,
    duration = 50
var now = new Date(Date.now() - duration)

var width = window.innerWidth - 10,
    height = window.innerHeight/2

var groups = {
    x: {
	value: 0,
	color: 'orange',
	data: d3.range(limit).map(function() {
	    return 0
	})
    },
    y: {
	value: 0,
	color: 'green',
	data: d3.range(limit).map(function() {
	    return 0
	})
    },
    z: {
	value: 0,
	color: 'grey',
	data: d3.range(limit).map(function() {
	    return 0
	})
    }
}

var x = d3.scaleTime()
    .domain([now - (limit - 2), now - duration])
    .range([0, width])

var y = d3.scaleLinear()
    .domain([-2, 2])
    .range([0, height])

var line = d3.line()
    .x(function(d, i) {
	return x(now - (limit - 1 - i) * duration)
    })
    .y(function(d) {
	return y(d)
    })

var svg = d3.select('.graph').append('svg')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height)

var axis = svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height/2})`)
    .call(x.axis = d3.axisBottom(x))

var paths = svg.append('g')

for (let name in groups) {
    let group = groups[name]
    group.path = paths.append('path')
	.data([group.data])
	.attr('class', `${name} group`)
	.style('stroke', group.color)
}

function tick(data) {
    now = new Date()

    // Add new values
    for (var name in groups) {
	let group = groups[name]
	group.data.push(data[name]) // Real values arrive at irregular intervals
	group.path.attr('d', line)
    }

    // Shift domain
    x.domain([now - (limit - 2) * duration, now - duration])
    //axis.call(x.axis)

    // Remove oldest data point from each group
    for (let name in groups) {
	var group = groups[name]
	group.data.shift()
    }
}
