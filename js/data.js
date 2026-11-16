/* ============================================================================
   DHARUN D — PORTFOLIO DATA LAYER
   Single source of truth for profile, experience, projects, certifications,
   architecture reviews, terminal filesystem and detection sandbox payloads.
   Exposes: window.PortfolioData
   ========================================================================== */

(function () {
  'use strict';

  var profile = {
    name: 'Dharun D',
    handle: 'dharun.sec',
    host: 'dharun@sec-ops',
    title: 'Cybersecurity Engineer',
    focus: 'Threat Analysis, Network Security & Ethical Hacking',
    location: 'Bangalore, Karnataka, India',
    email: 'dharundev.05@gmail.com',
    phone: '+91 6360059004',
    phoneRaw: '+916360059004',
    linkedin: 'linkedin.com/dharun-dev',
    linkedinUrl: 'https://www.linkedin.com/in/dharun-dev',
    education: 'B.Tech CSE (Cybersecurity), Jain University (2022–2026)',
    availability: 'Open to security engineering roles — 2026',
    summary:
      'Cybersecurity engineer focused on threat analysis, network security and defensive ' +
      'engineering. I build detection logic that correlates log evidence into actionable alerts, ' +
      'and design application security controls that hold under real attack pressure.'
  };

  var metrics = [
    {
      label: 'Industry certifications',
      value: '6<em>+</em>',
      hint: 'EC-Council · IBM · Udemy · Google DSC'
    },
    {
      label: 'Security internships',
      value: '02',
      hint: 'The Red Users · Miles Education'
    },
    {
      label: 'EC-Council certified',
      value: 'CEH<em> · </em>CND',
      hint: 'Ethical hacking · network defense'
    },
    {
      label: 'Focus domain',
      value: 'Threat <em>&</em> AppSec',
      hint: 'Detection engineering · RBAC hardening'
    }
  ];

  var experience = [
    {
      type: 'role',
      role: 'Cybersecurity Intern',
      org: 'The Red Users',
      period: 'Feb 2025 — Mar 2025',
      mode: 'Remote',
      bullets: [
        'Executed threat analysis across web and network-facing surfaces, mapping exposures to attacker techniques and business impact.',
        'Performed vulnerability identification and validation, then translated findings into prioritized defensive remediation guidance.',
        'Applied ethical hacking risk mitigation practices in remote, cross-functional teams with documented evidence trails.',
        'Produced defensive security recommendations covering authentication, access control and log coverage gaps.'
      ],
      tags: ['Threat Analysis', 'Vulnerability Identification', 'Ethical Hacking', 'Defensive Strategy', 'Risk Mitigation']
    },
    {
      type: 'role',
      role: 'Cybersecurity Intern',
      org: 'Miles Education',
      period: 'Apr 2024 — May 2024',
      mode: 'Remote',
      bullets: [
        'Applied hands-on threat analysis and operational security practices to real-world vulnerability assessment scenarios.',
        'Reviewed application and infrastructure weaknesses, documenting exposure, likelihood and practical mitigation paths.',
        'Worked through structured security assessment workflows with attention to evidence quality and repeatable testing.'
      ],
      tags: ['Threat Analysis', 'Operational Security', 'Vulnerability Assessment', 'Security Documentation']
    },
    {
      type: 'education',
      role: 'B.Tech — Computer Science & Engineering (Cybersecurity)',
      org: 'Jain University · Bangalore, India',
      period: '2022 — 2026',
      mode: 'Degree',
      bullets: [
        'Specialization in cybersecurity covering network defense, ethical hacking methodology, digital forensics and secure application design.',
        'Coursework aligned with CEH and CND domains: reconnaissance, exploitation, hardening, monitoring and incident response.',
        'Independent builds in detection engineering and RBAC-secured application architecture alongside academic work.'
      ],
      tags: ['Cybersecurity', 'Network Defense', 'Ethical Hacking', 'Digital Forensics', 'Secure Architecture']
    }
  ];

  var projects = [
    {
      id: 'threat-detector',
      index: 'P-01',
      title: 'Cyber Threat Detection System',
      tagline: 'Python · Regex signatures · Sliding-window correlation',
      status: 'OPERATIONAL',
      statusKind: 'ok',
      featured: true,
      summary:
        'A custom log-analysis engine that turns raw web and authentication logs into ranked, ' +
        'actionable alerts. Regex signatures catch SQL injection and XSS payloads, while a sliding ' +
        '60-second window correlates repeated 401 responses into brute-force findings.',
      points: [
        'Parses combined access logs and authentication events into normalized records with timestamp, source IP, request path, status and user-agent.',
        'Rule engine covers SQLi, XSS, path traversal, command injection and recon tooling using anchored, bounded regex patterns.',
        'Sliding-window correlator escalates five or more failed logins from one IP inside 60 seconds to a brute-force alert.',
        'Emits structured JSON alerts with severity score, captured evidence and a recommended action — block, throttle or notify the analyst.'
      ],
      specs: [
        { k: 'Stack', v: 'Python · Regex · Log analysis' },
        { k: 'Detections', v: 'Brute force · SQLi · XSS' },
        { k: 'Correlation', v: '60s sliding window' },
        { k: 'Output', v: 'JSON alerts + severity score' },
        { k: 'Interface', v: 'CLI + live sandbox' }
      ],
      actions: [
        { label: 'Inspect Architecture', kind: 'arch', modal: 'threat-detector' },
        { label: 'Run Sandbox', kind: 'sandbox' }
      ],
      architecture: {
        kicker: '// architecture review · P-01',
        title: 'Cyber Threat Detection System',
        summary:
          'Five-stage pipeline: multi-source ingestion, normalization, signature matching, ' +
          'time-window correlation and structured alert dispatch with evidence capture.',
        caption:
          'Fig 1 — Log Sentinel pipeline. Rules run against both the decoded path and the raw ' +
          'request, so encoded payloads cannot slip past signature matching.',
        flow: [
          'Ingest log sources',
          'Normalize records',
          'Match signatures',
          'Correlate 60s window',
          'Score + dispatch'
        ],
        svg: [
          '<svg viewBox="0 0 900 450" role="img" aria-labelledby="td-diagram-title" xmlns="http://www.w3.org/2000/svg">',
          '  <title id="td-diagram-title">Cyber Threat Detection System architecture: log sources feed an ingestion and normalization stage, a regex rule engine, a 60 second sliding-window correlator, then a severity and dispatch stage connected to an alert bus and an append-only evidence store.</title>',
          '  <defs>',
          '    <marker id="tdArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">',
          '      <path d="M0 0 10 5 0 10z" fill="#3E5169"/>',
          '    </marker>',
          '    <marker id="tdArrowCyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">',
          '      <path d="M0 0 10 5 0 10z" fill="#00F0FF"/>',
          '    </marker>',
          '  </defs>',
          '  <text x="30" y="26" fill="#5C7090" font-family="JetBrains Mono, monospace" font-size="10.5" letter-spacing="2">LOG SENTINEL · DETECTION PIPELINE</text>',
          '  <text x="870" y="26" fill="#3E5169" font-family="JetBrains Mono, monospace" font-size="9.5" text-anchor="end" letter-spacing="1.2">PYTHON 3.11 · v1.2</text>',

          '  <rect x="30" y="48" width="560" height="54" rx="8" fill="#101620" stroke="#263346"/>',
          '  <text x="48" y="72" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="600">01 · LOG SOURCES</text>',
          '  <text x="48" y="89" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="10">nginx access · auth.log · application events</text>',
          '  <rect x="474" y="62" width="98" height="22" rx="4" fill="#0C1118" stroke="#263346"/>',
          '  <text x="523" y="77" fill="#00F0FF" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">TAIL · FOLLOW</text>',

          '  <rect x="30" y="124" width="560" height="54" rx="8" fill="#101620" stroke="#263346"/>',
          '  <text x="48" y="148" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="600">02 · INGEST &amp; NORMALIZE</text>',
          '  <text x="48" y="165" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="10">structured record → ts · ip · path · status · ua · bytes</text>',

          '  <rect x="30" y="200" width="560" height="54" rx="8" fill="#0C1A20" stroke="#00F0FF" stroke-opacity="0.55"/>',
          '  <rect x="30" y="200" width="3" height="54" fill="#00F0FF"/>',
          '  <text x="48" y="224" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="600">03 · REGEX RULE ENGINE</text>',
          '  <text x="48" y="241" fill="#7DD3FC" font-family="JetBrains Mono, monospace" font-size="10">SQLI-001 · XSS-002 · TRAV-003 · CMDI-004 · SCAN-005</text>',

          '  <rect x="30" y="276" width="560" height="54" rx="8" fill="#101620" stroke="#263346"/>',
          '  <text x="48" y="300" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="600">04 · SLIDING WINDOW CORRELATOR</text>',
          '  <text x="48" y="317" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="10">per-IP deques · 60s window · threshold 5 · dedupe</text>',

          '  <rect x="30" y="352" width="560" height="54" rx="8" fill="#0F1B18" stroke="#10B981" stroke-opacity="0.45"/>',
          '  <rect x="30" y="352" width="3" height="54" fill="#10B981"/>',
          '  <text x="48" y="376" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="12.5" font-weight="600">05 · SEVERITY &amp; DISPATCH</text>',
          '  <text x="48" y="393" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="10">score 0–100 → BLOCK · THROTTLE · NOTIFY</text>',

          '  <rect x="630" y="200" width="240" height="54" rx="8" fill="#0C1A20" stroke="#00F0FF" stroke-opacity="0.4"/>',
          '  <text x="648" y="224" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600">ALERT BUS</text>',
          '  <text x="648" y="241" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9.5">JSON → SIEM · Slack · email</text>',

          '  <rect x="630" y="276" width="240" height="54" rx="8" fill="#101620" stroke="#263346"/>',
          '  <text x="648" y="300" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="12" font-weight="600">EVIDENCE STORE</text>',
          '  <text x="648" y="317" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9.5">append-only JSONL · SHA-256</text>',

          '  <path d="M310 102 V118" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#tdArrow)"/>',
          '  <path d="M310 178 V194" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#tdArrow)"/>',
          '  <path d="M310 254 V270" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#tdArrow)"/>',
          '  <path d="M310 330 V346" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#tdArrow)"/>',
          '  <path d="M590 227 H624" fill="none" stroke="#00F0FF" stroke-opacity="0.7" stroke-width="1.4" marker-end="url(#tdArrowCyan)"/>',
          '  <path d="M590 303 H624" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#tdArrow)"/>',
          '  <path d="M750 330 V400 H590 V379" fill="none" stroke="#10B981" stroke-opacity="0.55" stroke-width="1.2" stroke-dasharray="4 4" marker-end="url(#tdArrow)"/>',
          '  <text x="762" y="392" fill="#10B981" font-family="JetBrains Mono, monospace" font-size="9" opacity="0.85">audit trail</text>',
          '</svg>'
        ].join('\n'),
        threatModel: [
          {
            threat: 'Log injection',
            vector: 'Attacker-controlled path or user-agent containing CRLF and terminal escape sequences',
            control: 'Strip control characters, cap field length, treat every log line as untrusted data'
          },
          {
            threat: 'Regex denial of service',
            vector: 'Very long crafted request paths triggering catastrophic backtracking',
            control: 'Anchored patterns, bounded quantifiers, per-line scan budget'
          },
          {
            threat: 'Alert fatigue',
            vector: 'High-volume duplicate 401 flood masking a real intrusion',
            control: 'Per-IP window dedupe, severity scoring, threshold-gated dispatch'
          },
          {
            threat: 'Evidence tampering',
            vector: 'Post-detection modification of alert records',
            control: 'Append-only JSONL store with hash chaining, written before dispatch'
          },
          {
            threat: 'Blind spots',
            vector: 'Log source outage producing silent detection gaps',
            control: 'Ingestion heartbeat and stale-source alarm on the pipeline health check'
          }
        ],
        implementation: [
          'Ingestion — a Python tailer follows nginx and auth logs, emitting one normalized record per line with timestamp, source IP, method, path, status, size and user-agent.',
          'Signature layer — five anchored regex families cover SQL injection, XSS, path traversal, command injection and recon tooling. Both the URL-decoded path and the raw request are tested.',
          'Correlation layer — per-IP deques track authentication failures; five 401 responses inside 60 seconds crosses the brute-force threshold and captures the burst as evidence.',
          'Scoring and dispatch — findings rank 0–100, map to BLOCK / THROTTLE / NOTIFY, and serialize to JSON before any notification leaves the process.',
          'Tuning loop — benign matches are reviewed against the rule set, patterns tightened and thresholds adjusted per endpoint.'
        ],
        snippet: {
          file: 'rules/bruteforce.py',
          lang: 'python',
          code:
            '<span class="c"># 5 failures inside 60s, per source IP</span>\n' +
            'WINDOW = timedelta(seconds=<span class="n">60</span>)\n' +
            'THRESHOLD = <span class="n">5</span>\n\n' +
            'failed = defaultdict(deque)   <span class="c"># ip -&gt; deque[datetime]</span>\n\n' +
            '<span class="k">def</span> correlate(event: LogEvent) -&gt; list[Finding]:\n' +
            '    <span class="k">if</span> event.status != <span class="n">401</span>:\n' +
            '        <span class="k">return</span> []\n\n' +
            '    bucket = failed[event.src_ip]\n' +
            '    bucket.append(event.ts)\n\n' +
            '    <span class="k">while</span> bucket <span class="k">and</span> event.ts - bucket[<span class="n">0</span>] &gt; WINDOW:\n' +
            '        bucket.popleft()\n\n' +
            '    <span class="k">if</span> len(bucket) == THRESHOLD:\n' +
            '        <span class="k">return</span> [Finding(\n' +
            '            rule=<span class="s">"BRUTE-006"</span>,\n' +
            '            severity=<span class="s">"high"</span>,\n' +
            '            score=<span class="n">82</span>,\n' +
            '            evidence={<span class="s">"failed_auth"</span>: len(bucket)},\n' +
            '        )]\n' +
            '    <span class="k">return</span> []'
        }
      }
    },
    {
      id: 'medlock',
      index: 'P-02',
      title: 'MedLock — Secure Online Medical Management System',
      tagline: 'MySQL · RBAC · SQLi prevention · Hardened auth',
      status: 'HARDENED',
      statusKind: 'ok',
      featured: false,
      summary:
        'A role-based healthcare portal where patients manage appointments and prescriptions while ' +
        'doctors control clinical records and inventory. Security is structural: authorization is ' +
        'enforced server-side, every query is parameterized, and record ownership is re-checked at ' +
        'the data layer.',
      points: [
        'Architected separate patient, doctor and admin capability sets with a single RBAC guard in front of every controller.',
        'Designed appointment, medical record, prescription and inventory modules with ownership-scoped reads and writes.',
        'Hardened authentication with password hashing, rate limiting, session rotation and generic failure responses.',
        'Eliminated dynamic SQL in favour of prepared statements and a least-privilege MySQL account, with an immutable access audit trail.'
      ],
      specs: [
        { k: 'Stack', v: 'MySQL · Web security · RBAC' },
        { k: 'Roles', v: 'Patient · Doctor · Admin' },
        { k: 'Modules', v: 'Records · Rx · Inventory' },
        { k: 'Isolation', v: 'Ownership checks' },
        { k: 'Audit', v: 'Append-only access log' }
      ],
      actions: [
        { label: 'Inspect Architecture', kind: 'arch', modal: 'medlock' }
      ],
      architecture: {
        kicker: '// architecture review · P-02',
        title: 'MedLock — Secure Medical Management',
        summary:
          'Layered request path with two hard boundaries: authentication before any business logic, ' +
          'and an RBAC plus ownership guard before any record access.',
        caption:
          'Fig 2 — MedLock request path. Authorization is enforced server-side on every request; a ' +
          'role check alone is never sufficient for record-level access.',
        flow: [
          'TLS edge',
          'Authenticate',
          'Authorize + own',
          'Scoped controller',
          'Parameterized query',
          'Audit'
        ],
        svg: [
          '<svg viewBox="0 0 900 520" role="img" aria-labelledby="ml-diagram-title" xmlns="http://www.w3.org/2000/svg">',
          '  <title id="ml-diagram-title">MedLock architecture: patient and doctor portals connect over a TLS edge to an authentication service, then an RBAC guard with record ownership checks, then role-scoped controllers for appointments, records, prescriptions and inventory, then a parameterized least-privilege MySQL data layer. Unauthorized requests branch to a 403 deny path, and every controller action writes to an append-only audit trail.</title>',
          '  <defs>',
          '    <marker id="mlArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">',
          '      <path d="M0 0 10 5 0 10z" fill="#3E5169"/>',
          '    </marker>',
          '    <marker id="mlArrowRose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">',
          '      <path d="M0 0 10 5 0 10z" fill="#F43F5E"/>',
          '    </marker>',
          '    <marker id="mlArrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">',
          '      <path d="M0 0 10 5 0 10z" fill="#10B981"/>',
          '    </marker>',
          '  </defs>',
          '  <text x="30" y="24" fill="#5C7090" font-family="JetBrains Mono, monospace" font-size="10.5" letter-spacing="2">MEDLOCK · TRUST BOUNDARIES</text>',
          '  <text x="870" y="24" fill="#3E5169" font-family="JetBrains Mono, monospace" font-size="9.5" text-anchor="end" letter-spacing="1.2">RBAC · MYSQL · v1.0</text>',

          '  <rect x="30" y="40" width="180" height="52" rx="8" fill="#101620" stroke="#263346"/>',
          '  <text x="120" y="61" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="600" text-anchor="middle">PATIENT PORTAL</text>',
          '  <text x="120" y="78" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">appointments · records</text>',

          '  <rect x="230" y="40" width="180" height="52" rx="8" fill="#101620" stroke="#263346"/>',
          '  <text x="320" y="61" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="600" text-anchor="middle">DOCTOR PORTAL</text>',
          '  <text x="320" y="78" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">records · Rx · inventory</text>',

          '  <rect x="30" y="118" width="380" height="52" rx="8" fill="#0C1A20" stroke="#00F0FF" stroke-opacity="0.5"/>',
          '  <text x="220" y="139" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="600" text-anchor="middle">TLS EDGE · HSTS · RATE LIMIT</text>',
          '  <text x="220" y="156" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">TLS 1.3 · secure cookies · CSP</text>',

          '  <rect x="30" y="196" width="380" height="58" rx="8" fill="#101620" stroke="#263346"/>',
          '  <text x="220" y="218" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="600" text-anchor="middle">AUTH SERVICE</text>',
          '  <text x="220" y="235" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">Argon2id · HttpOnly session · rotation</text>',

          '  <rect x="30" y="274" width="380" height="58" rx="8" fill="#101620" stroke="#263346"/>',
          '  <text x="220" y="296" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="600" text-anchor="middle">RBAC GUARD · OWNERSHIP</text>',
          '  <text x="220" y="313" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">role + resource owner + action</text>',

          '  <rect x="30" y="352" width="380" height="76" rx="8" fill="#101620" stroke="#263346"/>',
          '  <text x="48" y="372" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600">ROLE-SCOPED CONTROLLERS</text>',
          '  <rect x="42" y="384" width="82" height="24" rx="4" fill="#0C1118" stroke="#263346"/>',
          '  <text x="83" y="400" fill="#A2B0C4" font-family="JetBrains Mono, monospace" font-size="8.5" text-anchor="middle">APPOINTMENTS</text>',
          '  <rect x="130" y="384" width="82" height="24" rx="4" fill="#0C1118" stroke="#263346"/>',
          '  <text x="171" y="400" fill="#A2B0C4" font-family="JetBrains Mono, monospace" font-size="8.5" text-anchor="middle">RECORDS</text>',
          '  <rect x="218" y="384" width="88" height="24" rx="4" fill="#0C1118" stroke="#263346"/>',
          '  <text x="262" y="400" fill="#A2B0C4" font-family="JetBrains Mono, monospace" font-size="8.5" text-anchor="middle">PRESCRIPTIONS</text>',
          '  <rect x="312" y="384" width="82" height="24" rx="4" fill="#0C1118" stroke="#263346"/>',
          '  <text x="353" y="400" fill="#A2B0C4" font-family="JetBrains Mono, monospace" font-size="8.5" text-anchor="middle">INVENTORY</text>',

          '  <rect x="30" y="452" width="380" height="54" rx="8" fill="#0F1B18" stroke="#10B981" stroke-opacity="0.45"/>',
          '  <text x="48" y="476" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="11.5" font-weight="600">DATA LAYER · MySQL</text>',
          '  <text x="48" y="492" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9">prepared statements · least-privilege role · no dynamic SQL</text>',

          '  <rect x="500" y="118" width="370" height="60" rx="8" fill="#0D1119" stroke="#263346" stroke-dasharray="4 4"/>',
          '  <text x="516" y="139" fill="#7DD3FC" font-family="JetBrains Mono, monospace" font-size="9.5" letter-spacing="1">DEFENSE CONTROLS</text>',
          '  <text x="516" y="156" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9">Argon2id · HttpOnly/SameSite · CSP · least privilege</text>',
          '  <text x="516" y="169" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9">server-side ownership · generic auth errors</text>',

          '  <rect x="500" y="274" width="180" height="58" rx="8" fill="#1A1015" stroke="#F43F5E" stroke-opacity="0.5" stroke-dasharray="4 3"/>',
          '  <text x="590" y="296" fill="#FB7185" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" text-anchor="middle">403 · DENY</text>',
          '  <text x="590" y="313" fill="#9A6A76" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">role or owner mismatch</text>',

          '  <rect x="710" y="274" width="160" height="58" rx="8" fill="#101620" stroke="#10B981" stroke-opacity="0.4"/>',
          '  <text x="790" y="296" fill="#E7EEF8" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" text-anchor="middle">AUDIT TRAIL</text>',
          '  <text x="790" y="313" fill="#7E92AB" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">append-only access log</text>',

          '  <path d="M120 92 L188 112" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#mlArrow)"/>',
          '  <path d="M320 92 L252 112" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#mlArrow)"/>',
          '  <path d="M220 170 V190" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#mlArrow)"/>',
          '  <path d="M220 254 V268" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#mlArrow)"/>',
          '  <path d="M220 332 V346" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#mlArrow)"/>',
          '  <path d="M220 428 V446" fill="none" stroke="#3E5169" stroke-width="1.4" marker-end="url(#mlArrow)"/>',
          '  <path d="M410 303 H494" fill="none" stroke="#F43F5E" stroke-opacity="0.75" stroke-width="1.4" marker-end="url(#mlArrowRose)"/>',
          '  <path d="M410 303 H450 V260 H700 V268" fill="none" stroke="#10B981" stroke-opacity="0.6" stroke-width="1.2" stroke-dasharray="3 4" marker-end="url(#mlArrowGreen)"/>',
          '  <text x="470" y="252" fill="#10B981" font-family="JetBrains Mono, monospace" font-size="8.5">every action</text>',
          '</svg>'
        ].join('\n'),
        threatModel: [
          {
            threat: 'SQL injection',
            vector: 'Unsanitized search and filter fields on records and inventory',
            control: 'Prepared statements everywhere, no string-concatenated SQL, least-privilege DB account'
          },
          {
            threat: 'Horizontal privilege escalation',
            vector: 'Patient or doctor identifiers swapped in the request (IDOR)',
            control: 'Ownership assertion inside the RBAC guard, re-checked against the session on every read'
          },
          {
            threat: 'Session hijacking',
            vector: 'Stolen or replayed session cookie',
            control: 'HttpOnly + Secure + SameSite cookies, rotation on privilege change, idle timeout'
          },
          {
            threat: 'Credential stuffing',
            vector: 'Reused passwords sprayed against the login endpoint',
            control: 'Argon2id hashing, per-IP rate limiting, lockout and generic failure messaging'
          },
          {
            threat: 'Over-broad disclosure',
            vector: 'Query returning other patients\' records',
            control: 'Role-scoped projections, tenant/owner filters in SQL, immutable access audit'
          }
        ],
        implementation: [
          'Role model — patient, doctor and admin capability sets defined explicitly, with no implicit inheritance beyond the admin override.',
          'Authentication — Argon2id password hashing, per-IP rate limiting, generic failure responses and session rotation whenever role context changes.',
          'Authorization — one RBAC guard resolves role, resource owner and action before any controller executes; ownership is re-asserted at query time.',
          'Data access — parameterized statements only, a least-privilege MySQL account, and projections limited to fields the role is allowed to see.',
          'Auditability — every record read or write appends to an immutable access log keyed by actor, patient, resource and timestamp.'
        ],
        snippet: {
          file: 'db/queries.sql',
          lang: 'sql',
          code:
            '<span class="c">-- parameterized write; values bound, never interpolated</span>\n' +
            '<span class="k">INSERT INTO</span> prescriptions (patient_id, doctor_id, drug, dose)\n' +
            '<span class="k">VALUES</span> (?, ?, ?, ?);\n\n' +
            '<span class="c">-- role-scoped read: patient id comes from the session, not the request</span>\n' +
            '<span class="k">SELECT</span> a.id, a.slot, d.full_name\n' +
            '<span class="k">FROM</span> appointments a\n' +
            '<span class="k">JOIN</span> doctors d <span class="k">ON</span> d.id = a.doctor_id\n' +
            '<span class="k">WHERE</span> a.patient_id = ?      <span class="c">-- bound from session</span>\n' +
            '  <span class="k">AND</span> a.clinic_id = ?;      <span class="c">-- tenant boundary</span>'
        }
      }
    }
  ];

  var skills = [
    {
      title: 'Offensive Security & Ethical Hacking',
      desc: 'Adversary-minded testing used to validate defensive controls, not as an end in itself.',
      tags: ['Ethical hacking methodology', 'Vulnerability assessment', 'OWASP Top 10', 'Exploitation & risk mitigation', 'Web attack patterns']
    },
    {
      title: 'Threat Intelligence & Incident Response',
      desc: 'Turning raw telemetry into ranked, investigable findings with defensible evidence.',
      tags: ['Threat intelligence', 'Detection engineering', 'Log analysis & regex signatures', 'Incident triage', 'Risk analysis']
    },
    {
      title: 'Network & Linux Security',
      desc: 'Perimeter and host hardening grounded in network fundamentals and Linux internals.',
      tags: ['TCP/IP & network security', 'Linux administration', 'Host hardening', 'Access control', 'CND frameworks']
    },
    {
      title: 'Secure Database & AppSec',
      desc: 'Building applications whose authorization and data access hold up under abuse.',
      tags: ['Python', 'SQL & MongoDB', 'Parameterized queries', 'RBAC design', 'Auth & session hardening']
    }
  ];

  var certifications = [
    {
      initials: 'CEH',
      name: 'Certified Ethical Hacker',
      issuer: 'EC-Council',
      track: 'Offensive security'
    },
    {
      initials: 'CND',
      name: 'Certified Network Defender',
      issuer: 'EC-Council',
      track: 'Network defense'
    },
    {
      initials: 'DF',
      name: 'Digital Forensics',
      issuer: 'EC-Council',
      track: 'Forensics'
    },
    {
      initials: 'AP',
      name: 'Application Security',
      issuer: 'Udemy',
      track: 'AppSec'
    },
    {
      initials: 'TI',
      name: 'Getting Started with Threat Intelligence & Hunting',
      issuer: 'IBM SkillsBuild India',
      track: 'Threat intel'
    },
    {
      initials: 'AI',
      name: 'Generative AI Study Jams',
      issuer: 'Google Developer Student Clubs (FET JU)',
      track: 'Emerging tech'
    }
  ];

  var channels = [
    {
      id: 'email',
      label: 'Email',
      value: profile.email,
      copy: profile.email,
      icon: '@',
      action: 'COPY'
    },
    {
      id: 'phone',
      label: 'Phone',
      value: profile.phone,
      copy: profile.phoneRaw,
      icon: 'TEL',
      action: 'COPY'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      value: profile.linkedin,
      copy: profile.linkedinUrl,
      href: profile.linkedinUrl,
      icon: 'in',
      action: 'COPY'
    }
  ];

  var securityHeaders = [
    {
      name: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
      status: 'pass'
    },
    {
      name: 'Content-Security-Policy',
      value:
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; " +
        "frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      status: 'pass'
    },
    {
      name: 'X-Content-Type-Options',
      value: 'nosniff',
      status: 'pass'
    },
    {
      name: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
      status: 'pass'
    },
    {
      name: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=()',
      status: 'pass'
    },
    {
      name: 'Cross-Origin-Opener-Policy',
      value: 'same-origin',
      status: 'pass'
    },
    {
      name: 'X-Frame-Options',
      value: 'DENY',
      status: 'pass'
    },
    {
      name: 'X-XSS-Protection',
      value: '0 (legacy header disabled — CSP is authoritative)',
      status: 'warn'
    }
  ];

  /* --------------------------------------------------------------------------
     Detection engine vocabulary
     ------------------------------------------------------------------------ */
  var detection = {
    windowMs: 60000,
    bruteThreshold: 5,
    rules: [
      {
        id: 'SQLI-001',
        label: 'SQL Injection',
        severity: 'critical',
        score: 92,
        re: /(?:'|%27|")\s*(?:or|and)\s+(?:'?\d+'?|true)\s*=\s*(?:'?\d+'?|true)|union(?:\s|\+)+(?:all(?:\s|\+)+)?select|information_schema|sleep\s*\(|benchmark\s*\(|;\s*(?:drop|truncate)\s+/i
      },
      {
        id: 'XSS-002',
        label: 'Cross-Site Scripting',
        severity: 'high',
        score: 78,
        re: /<script\b|%3cscript|javascript:|on(?:error|load|mouseover|focus)\s*=|alert\s*\(|document\.cookie/i
      },
      {
        id: 'TRAV-003',
        label: 'Path Traversal',
        severity: 'high',
        score: 74,
        re: /(?:\.\.\/|\.\.\\|%2e%2e(?:%2f|%5c|\/))/i
      },
      {
        id: 'CMDI-004',
        label: 'Command Injection',
        severity: 'critical',
        score: 90,
        re: /[;|`]\s*(?:cat|ls|whoami|id|curl|wget|nc|bash|sh|ping)\b|\$\(\s*(?:cat|id|whoami)/i
      },
      {
        id: 'SCAN-005',
        label: 'Recon Tooling',
        severity: 'medium',
        score: 55,
        target: 'ua',
        re: /(?:sqlmap|nikto|nmap|masscan|dirbuster|gobuster|acunetix|nessus)/i
      }
    ],
    brute: {
      id: 'BRUTE-006',
      label: 'Brute Force Authentication',
      severity: 'high',
      score: 82
    }
  };

  /* --------------------------------------------------------------------------
     Sandbox payloads
     ------------------------------------------------------------------------ */
  var sandbox = {
    description:
      'Select a payload to replay it against the browser-side detection engine: the same rule ' +
      'families and sliding-window threshold used by the Python prototype.',
    samples: [
      {
        id: 'sqli',
        label: 'SQL injection',
        code: "GET /product?id=1' OR 1=1 --",
        sev: 'critical',
        note: 'Auth-bypass predicate in a query parameter, scanner user-agent',
        events: [
          {
            ip: '45.22.19.7',
            method: 'GET',
            path: '/product?id=1%27%20OR%201%3D1--',
            status: 200,
            bytes: 512,
            ua: 'sqlmap/1.7.2',
            offsetMs: -9000
          }
        ]
      },
      {
        id: 'xss',
        label: 'Reflected XSS',
        code: 'GET /search?q=<script>alert(1)</script>',
        sev: 'high',
        note: 'Script tag in the search query, returned in the response body',
        events: [
          {
            ip: '103.44.81.19',
            method: 'GET',
            path: '/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E',
            status: 200,
            bytes: 1840,
            ua: 'Mozilla/5.0 (X11; Linux x86_64)',
            offsetMs: -7000
          }
        ]
      },
      {
        id: 'brute',
        label: 'Brute force burst',
        code: '5 × 401 Unauthorized /login · 60s window',
        sev: 'high',
        note: 'Five failed logins from one IP inside the correlation window',
        events: [
          { ip: '185.220.101.4', method: 'POST', path: '/login', status: 401, bytes: 221, ua: 'python-requests/2.31', offsetMs: -20000 },
          { ip: '185.220.101.4', method: 'POST', path: '/login', status: 401, bytes: 221, ua: 'python-requests/2.31', offsetMs: -16000 },
          { ip: '185.220.101.4', method: 'POST', path: '/login', status: 401, bytes: 221, ua: 'python-requests/2.31', offsetMs: -12000 },
          { ip: '185.220.101.4', method: 'POST', path: '/login', status: 401, bytes: 221, ua: 'python-requests/2.31', offsetMs: -8000 },
          { ip: '185.220.101.4', method: 'POST', path: '/login', status: 401, bytes: 221, ua: 'python-requests/2.31', offsetMs: -4000 }
        ]
      },
      {
        id: 'traversal',
        label: 'Path traversal',
        code: 'GET /download?file=../../etc/passwd',
        sev: 'high',
        note: 'Directory escape targeting a sensitive system file',
        events: [
          {
            ip: '91.240.118.22',
            method: 'GET',
            path: '/download?file=..%2F..%2F..%2Fetc%2Fpasswd',
            status: 403,
            bytes: 164,
            ua: 'Mozilla/5.0 (Windows NT 10.0)',
            offsetMs: -6000
          }
        ]
      },
      {
        id: 'cmdi',
        label: 'Command injection',
        code: 'GET /ping?host=127.0.0.1;cat /etc/passwd',
        sev: 'critical',
        note: 'Shell metacharacter chaining into a diagnostic endpoint',
        events: [
          {
            ip: '62.75.187.9',
            method: 'GET',
            path: '/ping?host=127.0.0.1;cat%20/etc/passwd',
            status: 500,
            bytes: 780,
            ua: 'curl/8.4.0',
            offsetMs: -5000
          }
        ]
      },
      {
        id: 'clean',
        label: 'Benign baseline',
        code: 'GET /dashboard · 200 OK',
        sev: 'clean',
        note: 'Control sample — must produce zero findings',
        events: [
          {
            ip: '10.24.8.51',
            method: 'GET',
            path: '/dashboard',
            status: 200,
            bytes: 4820,
            ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            offsetMs: -3000
          }
        ]
      }
    ]
  };

  /* --------------------------------------------------------------------------
     Terminal filesystem
     ------------------------------------------------------------------------ */
  var terminal = {
    host: 'dharun@sec-ops',
    banner: [
      '  ┌─────────────────────────────────────────────────┐',
      '  │  D H A R U N   D   ·   S E C - O P S             │',
      '  │  threat analysis · network security · appsec     │',
      '  │  B.Tech CSE (Cybersecurity) · CEH · CND          │',
      '  └─────────────────────────────────────────────────┘'
    ],
    dirs: {
      '/': ['projects/', 'notes/', 'README.md', 'certifications.txt', 'contact.txt', 'resume.txt'],
      '/projects': ['threat-detector', 'medlock'],
      '/notes': ['hardening.md']
    },
    files: {
      'README.md': [
        '# dharun.sec — operator profile',
        '',
        'Name        Dharun D',
        'Role        Cybersecurity Engineer',
        'Focus       Threat analysis, network security, ethical hacking',
        'Location    Bangalore, Karnataka, India',
        'Education   B.Tech CSE (Cybersecurity), Jain University, 2022–2026',
        'Status      Open to security engineering roles — 2026',
        '',
        'Type "whoami" for the summary, "ls /projects" for the',
        'engineering work, or "simulate --log-scan" to see the',
        'detection engine run against a live log stream.'
      ],
      'certifications.txt': [
        '# Verified certifications',
        '',
        'EC-Council    Certified Ethical Hacker (CEH)',
        'EC-Council    Certified Network Defender (CND)',
        'EC-Council    Digital Forensics',
        'Udemy         Application Security',
        'IBM SkillsBuild India',
        '              Getting Started with Threat Intelligence and Hunting',
        'Google DSC    Generative AI Study Jams (FET JU)'
      ],
      'contact.txt': [
        '# Direct channels',
        '',
        'Email       dharundev.05@gmail.com',
        'Phone       +91 6360059004',
        'LinkedIn    linkedin.com/dharun-dev',
        'Location    Bangalore, Karnataka, India (IST, UTC+5:30)',
        '',
        'Response window: under 24 hours.'
      ],
      'resume.txt': [
        '# Dharun D — Cybersecurity Engineer',
        '',
        'EXPERIENCE',
        '  The Red Users — Cybersecurity Intern      Feb 2025 – Mar 2025',
        '    Threat analysis, vulnerability identification, defensive',
        '    security strategy, ethical hacking risk mitigation.',
        '  Miles Education — Cybersecurity Intern    Apr 2024 – May 2024',
        '    Hands-on threat analysis and operational security practice',
        '    applied to real-world vulnerability assessment scenarios.',
        '',
        'EDUCATION',
        '  Jain University — B.Tech CSE (Cybersecurity)  2022 – 2026',
        '',
        'PROJECTS',
        '  Cyber Threat Detection System — Python log-analysis engine',
        '  MedLock — RBAC-secured medical management system',
        '',
        'STACK',
        '  Python · Linux · Networking · SQL & MongoDB · Threat',
        '  intelligence · Incident response · Risk analysis'
      ],
      'notes/hardening.md': [
        '# Operator notes — hardening checklist',
        '',
        '[x] TLS 1.3 only, HSTS preload, no mixed content',
        '[x] CSP default-src self, frame-ancestors none',
        '[x] Passwords hashed with Argon2id, never logged',
        '[x] Parameterized queries only — no dynamic SQL',
        '[x] RBAC guard before controllers, ownership re-checked',
        '[x] 401 bursts correlated over a 60s window',
        '[ ] Per-endpoint alert thresholds (in progress)',
        '',
        'Security is a property of the system, not a feature flag.'
      ],
      'projects/threat-detector': [
        '# Cyber Threat Detection System',
        '',
        'Stack       Python · Regex · Log analysis',
        'Detects     Brute force · SQL injection · XSS · traversal',
        'Correlation 60-second sliding window, per-IP threshold of 5',
        'Output      JSON alerts with severity score and evidence',
        '',
        'Pipeline',
        '  01  Ingest nginx access logs and auth logs',
        '  02  Normalize every line into a structured record',
        '  03  Match five anchored rule families',
        '  04  Correlate failures inside the time window',
        '  05  Score, then dispatch or block',
        '',
        'Run "simulate --log-scan" to watch it detect a live stream.'
      ],
      'projects/medlock': [
        '# MedLock — Secure Online Medical Management System',
        '',
        'Stack       MySQL · Web security · RBAC',
        'Roles       Patient · Doctor · Admin',
        'Modules     Appointments · Medical records · Prescriptions',
        '            Inventory',
        '',
        'Security boundaries',
        '  - RBAC guard with record ownership enforced server-side',
        '  - Prepared statements only, least-privilege database role',
        '  - Argon2id hashing, session rotation, rate-limited login',
        '  - Immutable access audit for every read and write',
        '',
        'Architecture review available from the GUI project card.'
      ]
    }
  };

  /* Ordered event stream used by `simulate --log-scan` */
  var simulate = [
    { ip: '10.24.8.51', method: 'GET', path: '/', status: 200, bytes: 4820, ua: 'Mozilla/5.0 (Windows NT 10.0)' },
    { ip: '10.24.8.51', method: 'GET', path: '/assets/app.css', status: 200, bytes: 9120, ua: 'Mozilla/5.0 (Windows NT 10.0)' },
    { ip: '10.24.8.51', method: 'GET', path: '/appointments', status: 200, bytes: 6340, ua: 'Mozilla/5.0 (Windows NT 10.0)' },
    { ip: '185.220.101.4', method: 'POST', path: '/login', status: 401, bytes: 221, ua: 'python-requests/2.31' },
    { ip: '185.220.101.4', method: 'POST', path: '/login', status: 401, bytes: 221, ua: 'python-requests/2.31' },
    { ip: '185.220.101.4', method: 'POST', path: '/login', status: 401, bytes: 221, ua: 'python-requests/2.31' },
    { ip: '185.220.101.4', method: 'POST', path: '/login', status: 401, bytes: 221, ua: 'python-requests/2.31' },
    { ip: '185.220.101.4', method: 'POST', path: '/login', status: 401, bytes: 221, ua: 'python-requests/2.31' },
    { ip: '45.22.19.7', method: 'GET', path: '/product?id=1%27%20OR%201%3D1--', status: 200, bytes: 512, ua: 'sqlmap/1.7.2' },
    { ip: '103.44.81.19', method: 'GET', path: '/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E', status: 200, bytes: 1840, ua: 'Mozilla/5.0 (X11; Linux x86_64)' },
    { ip: '91.240.118.22', method: 'GET', path: '/download?file=..%2F..%2F..%2Fetc%2Fpasswd', status: 403, bytes: 164, ua: 'Mozilla/5.0 (Windows NT 10.0)' },
    { ip: '10.24.8.51', method: 'GET', path: '/dashboard', status: 200, bytes: 5200, ua: 'Mozilla/5.0 (Windows NT 10.0)' }
  ];

  window.PortfolioData = {
    profile: profile,
    metrics: metrics,
    experience: experience,
    projects: projects,
    skills: skills,
    certifications: certifications,
    channels: channels,
    securityHeaders: securityHeaders,
    detection: detection,
    sandbox: sandbox,
    terminal: terminal,
    simulate: simulate
  };
})();
