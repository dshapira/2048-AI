function OscBank(size) {
  this.tileContainer    = document.getElementsByClassName("tile-container")[0];
  this.scoreContainer   = document.getElementsByClassName("score-container")[0];
  this.messageContainer = document.getElementsByClassName("game-message")[0];
  this.sharingContainer = document.getElementsByClassName("score-sharing")[0];

  this.score = 0;
  this.size = size;

  this.oscBank = [];
  this.ampBank = [];
  this.oscType = 'sawtooth';
  this.audioPlaying = true;
  this.freqBase = 36.71;

  this.setup();
}

OscBank.prototype.setup = function () {
  // Fix up AudioContext browser prefixing
  window.AudioContext = window.AudioContext||window.webkitAudioContext;
  this.audioContext = new AudioContext();

  // setup master amp control
  this.masterAmp = this.audioContext.createGain();
  this.masterAmp.connect(this.audioContext.destination);
  this.masterAmp.gain.value = this.audioPlaying ? .05 : 0;

  // setup oscillator bank
  this.buildBank();
};

// Build a grid of the specified size
OscBank.prototype.buildBank = function () {
  var baseAmpValue = 0;

  for (var x = 0; x < this.size; x++) {
    var oscRow = this.oscBank[x] = [];
    var ampRow = this.ampBank[x] = [];

    for (var y = 0; y < this.size; y++) {
      var osc = this.audioContext.createOscillator();
      var amp = this.audioContext.createGain();

      osc.type = this.oscType;
      osc.frequency.value = this.freqBase;
      amp.gain.value = baseAmpValue;
      amp.connect(this.masterAmp);

      osc.connect(amp);
      osc.start(0);

      oscRow.push(osc);
      ampRow.push(amp);
    }
  }
};

OscBank.prototype.update = function (grid, metadata) {
  var self = this;
  var activeCells = 0;

  // count active cells
  grid.cells.forEach(function (column, column_index) {
    column.forEach(function (cell, row_index) {
      if (cell) {
        activeCells++;
      }
    });
  });

  //assign new cell osc freq and amp
  grid.cells.forEach(function (column, column_index) {
    column.forEach(function (cell, row_index) {
      // assign freg and amp to cell osc
      if (cell) {
        self.oscBank[cell.x][cell.y].frequency.value = self.calFreq(cell.value);
        self.ampBank[cell.x][cell.y].gain.value = 1.0 / activeCells;
      }
      else {
        self.ampBank[column_index][row_index].gain.value = 0.0;
        self.oscBank[column_index][row_index].frequency.value = self.freqBase;
      }
    });
  });
};

OscBank.prototype.calFreq = function (cellValue) {
  return this.freqBase * (Math.log(cellValue) / Math.log(2));
}

OscBank.prototype.changeOscType = function (oscType) {
  var self = this;
  self.oscType = oscType;

  this.oscBank.forEach(function (column) {
    column.forEach(function (osc) {
      osc.type = self.oscType;
    });
  });
}

OscBank.prototype.changeOscPitch = function (oscPitch) {
  var self = this;
  self.freqBase = oscPitch;

  this.oscBank.forEach(function (column) {
    column.forEach(function (osc) {
      osc.frequency.value = self.freqBase;
    });
  });
}