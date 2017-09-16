function throttle(callback, id, time) {
  //id true = event needs to be dropped
  if (id === false) {
    id = true
    setTimeout(function () {
      id = false
      callback()
    }, time)
  }
}

var metronomeContainer = d3.select('#metronome')

var containerSize
function resizeContainer() {
  containerSize = Math.min(window.innerWidth, window.innerHeight)
  metronomeContainer.attr('width', containerSize)
                    .attr('height', containerSize)
}
resizeContainer()
let windowResizeThrottleID = false
window.addEventListener('resize', function() {
  throttle(resizeContainer, windowResizeThrottleID, 100)
})

window.addEventListener('touchmove', function(event) {
  event.preventDefault()
})
