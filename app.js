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

var tickSound = new Howl({
  src: ['tick.mp3']
})

function tick() {
  tickSound.play()
  updatePointer()
}

localStorage.tickActive = false

var tickID
function updateTick() {
  if (localStorage.tickActive == 'true') {
    clearInterval(tickID)
    resetPointer()
    updatePointer()
    pointerPos = bpm - 1
    updatePointer()
    setTimeout(updatePointer, 50)
    tickID = setInterval(tick, 60 / bpm * 1000)
  } else {
    clearInterval(tickID)
    resetPointer()
    updatePointer()
  }
}

function toggleTick() {
  if (localStorage.tickActive == 'true') {
    localStorage.tickActive = false
    updateTick()
  } else {
    localStorage.tickActive = true
    tickSound.play()
    updateTick()
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
  .transition().duration(50)
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

// sync controls accross multiple windows

window.addEventListener('storage', updateTick)

// buttons
// TODO fill as much space as possible with buttons

var extraWidth = (window.innerWidth - windowMin) / 2
var extraHeight = (window.innerHeight - windowMin) / 2

var topLeft = metronome.append('g')
  .attr('class', 'button button-mute')
  .attr('transform', `translate(${extraWidth + dialRadius * 0.21}, ${extraHeight + dialRadius * 0.21})`)
topLeft.append('circle')
  .attr('r', dialRadius * 0.2)
  .style('stroke-width', windowMin / 150)
topLeft.append('text')
  .style('font-size', dialRadius / 5)
  .text('\uf028')

var topRight = metronome.append('g')
  .attr('transform', `translate(${window.innerWidth - extraWidth - dialRadius * 0.21}, ${extraHeight + dialRadius * 0.21})`)
  .attr('class', 'button button-info')
topRight.append('circle')
  .attr('r', dialRadius * 0.2)
  .style('stroke-width', windowMin / 150)
topRight.append('text')
  .style('font-size', dialRadius / 5)
  .text('\uf128')

var bottomLeft = metronome.append('g')
  .attr('class', 'button button-detect')
  .attr('transform', `translate(${extraWidth + dialRadius * 0.21}, ${window.innerHeight - extraHeight - dialRadius * 0.21})`)
bottomLeft.append('circle')
  .attr('r', dialRadius * 0.2)
  .style('stroke-width', windowMin / 150)
bottomLeft.append('text')
  .style('font-size', dialRadius / 5)
  .text('\uf0a6')

var bottomRight = metronome.append('g')
  .attr('class', 'button button-toggle')
  .attr('transform', `translate(${window.innerWidth - extraWidth - dialRadius * 0.21}, ${window.innerHeight - extraHeight - dialRadius * 0.21})`)
bottomRight.append('circle')
  .attr('r', dialRadius * 0.2)
  .style('stroke-width', windowMin / 150)
bottomRight.append('text')
  .style('font-size', dialRadius / 5)
  .text('\uf04c')

// button event listeners
// TODO show button state on button visually

// d3.select('.button-mute').on('click', toggleMute)
// d3.select('.button-info').on('click', toggleInfo)
// d3.select('.button-detect').on('click', detectTapped)
d3.select('.button-toggle').on('click', toggleTick)
