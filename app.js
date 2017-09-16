// these examples were helpful in understanding the techniques used in this project
// http://bl.ocks.org/tomgp/6475678
// http://bl.ocks.org/alansmithy/e984477a741bc56db5a5

// page setup

var metronome = d3.select('body').append('svg')
  .attr('id', 'metronome')

var containerSize = Math.min(window.innerWidth, window.innerHeight)
metronome.attr('width', containerSize)
  .attr('height', containerSize)
  .style('top', (window.innerHeight - containerSize) / 2 )
  .style('left', (window.innerWidth - containerSize) / 2 )

window.addEventListener('touchmove', function(e) {
  e.preventDefault()
})

// refreshe the whole page when it resizes
window.addEventListener('resize', function() {
  location.reload()
})

// draw metronome dial

var dialRadius = containerSize / 2

var face = metronome.append('g')
  .attr('id', 'face')
  .attr('transform', `translate(${dialRadius}, ${dialRadius})`)

// TODO remember and initialize bpm with localstorage
var bpm = 120

function tickScale() {
  return d3.scaleLinear()
    .range([0, 360 - (360 / bpm)])
    .domain([0, bpm - 1])
}

function setBPM(targetBPM) {
  if (targetBPM < 1) {
    bpm = 1
  } else if (targetBPM > 360) {
    bpm = 360
  } else {
    bpm = targetBPM
  }

  var tick = face.selectAll('.tick')
    .data(d3.range(0, bpm))

  tick.exit().remove()

  tick.enter()
    .append('line')
    .attr('class', 'tick')
    .style('stroke-width', containerSize / 350)
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', dialRadius * 0.9)
    .attr('y2', dialRadius * 0.825)
    .attr('transform', function(d) {
      return `rotate(${tickScale()(d) + 180})`
    })

  tick.transition()
    .attr('transform', function(d) {
      return `rotate(${tickScale()(d) + 180})`
    })

  face.select('.bpm-text')
    .text(bpm)
}

// draw bpm in center

face.append('circle')
  .attr('class', 'bpm-circle')
  .attr('r', dialRadius * 0.2)

face.append('text')
  .attr('class', 'bpm-text')
  .attr('x', 0)
  .attr('y', 0)
  .style('font-size', containerSize / 10)

// draw pointer

face.append('line')
  .attr('class', 'pointer')
  .style('stroke-width', containerSize / 150)
  .attr('x1', 0)
  .attr('x2', 0)
  .attr('y1', dialRadius * 0.2)
  .attr('y2', dialRadius * 0.9)
  .attr('transform', function(d) {
    // TODO dynamic data (pointer angle)
    var d = 0
    return `rotate(${tickScale()(d) + 180})`
  })

setBPM(120)

var lastTouch
// TODO match the touch control to the dial
window.addEventListener('touchmove', function(e) {
  var touch = e.touches[0]
  if (lastTouch) {
    var difference = lastTouch.clientY - touch.clientY
    setBPM(bpm + difference)
  }
  lastTouch = touch
})
