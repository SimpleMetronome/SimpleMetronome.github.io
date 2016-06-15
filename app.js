
var App = {

  init: function init() {
    App.sounder.howler = new Howl({
      urls: ["tick.mp3"],
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
    document.querySelector("#flash").addEventListener("touchstart", App.detector.tap)
    document.querySelector("#flash").addEventListener("mousedown", App.detector.tap)
    App.flasher.updateTiming()
    App.loadStorage()
    // should bpm input always be saved to localStorage even if not set yet by spacebar?
  },

  smartToggle: function smartToggle() {
    if (!App.settings.updateBpm(document.querySelector("#bpm").value) || !App.ticker.active) {
      // only toggle if tempo wasn't updated
      // however, if ticker is stopped, toggle regardless
      App.ticker.toggle()
    }
  },

  msToBpm: function(ms) {
    return 60 * 1000 / ms
  },

  settings: {
    updateBpm: function updateBpm(uncheckedBpm) {
      var lastBpm = App.settings.bpm
      var bpm
      if (uncheckedBpm === "") {
        bpm = 120
        // to match placeholder
      } else if (uncheckedBpm > 0 && uncheckedBpm < Infinity) {
        bpm = Number(uncheckedBpm)
      } else {
        bpm = lastBpm
      }
      // makes sure bpm is valid, limit is any positive number
      if (lastBpm != bpm) {
        // if bpm was changed
        App.settings.setBpm(bpm)
        return true
      } else {
        return false
      }
    },
    setBpm: function setBpm(bpm) {
      App.settings.bpm = bpm
      localStorage.bpm = bpm
      App.flasher.updateTiming()
      // TODO FIXME: setting from detector using this function will not short circuit slow beats unless toggled off and on again
    },
    bpm: 120,
    // TODO store bpm in localStorage
    getBpmInMs: function() {
      return 60 / App.settings.bpm * 1000
    },
    getBpmInS: function() {
      return 60 / App.settings.bpm
    },
    volume: 1
  },

  detector: {
    lastTap: null,
    tap: function tap(event) {
      currentTap = event.timeStamp
      lastTap = App.detector.lastTap
      if (lastTap != null) {
        difference = currentTap - lastTap
        bpm = Math.round(App.msToBpm(difference))
        App.settings.setBpm(bpm)
        App.loadInput()
      }
      App.detector.lastTap = currentTap
    }
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
      // TODO cancel CSS animation here
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
      // TODO change this timing to go with the CSS animation?
    },
    updateTiming: function updateTiming() {
      var timing = (App.settings.getBpmInS() / 2) + "S"
      document.querySelector("#flash").style.setProperty("transition", timing)
    }
    // TODO can compress all these functions into flash() using CSS animations?
  },

  loadInput: function loadInput() {
    document.querySelector("#bpm").value = (App.settings.bpm == 120) ? "" : App.settings.bpm
  },

  loadStorage: function loadStorage() {
    App.settings.updateBpm(localStorage.bpm)
    App.loadInput()
  }

}

window.addEventListener("load", App.init)
