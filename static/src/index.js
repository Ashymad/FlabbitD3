import * as d3 from 'd3';
import * as d3s from 'd3-simple-slider';
import * as Stomp from '@stomp/stompjs';

import style from './index.css';

const beAPI = `${window.location.protocol}//${window.location.host}/api/`
var client;
var subscription;

d3.select("#keybutton").on("click", start_connection)

function start_connection() {
    d3.json(`${beAPI}stomp`)
	.then((res) => {
	    client = Stomp.client(res.url)
	    client.debug = null
	    client.connect(res.login, res.passcode,
		on_connect,
		(error) => {
		    console.log(error)
		})
	})
	.catch((err) => {
	    console.log(err)
	})
}

function on_connect() {
    let routing_key = d3.select("#keyinput").property("value")
    d3.json(`${beAPI}binding/${Math.floor(Math.random()*1000000000)}`,
	{
	    'method': 'PUT',
	    'body': JSON.stringify({'routing_key': routing_key}),
	    'headers': {'content-type': 'application/json'}
	})
	.then((res) => {
	    subscription = client
		.subscribe(`/amq/queue/${res.queue_name}`,
		    on_message)
	    console.log("Connected to: " + res.queue_name + " Key: " + routing_key)
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

var width = window.innerWidth - 20,
    height = window.innerHeight - 100

const domain = 2

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
    .domain([-domain, domain])
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

var slider = d3s.sliderHorizontal()
    .min(0.1)
    .max(2)
    .step(0.1)
    .default(domain)
    .width(width/2)
    .displayValue(false)
    .on('onchange', val => {
	y.domain([-val, val])
    });

d3.select("#slider").append("svg")
    .attr("width", width/1.5)
    .attr("height", 70)
    .append("g")
    .attr("transform", "translate(30,10)")
    .call(slider);

