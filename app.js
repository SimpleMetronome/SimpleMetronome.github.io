
var App = {

  init: function init() {
    App.sounder.howler = new Howl({
      urls: ["sounds/tick.mp3"],
      volume: App.settings.volume
    })
    document.querySelector("#toggle").addEventListener("click", App.smartToggle)
    window.addEventListener("keydown", function(event) {
      if (event.keyCode == 32) {
        // spacebar
        event.preventDefault()
        App.smartToggle()
      }
    })
  },

  smartToggle: function smartToggle() {
    if (!App.settings.updateBpm(document.querySelector("#bpm").value)) {
      // only toggle if tempo wasn't updated
      App.ticker.toggle()
    }
  },
  // TODO bug: if tempo was changed while stopped, smartToggle takes an extra toggle to start

  settings: {
    updateBpm: function updateBpm(unsafeBpm) {
      var lastBpm = App.settings.bpm
      var bpm = (unsafeBpm > 0 && unsafeBpm < Infinity) ? Number(unsafeBpm) : lastBpm
      // makes sure bpm is valid, limit is any positive number
      App.settings.bpm = bpm
      return (lastBpm != bpm)
      // true if bpm was changed
    },
    bpm: 120,
    getBpmInMs: function() {
      return 60 / App.settings.bpm * 1000
    },
    volume: 1
  },

  ticker: {
    active: false,
    start: function start() {
      App.ticker.stop()
      App.ticker.active = true
      App.ticker.cycle()
    },
    stop: function stop() {
      App.ticker.active = false
      clearTimeout(App.ticker.cycleId)
      // canceling current cycle prevents multiple ticking from rapid start/stop (hopefully)
    },
    toggle: function toggle() {
      if (!App.ticker.active) {
        App.ticker.start()
      } else {
        App.ticker.stop()
      }
    },
    cycle: function cycle() {
      if (App.ticker.active) {
        App.ticker.tick()
        App.ticker.cycleId = setTimeout(App.ticker.cycle, App.settings.getBpmInMs())
      }
    },
    tick: function tick() {
      if (App.sounder.enabled) { App.sounder.sound() }
      if (App.flasher.enabled) { App.flasher.flash() }
    }
  },

  sounder: {
    enabled: true,
    sound: function sound() {
      App.sounder.howler.play()
    }
  },

  flasher: {
    enabled: true,
    flashOn: function flashOn() {
      document.querySelector("#flash").classList.add("active")
    },
    flashOff: function flashOff() {
      document.querySelector("#flash").classList.remove("active")
    },
    flash: function flash() {
      App.flasher.flashOn()
      setTimeout(App.flasher.flashOff, App.settings.getBpmInMs() / 2)
    }
  }

}

window.addEventListener("load", App.init)
