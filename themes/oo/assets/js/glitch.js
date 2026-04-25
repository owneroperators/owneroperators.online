(function () {
  var CHARS = '░▒▓▊▋▌─│┼╬╫▄▀▐█╱╲╳';
  var COLORS = ['#ff5050', '#50ffc8', '#c896ff', '#ffff64', '#f2f1ed'];

  function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function rc() { return COLORS[ri(0, COLORS.length - 1)]; }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function corrupt(line) {
    return line.split('').map(function (c) {
      return (c !== ' ' && Math.random() < 0.12)
        ? CHARS[ri(0, CHARS.length - 1)]
        : c;
    }).join('');
  }

  function GlitchText(el) {
    var raw = el.textContent.replace(/^\n/, '').replace(/\n$/, '');
    this.lines = raw.split('\n');
    el.innerHTML = this.lines.map(function (l) {
      return '<span class="g-ln">' + esc(l) + '</span>';
    }).join('\n');
    this.spans = Array.prototype.slice.call(el.querySelectorAll('.g-ln'));
    this._tick();
  }

  GlitchText.prototype._hit = function () {
    var self = this;
    var n = this.spans.length;
    if (!n) return;

    var r = Math.random();

    if (r < 0.25) {
      // horizontal color sweep — band travels down several consecutive lines
      var start = ri(0, n - 1);
      var width = ri(2, Math.min(6, n));
      for (var j = 0; j < width; j++) {
        (function (j) {
          setTimeout(function () {
            var s = self.spans[(start + j) % n];
            var c = rc();
            s.style.color = c;
            s.style.textShadow = '0 0 5px ' + c + ', 0 0 12px ' + c;
            setTimeout(function () {
              s.style.color = '';
              s.style.textShadow = '';
            }, ri(80, 180));
          }, j * ri(18, 40));
        })(j);
      }
    } else {
      // pick 1-3 individual lines for spot effects
      var count = ri(1, Math.min(3, Math.ceil(n * 0.12) + 1));
      var seen = {};
      var hits = [];
      for (var i = 0; i < count; i++) {
        var idx, t = 0;
        do { idx = ri(0, n - 1); t++; } while (seen[idx] && t < 12);
        if (seen[idx]) continue;
        seen[idx] = true;
        hits.push(idx);
      }

      hits.forEach(function (idx) {
        var s = self.spans[idx];
        var e = Math.random();

        if (e < 0.3) {
          // character corruption
          s.textContent = corrupt(self.lines[idx]);
          s.style.opacity = '0.8';
        } else if (e < 0.55) {
          // horizontal drift + tint
          s.style.display = 'inline-block';
          s.style.transform = 'translateX(' + ri(-5, 5) + 'px)';
          s.style.color = rc();
        } else if (e < 0.75) {
          // single-line color flash
          var c = rc();
          s.style.color = c;
          s.style.textShadow = '0 0 8px ' + c;
        } else if (e < 0.9) {
          // opacity dropout
          s.style.opacity = (0.08 + Math.random() * 0.35).toFixed(2);
        } else {
          // full blank
          s.style.opacity = '0.02';
        }

        setTimeout(function () {
          s.style.color = '';
          s.style.textShadow = '';
          s.style.transform = '';
          s.style.display = '';
          s.style.opacity = '';
          s.textContent = self.lines[idx];
        }, ri(60, 280));
      });

      // occasional stutter: second hit shortly after
      if (Math.random() < 0.25) {
        setTimeout(function () { self._hit(); }, ri(60, 180));
      }
    }
  };

  GlitchText.prototype._tick = function () {
    var self = this;
    setTimeout(function () {
      self._hit();
      self._tick();
    }, ri(1400, 5500));
  };

  document.querySelectorAll('.ornament, .link-ornament').forEach(function (el) {
    new GlitchText(el);
  });
})();
