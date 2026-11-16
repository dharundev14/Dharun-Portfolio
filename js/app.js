/* ============================================================================
   DHARUN D — APPLICATION LAYER
   Threat engine · DOM rendering · sandbox · modals · drawer · canvas · UX
   Exposes: window.ThreatEngine, window.App
   ========================================================================== */

(function () {
  'use strict';

  var D = window.PortfolioData;

  /* ==========================================================================
     1. THREAT DETECTION ENGINE
     Shared by the GUI sandbox and the CLI `simulate --log-scan` command.
     ========================================================================== */
  var ENGINE = (function () {
    var rules = D.detection.rules;
    var brute = D.detection.brute;
    var windowMs = D.detection.windowMs;
    var threshold = D.detection.bruteThreshold;
    var authState = new Map();

    function safeDecode(value) {
      try { return decodeURIComponent(value); } catch (error) { return value; }
    }

    function severityRank(severity) {
      return { critical: 4, high: 3, medium: 2, low: 1 }[String(severity).toLowerCase()] || 0;
    }

    function scan(event) {
      var findings = [];
      var decoded = safeDecode(event.path || '');
      var haystack = (event.path || '') + ' ' + decoded;

      rules.forEach(function (rule) {
        var subject = rule.target === 'ua' ? (event.ua || '') : haystack;
        if (rule.re.test(subject)) {
          findings.push({
            id: rule.id,
            label: rule.label,
            severity: rule.severity,
            score: rule.score
          });
        }
      });

      if (event.status === 401) {
        var now = event.ts || Date.now();
        var entry = authState.get(event.ip) || { times: [], alerted: false };

        entry.times.push(now);
        entry.times = entry.times.filter(function (time) { return now - time <= windowMs; });

        if (entry.times.length >= threshold && !entry.alerted) {
          entry.alerted = true;
          findings.push({
            id: brute.id,
            label: brute.label,
            severity: brute.severity,
            score: brute.score,
            detail: { failed_auth: entry.times.length, window_ms: windowMs }
          });
        }

        if (entry.times.length < threshold) entry.alerted = false;

        authState.set(event.ip, entry);
      }

      return findings;
    }

    function actionFor(score) {
      if (score >= 90) return 'BLOCK_IP';
      if (score >= 75) return 'THROTTLE_AND_ALERT';
      return 'ALERT_ANALYST';
    }

    function alertId() {
      var stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      var suffix = Math.random().toString(16).slice(2, 6).toUpperCase();
      return 'ALT-' + stamp + '-' + suffix;
    }

    function buildAlert(event, findings) {
      var ranked = findings.slice().sort(function (a, b) {
        return severityRank(b.severity) - severityRank(a.severity) || b.score - a.score;
      });
      var primary = ranked[0] || {
        id: 'NONE',
        label: 'No detection',
        severity: 'none',
        score: 0
      };
      var bruteFinding = findings.filter(function (finding) { return finding.id === brute.id; })[0];
      var decoded = safeDecode(event.path || '');

      return {
        alert_id: alertId(),
        detected_at: new Date(event.ts || Date.now()).toISOString(),
        engine: 'log-sentinel/1.2',
        severity: String(primary.severity).toUpperCase(),
        score: primary.score,
        rule: { id: primary.id, label: primary.label },
        source: { ip: event.ip, http_status: event.status },
        request: {
          method: event.method,
          path: decoded,
          raw_path: event.path,
          user_agent: event.ua,
          bytes: event.bytes
        },
        evidence: {
          raw_path: event.path,
          decoded_path: decoded,
          matched_rules: findings.map(function (finding) { return finding.id; })
        },
        correlation: bruteFinding
          ? {
              window_ms: windowMs,
              failed_auth: bruteFinding.detail.failed_auth,
              threshold: threshold,
              correlated: true
            }
          : { window_ms: windowMs, matching_events: 1, correlated: false },
        action: actionFor(primary.score),
        analyst_review: primary.score >= 75
      };
    }

    function reset() { authState.clear(); }

    return {
      scan: scan,
      buildAlert: buildAlert,
      reset: reset,
      rules: rules,
      brute: brute,
      windowMs: windowMs,
      threshold: threshold,
      severityRank: severityRank
    };
  })();

  window.ThreatEngine = ENGINE;

  /* ==========================================================================
     2. HELPERS
     ========================================================================== */
  var $ = function (selector, scope) { return (scope || document).querySelector(selector); };
  var $$ = function (selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function toast(title, text, kind) {
    var stack = $('#toast-stack');
    if (!stack) return;

    var node = document.createElement('div');
    node.className = 'toast toast--' + (kind || 'ok');
    node.setAttribute('role', 'status');

    var copy = document.createElement('div');
    copy.className = 'toast-copy';

    var heading = document.createElement('p');
    heading.className = 'toast-title';
    heading.textContent = title;

    var body = document.createElement('p');
    body.className = 'toast-text';
    body.textContent = text || '';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.textContent = '×';

    copy.appendChild(heading);
    if (text) copy.appendChild(body);
    node.appendChild(copy);
    node.appendChild(close);
    stack.appendChild(node);

    function dismiss() {
      node.classList.add('is-out');
      setTimeout(function () {
        if (node.parentNode) node.parentNode.removeChild(node);
      }, 240);
    }

    close.addEventListener('click', dismiss);
    setTimeout(dismiss, 3800);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; });
    }
    return new Promise(function (resolve) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-9999px';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
      document.body.removeChild(area);
      resolve(ok);
    });
  }

  function copyWithToast(text, label) {
    return copyText(text).then(function (ok) {
      if (ok) toast('Copied to clipboard', label || text, 'ok');
      else toast('Copy failed', 'Select the value and copy it manually.', 'err');
      return ok;
    });
  }

  var TYPE_LABEL = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
    clean: 'CLEAN',
    none: 'NONE'
  };

  function actionFor(score) {
    if (score >= 90) return 'BLOCK_IP';
    if (score >= 75) return 'THROTTLE_AND_ALERT';
    return 'ALERT_ANALYST';
  }

  /* ==========================================================================
     3. RENDERING
     ========================================================================== */
  function renderMetrics() {
    var root = $('#metrics');
    if (!root) return;
    root.innerHTML = D.metrics.map(function (metric, index) {
      return (
        '<li class="metric">' +
          '<div class="metric-top">' +
            '<span class="metric-label">' + esc(metric.label) + '</span>' +
            '<span class="metric-idx">0' + (index + 1) + '</span>' +
          '</div>' +
          '<p class="metric-value">' + metric.value + '</p>' +
          '<p class="metric-hint">' + esc(metric.hint) + '</p>' +
        '</li>'
      );
    }).join('');
  }

  function renderExperience() {
    var root = $('#experience-list');
    if (!root) return;
    root.innerHTML = D.experience.map(function (item) {
      var education = item.type === 'education';
      var tags = item.tags.map(function (tag) {
        return '<span class="tl-tag">' + esc(tag) + '</span>';
      }).join('');

      return (
        '<li class="tl-item' + (education ? ' tl-item--edu' : '') + '">' +
          '<article class="tl-card">' +
            '<div class="tl-top">' +
              '<div>' +
                '<h3 class="tl-role">' + esc(item.role) + '</h3>' +
                '<p class="tl-org">' + esc(item.org) + '</p>' +
              '</div>' +
              '<div class="tl-meta">' +
                '<span class="tl-period">' + esc(item.period) + '</span>' +
                '<span class="tl-mode">' + esc(item.mode) + '</span>' +
              '</div>' +
            '</div>' +
            '<ul class="tl-bullets">' +
              item.bullets.map(function (bullet) {
                return '<li>' + esc(bullet) + '</li>';
              }).join('') +
            '</ul>' +
            '<div class="tl-tags">' + tags + '</div>' +
          '</article>' +
        '</li>'
      );
    }).join('');
  }

  function renderProjects() {
    var root = $('#projects-list');
    if (!root) return;

    root.innerHTML = D.projects.map(function (project) {
      var specs = project.specs.map(function (spec) {
        return (
          '<div class="spec-row"><dt>' + esc(spec.k) + '</dt>' +
          '<dd>' + esc(spec.v) + '</dd></div>'
        );
      }).join('');

      var actions = project.actions.map(function (action) {
        if (action.kind === 'arch') {
          return (
            '<button class="btn btn--ghost btn--sm" type="button" data-arch="' + esc(action.modal) + '">' +
              iconArch() + esc(action.label) +
            '</button>'
          );
        }
        return (
          '<button class="btn btn--primary btn--sm" type="button" data-scroll-sandbox="' + esc(project.id) + '">' +
            esc(action.label) +
          '</button>'
        );
      }).join('');

      var sandbox = project.id === 'threat-detector' ? renderSandbox() : '';

      return (
        '<article class="project' + (project.featured ? ' project--featured' : '') + '" id="project-' + esc(project.id) + '">' +
          '<div class="project-head">' +
            '<span class="project-index" aria-hidden="true">' + esc(project.index) + '</span>' +
            '<div class="project-title-row">' +
              '<h3 class="project-title">' + esc(project.title) + '</h3>' +
              '<p class="project-tagline">' + esc(project.tagline) + '</p>' +
            '</div>' +
            '<span class="chip chip--ok project-status">' + esc(project.status) + '</span>' +
          '</div>' +

          '<div class="project-body">' +
            '<div class="project-main">' +
              '<p class="project-desc">' + esc(project.summary) + '</p>' +
              '<ul class="project-points">' +
                project.points.map(function (point) {
                  return '<li>' + esc(point) + '</li>';
                }).join('') +
              '</ul>' +
            '</div>' +
            '<div class="project-side">' +
              '<dl class="spec-list">' + specs + '</dl>' +
              '<div class="project-actions">' + actions + '</div>' +
            '</div>' +
          '</div>' +

          sandbox +
        '</article>'
      );
    }).join('');
  }

  function iconArch() {
    return (
      '<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" fill="none">' +
        '<rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/>' +
        '<rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/>' +
        '<path d="M7 4.5h2.5A1.5 1.5 0 0 1 11 6v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' +
      '</svg>'
    );
  }

  function renderSandbox() {
    var samples = D.sandbox.samples.map(function (sample) {
      return (
        '<button class="payload-btn" type="button" data-sample="' + esc(sample.id) + '">' +
          '<span class="payload-top">' +
            '<span class="payload-label">' + esc(sample.label) + '</span>' +
            '<span class="sev sev--' + esc(sample.sev) + '">' + esc(sample.sev) + '</span>' +
          '</span>' +
          '<span class="payload-meta">' + esc(sample.code) + '</span>' +
        '</button>'
      );
    }).join('');

    return (
      '<section class="sandbox" id="sandbox-threat-detector" aria-labelledby="sandbox-title">' +
        '<div class="sandbox-head">' +
          '<div>' +
            '<p class="sandbox-kicker">live detection sandbox</p>' +
            '<h3 class="sandbox-title" id="sandbox-title">Replay payloads against the rule engine</h3>' +
          '</div>' +
          '<div class="sandbox-telemetry" aria-label="Sandbox telemetry">' +
            '<div class="tele"><span class="tele-val" data-tele="events">0</span><span class="tele-label">events</span></div>' +
            '<div class="tele"><span class="tele-val" data-tele="alerts">0</span><span class="tele-label">alerts</span></div>' +
            '<div class="tele"><span class="tele-val" data-tele="rules">5</span><span class="tele-label">rules armed</span></div>' +
          '</div>' +
        '</div>' +

        '<div class="sandbox-grid">' +
          '<div class="payloads" role="group" aria-label="Sample attack payloads">' +
            '<p class="payloads-label">select payload</p>' + samples +
          '</div>' +
          '<div class="sandbox-stage">' +
            '<div class="console-out" data-console tabindex="0" role="log" aria-live="polite" aria-label="Sandbox log output">' +
              '<p class="log-empty">awaiting payload selection…</p>' +
            '</div>' +
            '<div class="verdict" data-verdict aria-live="polite">' +
              '<span class="verdict-text">engine idle · no findings</span>' +
            '</div>' +
            '<pre class="alert-json" data-alert aria-label="Generated JSON alert">' +
              '{\n  "status": "idle",\n  "events_scanned": 0\n}' +
            '</pre>' +
          '</div>' +
        '</div>' +

        '<div class="sandbox-actions">' +
          '<button class="btn btn--ghost btn--sm" type="button" data-reset-sandbox>Reset engine</button>' +
          '<p class="sandbox-hint">Browser-side engine · <b>same rules, same 60s window</b> as the Python prototype</p>' +
        '</div>' +
      '</section>'
    );
  }

  function renderSkills() {
    var root = $('#skills-grid');
    if (!root) return;
    root.innerHTML = D.skills.map(function (group, index) {
      return (
        '<article class="skill-card">' +
          '<div class="skill-head">' +
            '<span class="skill-idx">0' + (index + 1) + '</span>' +
            '<h3 class="skill-title">' + esc(group.title) + '</h3>' +
          '</div>' +
          '<p class="skill-desc">' + esc(group.desc) + '</p>' +
          '<div class="tag-row">' +
            group.tags.map(function (tag) {
              return '<span class="tag">' + esc(tag) + '</span>';
            }).join('') +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderCertifications() {
    var root = $('#certs-grid');
    if (!root) return;
    root.innerHTML = D.certifications.map(function (cert) {
      return (
        '<article class="cert-card">' +
          '<div class="cert-top">' +
            '<span class="cert-badge" aria-hidden="true">' + esc(cert.initials) + '</span>' +
            '<span class="chip chip--ok">VERIFIED</span>' +
          '</div>' +
          '<h3 class="cert-name">' + esc(cert.name) + '</h3>' +
          '<p class="cert-issuer">' + esc(cert.issuer) + '</p>' +
          '<div class="cert-foot">' +
            '<span class="cert-track">' + esc(cert.track) + '</span>' +
            '<span class="cert-code">EC · CREDENTIAL</span>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderChannels() {
    var root = $('#channels');
    if (!root) return;
    root.innerHTML = D.channels.map(function (channel) {
      return (
        '<button class="channel" type="button" data-channel="' + esc(channel.id) + '" data-copy="' + esc(channel.copy) + '" data-copy-label="' + esc(channel.label) + '">' +
          '<span class="channel-ico" aria-hidden="true">' + esc(channel.icon) + '</span>' +
          '<span class="channel-copy">' +
            '<span class="channel-label">' + esc(channel.label) + '</span>' +
            '<span class="channel-value">' + esc(channel.value) + '</span>' +
          '</span>' +
          '<span class="channel-action">' + esc(channel.action) + '</span>' +
        '</button>'
      );
    }).join('');
  }

  function renderSecurityHeaders() {
    var list = $('#header-list');
    var copies = $('#posture-copies');

    if (list) {
      list.innerHTML = D.securityHeaders.map(function (header) {
        return (
          '<li class="header-row">' +
            '<div class="header-row-top">' +
              '<span class="header-name">' + esc(header.name) + '</span>' +
              '<span class="header-status header-status--' + (header.status === 'pass' ? 'pass' : 'warn') + '">' +
                (header.status === 'pass' ? 'PASS' : 'WARN') +
              '</span>' +
            '</div>' +
            '<code class="header-value">' + esc(header.value) + '</code>' +
          '</li>'
        );
      }).join('');
    }

    if (copies) {
      copies.innerHTML = D.channels.map(function (channel) {
        return (
          '<button class="drawer-copy" type="button" data-copy="' + esc(channel.copy) + '" data-copy-label="' + esc(channel.label) + '">' +
            '<span class="mono">' + esc(channel.value) + '</span>' +
            '<span aria-hidden="true">⧉</span>' +
          '</button>'
        );
      }).join('');
    }
  }

  /* ==========================================================================
     4. SANDBOX
     ========================================================================== */
  var sandboxBusy = false;

  function initSandbox() {
    var section = document.getElementById('sandbox-threat-detector');
    if (!section) return;

    section.addEventListener('click', function (event) {
      var sampleButton = event.target.closest('[data-sample]');
      if (sampleButton) {
        var sample = D.sandbox.samples.filter(function (item) {
          return item.id === sampleButton.getAttribute('data-sample');
        })[0];
        if (sample) playSample(section, sample);
        return;
      }

      if (event.target.closest('[data-reset-sandbox]')) {
        resetSandbox(section);
      }
    });
  }

  function sandboxEls(section) {
    return {
      console: $('[data-console]', section),
      verdict: $('[data-verdict]', section),
      alert: $('[data-alert]', section),
      events: $('[data-tele="events"]', section),
      alerts: $('[data-tele="alerts"]', section)
    };
  }

  function resetSandbox(section) {
    if (sandboxBusy) return;
    ENGINE.reset();
    var els = sandboxEls(section);
    els.console.innerHTML = '<p class="log-empty">awaiting payload selection…</p>';
    els.verdict.className = 'verdict';
    els.verdict.innerHTML = '<span class="verdict-text">engine idle · no findings</span>';
    els.alert.textContent = '{\n  "status": "idle",\n  "events_scanned": 0\n}';
    els.events.textContent = '0';
    els.alerts.textContent = '0';
    toast('Engine reset', 'Correlation window cleared · counters zeroed', 'info');
  }

  async function playSample(section, sample) {
    if (sandboxBusy) return;

    sandboxBusy = true;
    ENGINE.reset();
    var els = sandboxEls(section);
    var buttons = $$('[data-sample]', section);
    buttons.forEach(function (button) { button.disabled = true; });

    if ($('.log-empty', els.console)) els.console.innerHTML = '';

    var divider = document.createElement('div');
    divider.className = 'log-line log-line--divider';
    divider.textContent = '── ' + sample.label.toUpperCase() + ' ──────────────────';
    els.console.appendChild(divider);

    var count = sample.events.length;
    var base = Date.now();
    var allFindings = [];
    var lastAlert = null;
    var flaggedEvents = 0;

    for (var index = 0; index < count; index++) {
      var source = sample.events[index];
      var ts = base - (count - 1 - index) * 4000;

      var event = {
        ts: ts,
        ip: source.ip,
        method: source.method,
        path: source.path,
        status: source.status,
        bytes: source.bytes,
        ua: source.ua
      };

      var findings = ENGINE.scan(event);
      allFindings = allFindings.concat(findings);
      if (findings.length) {
        flaggedEvents += 1;
        lastAlert = ENGINE.buildAlert(event, findings);
      }

      appendLogLine(els.console, event, findings);

      var currentEvents = Number(els.events.textContent || 0) + 1;
      els.events.textContent = String(currentEvents);
      els.console.scrollTop = els.console.scrollHeight;

      if (count > 1) await sleep(300);
    }

    var unique = [];
    allFindings.forEach(function (finding) {
      if (!unique.some(function (item) { return item.id === finding.id; })) unique.push(finding);
    });

    if (unique.length) {
      var primary = unique.slice().sort(function (a, b) {
        return ENGINE.severityRank(b.severity) - ENGINE.severityRank(a.severity) || b.score - a.score;
      })[0];

      els.verdict.className = 'verdict verdict--' + primary.severity;
      els.verdict.innerHTML =
        '<span class="sev sev--' + esc(primary.severity) + '">' + esc(TYPE_LABEL[primary.severity]) + '</span>' +
        '<span class="verdict-text"><b>' + esc(primary.id) + '</b> · ' + esc(primary.label) +
        ' · score ' + primary.score + ' · action <span class="mono">' + esc(actionFor(primary.score)) + '</span></span>';

      els.alerts.textContent = String(Number(els.alerts.textContent || 0) + flaggedEvents);
      els.alert.textContent = JSON.stringify(lastAlert, null, 2);
    } else {
      els.verdict.className = 'verdict verdict--clean';
      els.verdict.innerHTML =
        '<span class="sev sev--clean">CLEAN</span>' +
        '<span class="verdict-text">no signature matched · <b>0</b> findings · ' + count + ' event(s) scanned</span>';

      els.alert.textContent = JSON.stringify({
        alert: false,
        engine: 'log-sentinel/1.2',
        findings: [],
        events_scanned: count,
        note: 'No signature matched and the correlation window stayed below threshold.'
      }, null, 2);
    }

    buttons.forEach(function (button) { button.disabled = false; });
    sandboxBusy = false;
  }

  function appendLogLine(consoleEl, event, findings) {
    var line = document.createElement('div');
    line.className = 'log-line' + (findings.length ? ' log-line--flag' : '');

    var time = document.createElement('span');
    time.className = 'log-time';
    time.textContent = new Date(event.ts).toISOString().slice(11, 19);

    var status = document.createElement('span');
    status.className = 'log-status' + (event.status >= 500
      ? ' log-status--alert'
      : event.status >= 400 ? ' log-status--warn' : '');
    status.textContent = String(event.status);

    var message = document.createElement('span');
    message.className = 'log-msg';
    message.textContent =
      event.method + ' ' + event.path + ' · ' + event.ip +
      (findings.length ? ' · FLAG ' + findings.map(function (finding) { return finding.id; }).join('+') : '');

    line.appendChild(time);
    line.appendChild(status);
    line.appendChild(message);
    consoleEl.appendChild(line);
  }

  /* ==========================================================================
     5. ARCHITECTURE MODAL
     ========================================================================== */
  var modalState = { open: false, lastFocus: null, project: null };

  function buildModalBody(project) {
    var arch = project.architecture;

    var flow = arch.flow.map(function (step, index) {
      return '<span class="flow-chip"><b>' + String(index + 1).padStart(2, '0') + '</b>' + esc(step) + '</span>';
    }).join('');

    var threatRows = arch.threatModel.map(function (row) {
      return (
        '<tr>' +
          '<td>' + esc(row.threat) + '</td>' +
          '<td>' + esc(row.vector) + '</td>' +
          '<td>' + esc(row.control) + '</td>' +
        '</tr>'
      );
    }).join('');

    var implementation = arch.implementation.map(function (step, index) {
      var parts = step.split(' — ');
      var title = parts.length > 1 ? '<strong>' + esc(parts.shift()) + '</strong> — ' : '';
      return (
        '<li>' +
          '<span class="impl-step">' + String(index + 1).padStart(2, '0') + '</span>' +
          title + esc(parts.join(' — ')) +
        '</li>'
      );
    }).join('');

    var diagramPanel =
      '<section class="modal-panel" id="panel-diagram" role="tabpanel" aria-labelledby="tab-diagram" tabindex="0">' +
        '<div class="diagram-wrap">' + arch.svg + '</div>' +
        '<p class="diagram-caption">' + esc(arch.caption) + '</p>' +
        '<div class="flow-row">' + flow + '</div>' +
      '</section>';

    var threatPanel =
      '<section class="modal-panel" id="panel-threat" role="tabpanel" aria-labelledby="tab-threat" tabindex="0" hidden>' +
        '<div class="table-wrap">' +
          '<table class="threat-table">' +
            '<caption>Threat model · asset → attack vector → control</caption>' +
            '<thead><tr><th scope="col">Threat</th><th scope="col">Vector</th><th scope="col">Control</th></tr></thead>' +
            '<tbody>' + threatRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</section>';

    var implPanel =
      '<section class="modal-panel" id="panel-impl" role="tabpanel" aria-labelledby="tab-impl" tabindex="0" hidden>' +
        '<ol class="impl-list">' + implementation + '</ol>' +
        '<div class="code-block">' +
          '<div class="code-head"><span class="mono">' + esc(arch.snippet.file) + '</span>' +
            '<span class="code-lang">' + esc(arch.snippet.lang) + '</span></div>' +
          '<pre><code>' + arch.snippet.code + '</code></pre>' +
        '</div>' +
      '</section>';

    return diagramPanel + threatPanel + implPanel;
  }

  function openArchitecture(id) {
    var project = D.projects.filter(function (item) { return item.id === id; })[0];
    if (!project) return;

    var modal = $('#arch-modal');
    var dialog = $('.modal-dialog', modal);
    var arch = project.architecture;

    modalState.lastFocus = document.activeElement;
    modalState.project = project;

    $('#modal-kicker').textContent = arch.kicker;
    $('#modal-title').textContent = arch.title;
    $('#modal-desc').textContent = arch.summary;
    $('#modal-body').innerHTML = buildModalBody(project);

    selectTab(0, false);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.removeAttribute('inert');

    document.body.style.overflow = 'hidden';
    modalState.open = true;

    window.requestAnimationFrame(function () { dialog.focus(); });
  }

  function closeModal() {
    if (!modalState.open) return;
    var modal = $('#arch-modal');

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    modalState.open = false;

    document.body.style.overflow = '';

    if (modalState.lastFocus && typeof modalState.lastFocus.focus === 'function') {
      modalState.lastFocus.focus();
    }
    modalState.lastFocus = null;
  }

  function selectTab(index, focus) {
    var tabs = $$('.modal-tab');
    if (!tabs.length) return;

    tabs.forEach(function (tab, tabIndex) {
      var selected = tabIndex === index;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });

    if (focus) tabs[index].focus();
  }

  function initModal() {
    var modal = $('#arch-modal');
    if (!modal) return;

    modal.setAttribute('inert', '');

    modal.addEventListener('click', function (event) {
      if (event.target.closest('[data-close-modal]')) closeModal();
    });

    $$('.modal-tab').forEach(function (tab, index) {
      tab.addEventListener('click', function () { selectTab(index, false); });
      tab.addEventListener('keydown', function (event) {
        var tabs = $$('.modal-tab');
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          var next = event.key === 'ArrowRight'
            ? (index + 1) % tabs.length
            : (index - 1 + tabs.length) % tabs.length;
          selectTab(next, true);
        }
        if (event.key === 'Home') { event.preventDefault(); selectTab(0, true); }
        if (event.key === 'End') { event.preventDefault(); selectTab(tabs.length - 1, true); }
      });
    });
  }

  /* ==========================================================================
     6. POSTURE DRAWER
     ========================================================================== */
  var drawerState = { open: false, lastFocus: null };

  function openDrawer() {
    var drawer = $('#posture-drawer');
    var backdrop = $('#posture-backdrop');
    var trigger = $('#posture-btn');
    if (!drawer || drawerState.open) return;

    drawerState.lastFocus = document.activeElement;
    drawerState.open = true;

    if (window.App && window.App.closeMenu) window.App.closeMenu();

    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    drawer.removeAttribute('inert');
    drawer.setAttribute('aria-hidden', 'false');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(function () {
      var close = $('[data-close-drawer]', drawer);
      if (close) close.focus();
    });
  }

  function closeDrawer() {
    if (!drawerState.open) return;
    var drawer = $('#posture-drawer');
    var backdrop = $('#posture-backdrop');
    var trigger = $('#posture-btn');

    drawerState.open = false;

    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('inert', '');
    drawer.setAttribute('aria-hidden', 'true');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (!modalState.open) document.body.style.overflow = '';

    if (drawerState.lastFocus && typeof drawerState.lastFocus.focus === 'function') {
      drawerState.lastFocus.focus();
    }
    drawerState.lastFocus = null;
  }

  function initDrawer() {
    var trigger = $('#posture-btn');
    var backdrop = $('#posture-backdrop');
    if (trigger) {
      trigger.addEventListener('click', function () {
        if (drawerState.open) closeDrawer();
        else openDrawer();
      });
    }
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
  }

  /* ==========================================================================
     7. CANVAS NETWORK TOPOLOGY
     ========================================================================== */
  function initCanvas() {
    var canvas = $('#net-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var nodes = [];
    var width = 0;
    var height = 0;
    var dpr = 1;
    var raf = null;
    var running = false;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pointer = { x: -9999, y: -9999, active: false };
    var host = canvas.parentElement;

    function buildNodes() {
      var target = Math.round((width * height) / 19000);
      target = Math.max(24, Math.min(68, target));
      nodes = [];

      for (var i = 0; i < target; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          r: 1 + Math.random() * 1.5,
          hub: Math.random() < 0.16
        });
      }
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
      draw(true);
    }

    function draw(staticOnly) {
      ctx.clearRect(0, 0, width, height);

      if (!staticOnly) {
        nodes.forEach(function (node) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x <= 0 || node.x >= width) node.vx *= -1;
          if (node.y <= 0 || node.y >= height) node.vy *= -1;
          node.x = Math.max(0, Math.min(width, node.x));
          node.y = Math.max(0, Math.min(height, node.y));

          if (pointer.active) {
            var dx = node.x - pointer.x;
            var dy = node.y - pointer.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 0.5) {
              var force = (120 - dist) / 120;
              node.x += (dx / dist) * force * 1.5;
              node.y += (dy / dist) * force * 1.5;
            }
          }
        });
      }

      /* edges between nodes */
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i];
          var b = nodes[j];
          var dx2 = a.x - b.x;
          var dy2 = a.y - b.y;
          var distance = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (distance > 148) continue;

          var alpha = (1 - distance / 148) * 0.3;
          ctx.strokeStyle = 'rgba(64, 122, 148, ' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      /* pointer links */
      if (pointer.active) {
        nodes.forEach(function (node) {
          var dx = node.x - pointer.x;
          var dy = node.y - pointer.y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 165) return;

          var alpha = (1 - distance / 165) * 0.65;
          ctx.strokeStyle = 'rgba(0, 240, 255, ' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        });

        var glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 120);
        glow.addColorStop(0, 'rgba(0, 240, 255, 0.09)');
        glow.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 120, 0, Math.PI * 2);
        ctx.fill();
      }

      /* nodes */
      nodes.forEach(function (node) {
        var nearPointer = pointer.active &&
          Math.hypot(node.x - pointer.x, node.y - pointer.y) < 150;

        if (node.hub || nearPointer) {
          ctx.shadowBlur = 9;
          ctx.shadowColor = 'rgba(0, 240, 255, 0.75)';
          ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(136, 164, 190, 0.6)';
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.hub ? node.r + 0.6 : node.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    function loop() {
      if (!running) return;
      draw(false);
      raf = window.requestAnimationFrame(loop);
    }

    function start() {
      if (reduce || running) return;
      if (document.body.getAttribute('data-mode') === 'cli') return;
      if (document.hidden) return;
      running = true;
      raf = window.requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
    }

    function onPointerMove(event) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
    }

    if (host) {
      host.addEventListener('pointermove', onPointerMove, { passive: true });
      host.addEventListener('pointerleave', function () {
        pointer.active = false;
        pointer.x = -9999;
        pointer.y = -9999;
      }, { passive: true });
    }

    window.addEventListener('resize', resize, { passive: true });
    if ('ResizeObserver' in window) {
      var observer = new ResizeObserver(function () { resize(); });
      observer.observe(canvas);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    window.addEventListener('modechange', function (event) {
      if (drawerState.open) closeDrawer();
      if (modalState.open) closeModal();

      if (event.detail.mode === 'cli') stop();
      else { resize(); start(); }
    });

    resize();
    start();
  }

  /* ==========================================================================
     8. NAVIGATION & MODE SWITCH
     ========================================================================== */
  function initNav() {
    var header = $('#site-header');
    var burger = $('#nav-burger');
    var menu = $('#nav-menu');

    function onScroll() {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function closeMenu() {
      if (!menu) return;
      menu.classList.remove('is-open');
      if (burger) {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open navigation menu');
      }
    }

    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = !menu.classList.contains('is-open');
        menu.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      });

      $$('.nav-links a', menu).forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      document.addEventListener('click', function (event) {
        if (window.innerWidth > 1180) return;
        if (!menu.classList.contains('is-open')) return;
        if (event.target.closest('.nav-menu') || event.target.closest('#nav-burger')) return;
        closeMenu();
      });

      window.App.closeMenu = closeMenu;
    }

    /* active section tracking */
    var links = $$('.nav-links a');

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (!window.Terminal || !window.Terminal.isOpen()) return;

        event.preventDefault();
        var selector = link.getAttribute('href');
        window.Terminal.setMode('gui', { focus: false });

        var target = document.querySelector(selector);
        if (target) {
          window.setTimeout(function () {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 60);
        }
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', selector);
        }
      });
    });

    $$('.brand').forEach(function (brand) {
      brand.addEventListener('click', function (event) {
        if (!window.Terminal || !window.Terminal.isOpen()) return;
        event.preventDefault();
        window.Terminal.setMode('gui', { focus: false });
        window.setTimeout(function () {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 60);
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
    });

    var sections = links.map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    }).filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      var visible = new Map();

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        var activeId = null;
        var best = 0;
        visible.forEach(function (ratio, id) {
          if (ratio > best) { best = ratio; activeId = id; }
        });

        links.forEach(function (link) {
          var isActive = link.getAttribute('href') === '#' + activeId;
          if (isActive) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.15, 0.4, 0.75] });

      sections.forEach(function (section) { observer.observe(section); });
    }
  }

  function initModeSwitch() {
    var toggle = $('#mode-toggle');

    if (toggle) {
      toggle.addEventListener('click', function () {
        window.Terminal.toggle();
      });
    }

    $$('[data-open-cli]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.Terminal.open();
      });
    });

    document.addEventListener('keydown', function (event) {
      var target = event.target;
      var typing = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );

      if ((event.ctrlKey || event.metaKey) && (event.key === 'k' || event.key === 'K')) {
        event.preventDefault();
        window.Terminal.toggle();
        return;
      }

      if (event.key === '`' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        window.Terminal.toggle();
      }
    });

    var stored = null;
    try { stored = sessionStorage.getItem('dharun.mode'); } catch (error) { stored = null; }
    if (stored === 'cli') {
      window.Terminal.setMode('cli', { focus: false });
    }

    window.addEventListener('modechange', function () {
      if (window.App && window.App.closeMenu) window.App.closeMenu();
    });
  }

  /* ==========================================================================
     9. CONTACT FORM
     ========================================================================== */
  function initForm() {
    var form = $('#contact-form');
    if (!form) return;

    var fields = {
      name: $('#cf-name'),
      email: $('#cf-email'),
      subject: $('#cf-subject'),
      message: $('#cf-message'),
      company: $('#cf-company')
    };
    var status = $('#form-status');
    var counter = $('#cf-message-count');

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    function setError(field, message) {
      var error = document.getElementById(field.id + '-error');
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        if (error) error.textContent = message;
      } else {
        field.removeAttribute('aria-invalid');
        if (error) error.textContent = '';
      }
    }

    function validate() {
      var errors = [];

      if (fields.name.value.trim().length < 2) {
        setError(fields.name, 'Enter at least 2 characters.');
        errors.push(fields.name);
      } else setError(fields.name, '');

      if (!EMAIL_RE.test(fields.email.value.trim())) {
        setError(fields.email, 'Enter a valid email address.');
        errors.push(fields.email);
      } else setError(fields.email, '');

      var message = fields.message.value.trim();
      if (message.length < 20) {
        setError(fields.message, 'Add at least 20 characters of context.');
        errors.push(fields.message);
      } else if (message.length > 1200) {
        setError(fields.message, 'Keep the message under 1200 characters.');
        errors.push(fields.message);
      } else setError(fields.message, '');

      return errors;
    }

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field) return;
      if (field.id === 'cf-company') return;
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') setError(field, '');
        if (status) status.textContent = '';
      });
    });

    if (fields.message && counter) {
      fields.message.addEventListener('input', function () {
        var length = fields.message.value.length;
        counter.textContent = length + ' / 1200';
        counter.classList.toggle('is-over', length > 1200);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (fields.company && fields.company.value) {
        form.reset();
        if (counter) counter.textContent = '0 / 1200';
        if (status) status.textContent = 'Message received.';
        return;
      }

      var errors = validate();
      if (errors.length) {
        if (status) status.textContent = 'Fix the highlighted fields before transmitting.';
        errors[0].focus();
        toast('Validation failed', 'Check the highlighted fields.', 'err');
        return;
      }

      var name = fields.name.value.trim();
      var email = fields.email.value.trim();
      var subject = fields.subject.value.trim() || 'Security engineering enquiry';
      var message = fields.message.value.trim();

      var body = [
        'Name: ' + name,
        'Email: ' + email,
        '',
        message,
        '',
        '— Sent from dharun.sec portfolio'
      ].join('\n');

      var mailto = 'mailto:' + D.profile.email +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      if (status) {
        status.innerHTML = 'Draft prepared — <a class="link-arrow" href="' + esc(mailto) + '">open your mail client</a>';
      }

      toast('Draft prepared', 'Mail client opening · addressed to ' + D.profile.email, 'ok');

      setTimeout(function () {
        window.location.href = mailto;
      }, 260);
    });
  }

  /* ==========================================================================
     10. GLOBAL INTERACTIONS
     ========================================================================== */
  function initGlobalClicks() {
    document.addEventListener('click', function (event) {
      var archButton = event.target.closest('[data-arch]');
      if (archButton) {
        openArchitecture(archButton.getAttribute('data-arch'));
        return;
      }

      var sandboxButton = event.target.closest('[data-scroll-sandbox]');
      if (sandboxButton) {
        var target = document.getElementById('sandbox-' + sandboxButton.getAttribute('data-scroll-sandbox'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var consoleEl = $('[data-console]', target);
          if (consoleEl) setTimeout(function () { consoleEl.focus({ preventScroll: true }); }, 520);
          toast('Sandbox ready', 'Choose any payload to replay it against the engine.', 'info');
        }
        return;
      }

      var copyTarget = event.target.closest('[data-copy]');
      if (copyTarget) {
        copyTarget.blur();
        copyWithToast(
          copyTarget.getAttribute('data-copy'),
          copyTarget.getAttribute('data-copy-label') || 'Value'
        );
        return;
      }

      if (event.target.closest('[data-close-drawer]')) {
        closeDrawer();
        return;
      }

      if (event.target.closest('[data-close-modal]')) {
        closeModal();
        return;
      }

      if (drawerState.open && !event.target.closest('#posture-drawer') && !event.target.closest('#posture-btn')) {
        closeDrawer();
      }
    });

    document.addEventListener('pointermove', function (event) {
      var button = event.target.closest('.btn');
      if (!button) return;
      var rect = button.getBoundingClientRect();
      button.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
      button.style.setProperty('--my', (event.clientY - rect.top) + 'px');
    }, { passive: true });
  }

  function initKeyboard() {
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;

      if (modalState.open) {
        event.preventDefault();
        closeModal();
        return;
      }

      if (drawerState.open) {
        event.preventDefault();
        closeDrawer();
        return;
      }

      var menu = $('#nav-menu');
      if (menu && menu.classList.contains('is-open') && window.App.closeMenu) {
        window.App.closeMenu();
        var burger = $('#nav-burger');
        if (burger) burger.focus();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;

      var container = null;
      if (modalState.open) container = $('.modal-dialog');
      else if (drawerState.open) container = $('#posture-drawer');
      if (!container) return;

      var focusable = $$('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])', container)
        .filter(function (node) { return node.offsetParent !== null; });

      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function initReveal() {
    var candidates = $$('.sec-head, .about-prose, .id-card, .tl-item, .project, .skill-card, .cert-card, .contact-form, .contact-side');

    candidates.forEach(function (node) {
      if (!node.classList.contains('reveal')) node.classList.add('reveal');
    });

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      candidates.forEach(function (node) { node.classList.add('in'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    candidates.forEach(function (node) { observer.observe(node); });
  }

  function initFooter() {
    var year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ==========================================================================
     11. INIT
     ========================================================================== */
  function init() {
    renderMetrics();
    renderExperience();
    renderProjects();
    renderSkills();
    renderCertifications();
    renderChannels();
    renderSecurityHeaders();

    initSandbox();
    initModal();
    initDrawer();
    initGlobalClicks();
    initNav();
    initKeyboard();
    initForm();
    initFooter();
    initReveal();
    initModeSwitch();
    initCanvas();
  }

  window.App = {
    openArchitecture: openArchitecture,
    closeModal: closeModal,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    toast: toast,
    engine: ENGINE
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
