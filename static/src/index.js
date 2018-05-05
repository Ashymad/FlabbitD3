import * as d3 from 'd3';
import * as Stomp from '@stomp/stompjs';
import * as request from 'superagent';

import style from './index.css';

var beAPI = 'http://127.0.0.1:8888/api/';
var client;

request
    .get(beAPI + 'stomp')
    .end((err, res) => {
	if (err) {
	    console.log(err)
	} else {
	    client = Stomp.client(res.body.url)
	    client.connect(res.body.login, res.body.passcode,
		() => {
		    console.log("Connected via STOMP!")
		},
		(error) => {
		    console.log(error)
		})
	}
    })

var limit = 60 * 1,
    duration = 750,
    now = new Date(Date.now() - duration)

var width = 800,
    height = 300

var groups = {
    current: {
	value: 0,
	color: 'orange',
	data: d3.range(limit).map(function() {
	    return 0
	})
    },
    target: {
	value: 0,
	color: 'green',
	data: d3.range(limit).map(function() {
	    return 0
	})
    },
    output: {
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
    .domain([0, 100])
    .range([height, 0])

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
    .attr('height', height + 50)

var axis = svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(x.axis = d3.axisBottom(x))

var paths = svg.append('g')

for (var name in groups) {
    var group = groups[name]
    group.path = paths.append('path')
	.data([group.data])
	.attr('class', name + ' group')
	.style('stroke', group.color)
}

function tick() {
    now = new Date()

    // Add new values
    for (var name in groups) {
	var group = groups[name]
	//group.data.push(group.value) // Real values arrive at irregular intervals
	group.data.push(Math.random() * 100)
	group.path.attr('d', line)
    }

    // Shift domain
    x.domain([now - (limit - 2) * duration, now - duration])

    var t = d3.transition()
	.duration(duration)
	.ease(d3.easeLinear)

    // Slide x-axis left
    axis.transition(t).call(x.axis);

    // Slide paths left
    paths.attr('transform', null)
	.transition(t)
	.attr('transform', 'translate(' + x(now - (limit - 1) * duration) + ')')
	.on('end', tick)

    // Remove oldest data point from each group
    for (var name in groups) {
	var group = groups[name]
	group.data.shift()
    }
}

tick()
