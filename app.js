// this was helpful in understanding how to draw clock-like objects http://bl.ocks.org/tomgp/6475678

// page setup

var metronome = d3.select('body').append('svg')
  .attr('id', 'metronome')

var containerSize = Math.min(window.innerWidth, window.innerHeight)
metronome.attr('width', containerSize)
                    .attr('height', containerSize)
                    .style('top', (window.innerHeight - containerSize) / 2 )
                    .style('left', (window.innerWidth - containerSize) / 2 )

window.addEventListener('touchmove', function(event) {
  event.preventDefault()
})

// TODO resize stuff page size changes, for now refresh the whole page
window.addEventListener('resize', function() {
  location.reload()
})

// draw metronome

// TODO remember with localstorage
var bpm = 120

function tickScale() {
  return d3.scaleLinear()
    .range([0, 360 - (360 / bpm)])
    .domain([0, bpm - 1])
}

var dialRadius = containerSize / 2

var face = metronome.append('g')
  .attr('id', 'face')
  .attr('transform', `translate(${dialRadius}, ${dialRadius})`)

face.selectAll('.tick')
  .data(d3.range(0, bpm)).enter()
    .append('line')
    .attr('class', 'tick')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', dialRadius * 0.9)
    .attr('y2', dialRadius * 0.825)
    .attr('transform', function(d) {
      return `rotate(${tickScale()(d)})`
    })
