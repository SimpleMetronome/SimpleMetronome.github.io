var metronomeContainer = d3.select('#metronome')

var containerSize
function resizeContainer() {
  containerSize = Math.min(window.innerWidth, window.innerHeight)
  metronomeContainer.attr('width', containerSize)
                    .attr('height', containerSize)
                    .style('top', (window.innerHeight - containerSize) / 2 )
                    .style('left', (window.innerWidth - containerSize) / 2 )
}
resizeContainer()
window.addEventListener('resize', resizeContainer)

window.addEventListener('touchmove', function(event) {
  event.preventDefault()
})
