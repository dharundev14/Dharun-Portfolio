/* ============================================================================
   DHARUN D — POSIX-STYLE TERMINAL EMULATOR
   Commands · history · tab completion · mode switching · log-scan simulation
   Exposes: window.Terminal
   ========================================================================== */

(function () {
  'use strict';

  var D = window.PortfolioData;
  var CLI = {};

  var state = {
    ready: false,
    booted: false,
    busy: false,
    history: [],
    hIndex: 0,
    draft: '',
    cwd: '/'
  };

  var el = {};

  /* --------------------------------------------------------------------------
     Utilities
     ------------------------------------------------------------------------ */
  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function scrollBottom() {
    if (!el.output) return;
    el.output.scrollTop = el.output.scrollHeight;
  }

  function print(html, cls) {
    var line = document.createElement('div');
    line.className = 'cli-line' + (cls ? ' ' + cls : '');
    line.innerHTML = html;
    el.output.appendChild(line);
    scrollBottom();
    return line;
  }

  function gap() { print('', 'cli-gap'); }

  function kv(rows) {
    var html = '<div class="cli-kv">';
    rows.forEach(function (row) {
      html += '<span class="cli-key">' + esc(row[0]) + '</span><span class="cli-val">' + row[1] + '</span>';
    });
    html += '</div>';
    return html;
  }

  function statusClass(code) {
    if (code >= 500) return 'log-status--alert';
    if (code >= 400) return 'log-status--warn';
    return '';
  }

  function clock(offsetMs) {
    var d = new Date(Date.now() + (offsetMs || 0));
    return d.toISOString().slice(11, 19);
  }

  /* --------------------------------------------------------------------------
     Command implementations
     ------------------------------------------------------------------------ */
  var commands = {};

  commands.help = function () {
    var rows = [
      ['help', 'List every available command'],
      ['whoami', 'Operator profile, background and contact'],
      ['ls /projects', 'List the project filesystem'],
      ['cat threat-detector', 'Technical breakdown — detection system'],
      ['cat medlock', 'Technical breakdown — secure medical portal'],
      ['experience', 'Internship and education timeline'],
      ['certs', 'Verified certification registry'],
      ['skills', 'Technical capability matrix'],
      ['contact', 'Direct channels'],
      ['simulate --log-scan', 'Run live regex + time-window detection'],
      ['open projects', 'Return to GUI and open project showcase'],
      ['clear', 'Clear the terminal buffer'],
      ['pwd / date / banner', 'Environment utilities']
    ];
    print('<span class="cli-head">available commands</span>');
    print(kv(rows));
    gap();
    print('<span class="cli-dim">Tab autocompletes commands and paths · ↑ ↓ walks history · Ctrl+K returns to GUI</span>');
  };

  commands.whoami = function () {
    print('<span class="cli-head">identity</span>');
    print(kv([
      ['name', 'Dharun D'],
      ['role', 'Cybersecurity Engineer'],
      ['focus', 'Threat analysis · network security · ethical hacking'],
      ['education', 'B.Tech CSE (Cybersecurity), Jain University (2022–2026)'],
      ['location', 'Bangalore, Karnataka, India'],
      ['email', 'dharundev.05@gmail.com'],
      ['phone', '+91 6360059004'],
      ['linkedin', 'linkedin.com/dharun-dev'],
      ['status', '<span class="cli-ok">open to 2026 security engineering roles</span>']
    ]));
    gap();
    print('<span class="cli-muted">Cybersecurity engineer working across threat analysis, network defense and application security. I build detection logic that correlates log evidence into actionable alerts, and design access controls that hold under attack pressure.</span>');
    gap();
    print('<span class="cli-dim">Verified:</span> <span class="cli-ok">CEH · CND · Digital Forensics</span> <span class="cli-dim">(EC-Council)</span>');
  };

  commands.ls = function (args) {
    var path = normalize(args[0] || state.cwd);
    var entries = D.terminal.dirs[path];

    if (!entries) {
      print('<span class="cli-err">ls: cannot access \'' + esc(args[0] || path) + '\': No such directory</span>');
      print('<span class="cli-dim">Try: ls / · ls /projects · ls /notes</span>');
      return;
    }

    print('<span class="cli-dim">' + esc(path === '/' ? '/' : path + '/') + '</span>');
    entries.forEach(function (name) {
      var isDir = /\/$/.test(name);
      print(
        '<span class="cli-dim">' + (isDir ? 'drwxr-xr-x' : '-rw-r--r--') + '</span>  ' +
        '<span class="' + (isDir ? 'cli-accent' : 'cli-val') + '">' + esc(name) + '</span>'
      );
    });
    if (path === '/projects') {
      gap();
      print('<span class="cli-dim">Read a breakdown with</span> <span class="cli-accent">cat threat-detector</span> <span class="cli-dim">or</span> <span class="cli-accent">cat medlock</span>');
    }
  };

  commands.cat = function (args) {
    if (!args[0]) {
      print('<span class="cli-err">cat: missing operand</span>');
      print('<span class="cli-dim">Try: cat README.md · cat threat-detector · cat medlock</span>');
      return;
    }

    var key = resolveFile(args[0]);

    if (!key) {
      print('<span class="cli-err">cat: ' + esc(args[0]) + ': No such file</span>');
      print('<span class="cli-dim">Available: README.md · resume.txt · contact.txt · certifications.txt · threat-detector · medlock · hardening.md</span>');
      return;
    }

    var lines = D.terminal.files[key];
    lines.forEach(function (raw, index) {
      if (index === 0 && /^#\s?/.test(raw)) {
        print('<span class="cli-head">' + esc(raw.replace(/^#\s?/, '')) + '</span>');
        gap();
        return;
      }
      if (raw === '') { gap(); return; }
      var html = esc(raw)
        .replace(/\[x\]/g, '<span class="cli-ok">[x]</span>')
        .replace(/\[ \]/g, '<span class="cli-warn">[ ]</span>');
      print('<span class="cli-muted">' + html + '</span>');
    });
  };

  commands.projects = function () {
    print('<span class="cli-head">featured engineering</span>');
    D.projects.forEach(function (project) {
      print('<span class="cli-accent">' + esc(project.index) + '</span>  <span class="cli-bold">' + esc(project.title) + '</span>');
      print('      <span class="cli-dim">' + esc(project.tagline) + '</span>');
      print('      <span class="cli-muted">' + esc(project.summary) + '</span>');
      print('      <span class="cli-dim">cat ' + esc(project.id) + '</span>');
      gap();
    });
    print('<span class="cli-dim">open projects</span> <span class="cli-muted">switches to the GUI architecture reviews and sandbox.</span>');
  };

  commands.experience = function () {
    print('<span class="cli-head">security timeline</span>');
    D.experience.forEach(function (item) {
      print(
        '<span class="cli-bold">' + esc(item.role) + '</span> <span class="cli-dim">@</span> ' +
        '<span class="' + (item.type === 'education' ? 'cli-ok' : 'cli-accent') + '">' + esc(item.org) + '</span>'
      );
      print('<span class="cli-dim">' + esc(item.period) + ' · ' + esc(item.mode) + '</span>');
      item.bullets.forEach(function (bullet) {
        print('<span class="cli-muted">  › ' + esc(bullet) + '</span>');
      });
      gap();
    });
    print('<span class="cli-dim">Full detail lives in the GUI timeline.</span>');
  };

  commands.certs = function () {
    print('<span class="cli-head">verified certifications</span>');
    D.certifications.forEach(function (cert) {
      print(
        '<span class="cli-ok">[VERIFIED]</span> <span class="cli-bold">' + esc(cert.name) + '</span> ' +
        '<span class="cli-dim">— ' + esc(cert.issuer) + '</span>'
      );
    });
    gap();
    print('<span class="cli-dim">EC-Council · Udemy · IBM SkillsBuild India · Google DSC</span>');
  };

  commands.skills = function () {
    print('<span class="cli-head">capability matrix</span>');
    D.skills.forEach(function (group, index) {
      print('<span class="cli-accent">' + String(index + 1).padStart(2, '0') + '</span> <span class="cli-bold">' + esc(group.title) + '</span>');
      print('     <span class="cli-muted">' + group.tags.map(esc).join(' · ') + '</span>');
      gap();
    });
  };

  commands.contact = function () {
    print('<span class="cli-head">direct channels</span>');
    print(kv([
      ['email', '<span class="cli-accent">dharundev.05@gmail.com</span>'],
      ['phone', '+91 6360059004'],
      ['linkedin', 'linkedin.com/dharun-dev'],
      ['location', 'Bangalore, Karnataka, India · IST (UTC+5:30)'],
      ['response', '<span class="cli-ok">under 24 hours</span>']
    ]));
    gap();
    print('<span class="cli-dim">Copy from the GUI drawer, or use the contact form for a prepared mail draft.</span>');
  };

  commands.pwd = function () {
    print('<span class="cli-muted">/home/dharun</span>');
  };

  commands.date = function () {
    print('<span class="cli-muted">' + esc(new Date().toString()) + '</span>');
  };

  commands.banner = function () {
    D.terminal.banner.forEach(function (line) {
      print('<span class="cli-accent">' + esc(line) + '</span>');
    });
  };

  commands.clear = function () {
    el.output.innerHTML = '';
  };

  commands.open = function (args) {
    var target = (args[0] || '').toLowerCase();
    if (target !== 'projects' && target !== 'sandbox') {
      print('<span class="cli-err">open: expected "projects" or "sandbox"</span>');
      print('<span class="cli-dim">Example: open projects</span>');
      return;
    }
    print('<span class="cli-ok">→ switching to GUI · ' + esc(target) + '</span>');
    setTimeout(function () {
      CLI.setMode('gui');
      var anchor = document.getElementById(target === 'sandbox' ? 'projects' : 'projects');
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
  };

  commands.sudo = function (args) {
    print('<span class="cli-err">[sudo] password for dharun:</span>');
    setTimeout(function () {
      print('<span class="cli-err">dharun is not in the sudoers file. This incident has been logged.</span>');
      print('<span class="cli-dim">… and correlated inside a 60-second window.</span>');
    }, 400);
  };

  commands.simulate = async function (args) {
    if (!args.length || args[0] !== '--log-scan') {
      print('<span class="cli-err">simulate: unsupported mode</span>');
      print('<span class="cli-dim">Usage: simulate --log-scan</span>');
      return;
    }
    await runLogScan();
  };

  /* --------------------------------------------------------------------------
     simulate --log-scan
     ------------------------------------------------------------------------ */
  async function runLogScan() {
    var engine = window.ThreatEngine;
    if (!engine) {
      print('<span class="cli-err">engine unavailable — reload the page</span>');
      return;
    }

    engine.reset();
    setBusy(true);

    print('<span class="cli-head">log-sentinel · live scan</span>');
    print('<span class="cli-dim">rules=5 · window=60s · threshold=5 · source=/var/log/nginx + auth.log</span>');
    gap();

    var events = D.simulate;
    var alerts = [];
    var fired = {};

    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      var findings = engine.scan({
        ts: Date.now(),
        ip: event.ip,
        method: event.method,
        path: event.path,
        status: event.status,
        bytes: event.bytes,
        ua: event.ua
      });

      var flag = '';
      if (findings.length) {
        flag = '  <span class="cli-err">[FLAG ' + findings.map(function (f) { return f.id; }).join(' + ') + ']</span>';
      }

      var line =
        '<span class="cli-dim">' + clock(-((events.length - i) * 1000)) + '</span>  ' +
        '<span class="log-status ' + statusClass(event.status) + '">' + event.status + '</span>  ' +
        '<span class="cli-accent">' + esc(event.method) + '</span> ' +
        '<span class="cli-muted">' + esc(event.path) + '</span> ' +
        '<span class="cli-dim">' + esc(event.ip) + '</span>' + flag;
      print('<div class="log-line">' + line + '</div>');

      if (findings.length) {
        var alert = engine.buildAlert({
          ts: Date.now(),
          ip: event.ip,
          method: event.method,
          path: event.path,
          status: event.status,
          bytes: event.bytes,
          ua: event.ua
        }, findings);
        alerts.push(alert);
        findings.forEach(function (finding) {
          fired[finding.id] = (fired[finding.id] || 0) + 1;
        });
      }

      await sleep(95);
    }

    gap();
    print('<span class="cli-head">scan summary</span>');
    print(kv([
      ['events scanned', String(events.length)],
      ['alerts raised', alerts.length + ' <span class="cli-dim">(deduped per rule/IP)</span>'],
      ['rules fired', Object.keys(fired).join(' · ') || 'none'],
      ['highest severity', highestSeverity(alerts)],
      ['recommended action', '<span class="cli-warn">BLOCK_IP · notify analyst</span>']
    ]));

    if (alerts.length) {
      var primary = alerts.slice().sort(function (a, b) { return b.score - a.score; })[0];
      gap();
      print('<span class="cli-dim">primary alert · JSON</span>');
      print('<div class="cli-pre">' + esc(JSON.stringify(primary, null, 2)) + '</div>');
      gap();
      print('<span class="cli-dim">Open the GUI project card to replay individual payloads in the interactive sandbox.</span>');
    }

    setBusy(false);
  }

  function highestSeverity(alerts) {
    var order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    var top = alerts.reduce(function (acc, alert) {
      return (order[alert.severity] || 0) > (order[acc] || 0) ? alert.severity : acc;
    }, 'LOW');
    var score = alerts.reduce(function (acc, alert) { return Math.max(acc, alert.score || 0); }, 0);
    return top + ' <span class="cli-dim">(score ' + score + ')</span>';
  }

  function setBusy(busy) {
    state.busy = busy;
    if (!el.input) return;
    el.input.disabled = busy;
    el.input.placeholder = busy ? 'scanning log stream…' : "type 'help' to list commands";
    if (!busy) el.input.focus();
  }

  function syncPrompt() {
    if (!el.ps1) return;
    el.ps1.textContent = D.terminal.host + ':' + promptPath() + '$';
  }

  function promptPath() {
    return state.cwd === '/' ? '~' : state.cwd;
  }

  /* --------------------------------------------------------------------------
     Resolution
     ------------------------------------------------------------------------ */
  function normalize(input) {
    if (!input) return '/';
    var path = String(input).trim().replace(/\\/g, '/');
    if (path === '~' || path === '~/' || path === '/home/dharun') return '/';
    if (path === '.') return state.cwd;
    if (path === '..') {
      if (state.cwd === '/') return '/';
      var parts = state.cwd.split('/').filter(Boolean);
      parts.pop();
      return '/' + parts.join('/');
    }
    if (path.charAt(0) !== '/') path = '/' + path;
    path = path.replace(/\/+/g, '/');
    if (path.length > 1) path = path.replace(/\/$/, '');
    return path;
  }

  function resolveFile(input) {
    var raw = String(input).trim().replace(/^\.\//, '');
    var files = D.terminal.files;

    if (files[raw]) return raw;

    var normalized = raw.replace(/^\/+/, '');
    if (files[normalized]) return normalized;

    if (files['projects/' + normalized]) return 'projects/' + normalized;
    if (files['notes/' + normalized]) return 'notes/' + normalized;

    if (raw === 'threat-detector' || raw === 'medlock') return 'projects/' + raw;
    if (raw === 'hardening.md') return 'notes/hardening.md';

    return null;
  }

  function allFiles() {
    return Object.keys(D.terminal.files).map(function (path) {
      return path.replace(/^projects\//, '').replace(/^notes\//, '');
    }).concat(['threat-detector', 'medlock', 'hardening.md']);
  }

  /* --------------------------------------------------------------------------
     Autocomplete
     ------------------------------------------------------------------------ */
  function complete(value) {
    var tokens = value.split(/\s+/);
    var trailingSpace = /\s$/.test(value);
    var last = trailingSpace ? '' : tokens[tokens.length - 1];
    var isFirst = tokens.length === 1 && !trailingSpace;

    if (isFirst) {
      return finish(value, last, Object.keys(commands));
    }

    var command = tokens[0];
    if (command === 'cat') {
      return finish(value, last, allFiles());
    }
    if (command === 'ls') {
      return finish(value, last, ['/projects', '/notes', '/']);
    }
    if (command === 'open') {
      return finish(value, last, ['projects', 'sandbox']);
    }
    if (command === 'simulate') {
      return finish(value, last, ['--log-scan']);
    }
    return { value: value, matches: [] };
  }

  function finish(value, fragment, candidates) {
    var unique = candidates.filter(function (item, index, arr) {
      return arr.indexOf(item) === index;
    });
    var matches = unique.filter(function (item) {
      return item.toLowerCase().indexOf(fragment.toLowerCase()) === 0;
    });

    if (!matches.length) return { value: value, matches: [] };

    var prefix = matches.reduce(function (acc, item) {
      while (item.toLowerCase().indexOf(acc.toLowerCase()) !== 0) {
        acc = acc.slice(0, -1);
      }
      return acc;
    }, matches[0]);

    if (matches.length === 1) {
      return { value: value.slice(0, value.length - fragment.length) + matches[0] + ' ', matches: [] };
    }

    return {
      value: value.slice(0, value.length - fragment.length) + prefix,
      matches: matches
    };
  }

  /* --------------------------------------------------------------------------
     Execution
     ------------------------------------------------------------------------ */
  async function run(raw) {
    if (state.busy) return;

    var input = String(raw == null ? el.input.value : raw).trim();

    print(
      '<span class="cli-dim">' + esc(D.terminal.host) + ':' + esc(promptPath()) + '$</span> ' +
      '<span class="cli-bold">' + esc(input) + '</span>'
    );

    if (!input) return;

    if (state.history[state.history.length - 1] !== input) {
      state.history.push(input);
    }
    state.hIndex = state.history.length;
    state.draft = '';

    var parts = input.split(/\s+/);
    var name = parts[0].toLowerCase();
    var args = parts.slice(1);

    if (name === 'ls' && args[0]) {
      state.cwd = normalize(args[0]);
    }

    if (name === 'cd') {
      var target = normalize(args[0] || '/');
      if (D.terminal.dirs[target]) {
        state.cwd = target;
        syncPrompt();
        print('<span class="cli-dim">cwd → ' + esc(target) + '</span>');
      } else {
        print('<span class="cli-err">cd: no such directory: ' + esc(args[0] || '') + '</span>');
      }
      return;
    }

    var command = commands[name];
    if (!command) {
      print('<span class="cli-err">' + esc(name) + ': command not found</span>');
      var suggestion = Object.keys(commands).find(function (candidate) {
        return candidate.indexOf(name) === 0;
      });
      print('<span class="cli-dim">' + (suggestion ? 'Did you mean "' + suggestion + '"? ' : '') + 'Type "help" for the command list.</span>');
      return;
    }

    try {
      await command(args);
    } catch (error) {
      print('<span class="cli-err">internal error: ' + esc(error.message) + '</span>');
    }
  }

  /* --------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function boot() {
    if (state.booted) return;
    state.booted = true;

    D.terminal.banner.forEach(function (line) {
      print('<span class="cli-accent">' + esc(line) + '</span>');
    });
    gap();
    print('<span class="cli-muted">Welcome to dharun.sec — interactive security terminal.</span>');
    print('<span class="cli-dim">Type</span> <span class="cli-accent">help</span> <span class="cli-dim">for commands, or</span> <span class="cli-accent">simulate --log-scan</span> <span class="cli-dim">to run the detection engine.</span>');
    gap();
  }

  /* --------------------------------------------------------------------------
     Events
     ------------------------------------------------------------------------ */
  function onKeydown(event) {
    if (event.key === 'Enter') return; /* handled by form submit */

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!state.history.length) return;
      if (state.hIndex === state.history.length) state.draft = el.input.value;
      state.hIndex = Math.max(0, state.hIndex - 1);
      el.input.value = state.history[state.hIndex];
      moveCaretEnd();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!state.history.length) return;
      state.hIndex = Math.min(state.history.length, state.hIndex + 1);
      el.input.value = state.hIndex === state.history.length ? state.draft : state.history[state.hIndex];
      moveCaretEnd();
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      var result = complete(el.input.value);
      el.input.value = result.value;
      if (result.matches.length > 1) {
        print('<span class="cli-dim">' + result.matches.map(esc).join('   ') + '</span>');
      }
      moveCaretEnd();
      return;
    }

    if (event.ctrlKey && (event.key === 'l' || event.key === 'L')) {
      event.preventDefault();
      el.output.innerHTML = '';
      return;
    }

    if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
      event.preventDefault();
      print('<span class="cli-dim">^C</span>');
      el.input.value = '';
      state.hIndex = state.history.length;
      return;
    }
  }

  function moveCaretEnd() {
    var value = el.input.value;
    el.input.value = '';
    el.input.value = value;
  }

  function bind() {
    el.form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = el.input.value;
      el.input.value = '';
      run(value);
    });

    el.input.addEventListener('keydown', onKeydown);

    el.quick.forEach(function (button) {
      button.addEventListener('click', function () {
        if (state.busy) return;
        el.input.value = button.getAttribute('data-cmd') || '';
        el.input.focus();
        var value = el.input.value;
        el.input.value = '';
        run(value);
      });
    });

    el.output.addEventListener('click', function () {
      el.input.focus();
    });
  }

  /* --------------------------------------------------------------------------
     Mode switching
     ------------------------------------------------------------------------ */
  function setMode(mode, options) {
    var next = mode === 'cli' ? 'cli' : 'gui';
    options = options || {};

    document.body.setAttribute('data-mode', next);

    if (el.guiView) el.guiView.hidden = next === 'cli';
    if (el.cliView) el.cliView.hidden = next !== 'cli';
    if (el.toggle) el.toggle.setAttribute('aria-checked', next === 'cli' ? 'true' : 'false');

    try {
      sessionStorage.setItem('dharun.mode', next);
    } catch (error) { /* storage unavailable — non-fatal */ }

    if (next === 'cli') {
      boot();
      window.requestAnimationFrame(function () {
        if (options.focus !== false) el.input.focus();
        el.output.scrollTop = el.output.scrollHeight;
      });
    } else if (options.focus !== false && el.toggle) {
      el.toggle.focus();
    }

    window.dispatchEvent(new CustomEvent('modechange', { detail: { mode: next } }));
  }

  CLI.setMode = setMode;
  CLI.open = function () { setMode('cli'); };
  CLI.close = function () { setMode('gui'); };
  CLI.toggle = function () { setMode(document.body.getAttribute('data-mode') === 'cli' ? 'gui' : 'cli'); };
  CLI.isOpen = function () { return document.body.getAttribute('data-mode') === 'cli'; };
  CLI.run = run;
  CLI.focus = function () { if (el.input) el.input.focus(); };

  CLI.init = function () {
    if (state.ready) return;
    el.output = document.getElementById('cli-output');
    el.form = document.getElementById('cli-form');
    el.input = document.getElementById('cli-input');
    el.ps1 = document.querySelector('.cli-ps1');
    el.guiView = document.getElementById('view-gui');
    el.cliView = document.getElementById('view-cli');
    el.toggle = document.getElementById('mode-toggle');
    el.quick = Array.prototype.slice.call(document.querySelectorAll('#cli-quick button'));

    if (!el.output || !el.form || !el.input) return;

    bind();
    boot();
    syncPrompt();
    state.ready = true;
  };

  window.Terminal = CLI;

  document.addEventListener('DOMContentLoaded', CLI.init);
})();
