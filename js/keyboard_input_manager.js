function KeyboardInputManager() {
  this.events = {};

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    75: 0, // vim keybindings
    76: 1,
    74: 2,
    72: 3
  };

  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        var feedbackContainer  = document.getElementById('feedback-container');
        feedbackContainer.innerHTML = ' ';
        self.emit("move", mapped);
      }

      if (event.which === 32) self.restart.bind(self)(event);
    }
  });

  var retry = document.getElementsByClassName("retry-button")[0];
  retry.addEventListener("click", this.restart.bind(this));

  var hintButton = document.getElementById('hint-button');
  hintButton.addEventListener('click', function(e) {
    e.preventDefault();
    var feedbackContainer  = document.getElementById('feedback-container');
    feedbackContainer.innerHTML = '<img src=img/spinner.gif />';
    self.emit('think');
  });

  var runButton = document.getElementById('run-button');
  runButton.addEventListener('click', function(e) {
    e.preventDefault();
    self.emit('run')
  })

  var oscTypeButtonWrapper = document.querySelectorAll(".osc-type-buttons")[0];
  oscTypeButtonWrapper.addEventListener('click', function(e) {
    e.preventDefault();

    var buttonItems = document.querySelectorAll(".osc-type-button");
    for (var i=0, j=buttonItems.length; i<j; i++){
        var button = buttonItems[i];
        if (button.className) {
            button.className = button.className.replace(/\bactive\b/, '');
        }
    }

    e.srcElement.className += ' active';
    self.emit('oscTypeChange', e.srcElement.value);
  })

  var oscPitchInput = document.getElementById('pitch-input');
  oscPitchInput.addEventListener('change', function(e) {
    e.preventDefault();
    self.emit('oscPitch', e.srcElement.value);
  })

  var oscPitchSlider = document.getElementById('pitch-slider');
  oscPitchSlider.addEventListener('change', function(e) {
    e.preventDefault();

    var pitchValue = e.srcElement.value;
    document.getElementById('pitch-input').value = pitchValue;
    self.emit('oscPitch', pitchValue);
  })

  // Listen to swipe events
  var gestures = [Hammer.DIRECTION_UP, Hammer.DIRECTION_RIGHT,
                  Hammer.DIRECTION_DOWN, Hammer.DIRECTION_LEFT];

  var gameContainer = document.getElementsByClassName("game-container")[0];
  var handler       = Hammer(gameContainer, {
    drag_block_horizontal: true,
    drag_block_vertical: true
  });

  handler.on("swipe", function (event) {
    event.gesture.preventDefault();
    mapped = gestures.indexOf(event.gesture.direction);

    if (mapped !== -1) self.emit("move", mapped);
  });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};
