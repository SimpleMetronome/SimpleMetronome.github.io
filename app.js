// these examples were helpful in understanding the techniques used in this project
// http://bl.ocks.org/tomgp/6475678
// http://bl.ocks.org/alansmithy/e984477a741bc56db5a5

// page setup

var metronome = d3.select('body').append('svg')
  .attr('class', 'metronome')

var windowMin = Math.min(window.innerWidth, window.innerHeight)
metronome.attr('width', window.innerWidth)
  .attr('height', window.innerHeight)
  .style('top', 0)
  .style('left', 0)

window.addEventListener('touchmove', function(e) {
  e.preventDefault()
})

// refresh the whole page when window resizes

// TODO dynamically resize without having to refresh page
window.addEventListener('resize', function() {
  location.reload()
})

// draw metronome dial

var dialRadius = windowMin / 2

var face = metronome.append('g')
  .attr('id', 'face')
  .attr('transform', `translate(${dialRadius + (window.innerWidth - windowMin) / 2}, ${dialRadius + (window.innerHeight - windowMin) / 2})`)

// remember and initialize bpm with localstorage

// TODO duplicate pt. 1
var bpm
if (!localStorage.bpm) {
  bpm = 120
  localStorage.bpm = 120
} else {
  bpm = localStorage.bpm
}

function tickScale() {
  return d3.scaleLinear()
    .range([0, 360 - (360 / bpm)])
    .domain([0, bpm - 1])
}

// tick manager

var sound = new Howl({
  src: ['tick.mp3']
})

function tick() {
  // TODO play sound
  sound.play()
  // animate pointer
  updatePointer()
}

var tickActive = false
var tickID
function stopTick() {
  tickActive = false
  resetPointer()
  updatePointer()
  clearInterval(tickID)
}
function restartTick() {
  stopTick()
  tickActive = true
  tickID = setInterval(tick, 60 / bpm * 1000)
}
function startTick() {
  restartTick()
  tick()
}
function updateTick() {
  if (tickActive) {
    restartTick()
  }
  resetPointer()
  updatePointer()
}
function toggleTick() {
  if (tickActive) {
    stopTick()
  } else {
    startTick()
  }
}

function setBPM(targetBPM) {
  // verifier
  targetBPM = Math.round(targetBPM)
  if (targetBPM < 1) {
    bpm = 1
  } else if (targetBPM > 360) {
    bpm = 360
  } else {
    bpm = targetBPM
  }
  localStorage.bpm = bpm

  updateTick()
  // TODO more subtle scrolling sound?

  // redraw ticks
  var ticks = face.selectAll('.tick')
    .data(d3.range(0, bpm))

  ticks.exit().remove()

  ticks.enter()
    .append('line')
    .attr('class', 'tick')
    .style('stroke-width', windowMin / 350)
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', dialRadius * 0.9)
    .attr('y2', dialRadius * 0.825)
    .attr('transform', function(d) {
      return `rotate(${tickScale()(d) + 180})`
    })

  ticks.attr('transform', function(d) {
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
  .style('font-size', windowMin / 10)

// draw pointer

face.append('line')
  .attr('class', 'pointer')
  .style('stroke-width', windowMin / 150)
  .attr('x1', 0)
  .attr('x2', 0)
  .attr('y1', dialRadius * 0.2)
  .attr('y2', dialRadius * 0.9)
  .attr('transform', function(d) {
    var d = 0
    return `rotate(${tickScale()(d) + 180})`
  })

var pointer = d3.selectAll('.pointer')

var pointerPos = 0

function resetPointer() {
  pointerPos = 0
}

function updatePointer() {
  if (pointerPos >= bpm) {
    resetPointer()
  }
  pointer.data([pointerPos])
  .transition()
  .attr('transform', function(d) {
    // dynamic pointer angle
    return `rotate(${tickScale()(d) + 180})`
  })
  pointerPos ++
}

// TODO duplicate pt. 2
setBPM(bpm)

// logarithmic touch scrolling bpm

// TODO better acceleration and slower-than-event-unit scrolling
var touchRatio = 1
var touchAcceleration = 1

var lastTouch
window.addEventListener('touchstart', function(e) {
  lastTouch = e.touches[0]
})
window.addEventListener('touchmove', function(e) {
  var touch = e.touches[0]
  var delta = (lastTouch.clientY - touch.clientY)
  if (delta !== 0) {
    delta = delta / touchRatio
    var sign = Math.sign(delta)
    var difference = sign * Math.pow(Math.abs(delta), touchAcceleration)
    if (sign === +1) {
      difference = Math.ceil(difference)
    } else if (sign === -1) {
      difference = Math.floor(difference)
    }
    setBPM(bpm + difference)
    lastTouch = touch
  }
})

// mouse wheel scrolling bpm

window.addEventListener('wheel', function(e) {
  var difference
  if (e.deltaY > 0) {
    difference = -1
  } else {
    difference = 1
  }
  setBPM(bpm + difference)
})

// keyboard events

window.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
    setBPM(bpm + 1)
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
    setBPM(bpm - 1)
  } else if (e.key === ' ') {
    toggleTick()
  }
})
