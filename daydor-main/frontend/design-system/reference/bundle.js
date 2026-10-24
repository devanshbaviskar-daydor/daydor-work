/* @ds-bundle: {"format":4,"namespace":"Daydor","components":[{"name":"Message"},{"name":"Composer"},{"name":"Thinking"},{"name":"Receipt"},{"name":"DecisionCard"},{"name":"RunRow"},{"name":"Brief"},{"name":"Sidebar"},{"name":"CommandBar"},{"name":"TabBar"},{"name":"Banner"},{"name":"Callout"},{"name":"EmptyState"},{"name":"PageHeader"},{"name":"Tabs"},{"name":"Stepper"},{"name":"StatRow"},{"name":"ObligationRow"},{"name":"Timeline"},{"name":"FactList"},{"name":"DocumentPage"},{"name":"Payslip"},{"name":"StageBoard"},{"name":"CandidateCard"},{"name":"VerifyCode"},{"name":"ReceiptReview"},{"name":"AttendanceGrid"},{"name":"ChoiceCard"},{"name":"ProfileField"},{"name":"Avatar"},{"name":"WriteClass"},{"name":"Deadline"},{"name":"SourceChip"},{"name":"Badge"},{"name":"Amount"},{"name":"Button"},{"name":"Input"},{"name":"Select"},{"name":"Table"},{"name":"Dialog"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(' ');
  }
  function omit(obj, keys) {
    var r = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) < 0) r[k] = obj[k];
    return r;
  }
  var uid = 0;
  function useId(given) {
    var ref = React.useRef(null);
    if (ref.current === null) ref.current = given || ('dd-' + (++uid));
    return ref.current;
  }

  /* ---------- Icon: paths copied from Lucide (ISC licence), 24px grid, round caps ----------
     'C cx cy r' = circle, 'R x y w h rx' = rect, anything else = path d. */
  var ICONS = {
    check: ['M20 6 9 17l-5-5'],
    clock: ['C12 12 10', 'M12 6v6l4 2'],
    x: ['M18 6 6 18', 'm6 6 12 12'],
    alert: ['C12 12 10', 'M12 8v4', 'M12 16h.01'],
    info: ['C12 12 10', 'M12 16v-4', 'M12 8h.01'],
    refresh: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
    dot: ['C12 12 4'],
    chevronDown: ['m6 9 6 6 6-6'],
    chevronRight: ['m9 18 6-6-6-6'],
    loader: ['M21 12a9 9 0 1 1-6.219-8.56'],
    arrowUp: ['m5 12 7-7 7 7', 'M12 19V5'],
    paperclip: ['m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48'],
    lock: ['R 3 11 18 11 2', 'M7 11V7a5 5 0 0 1 10 0v4'],
    eye: ['M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0', 'C12 12 3'],
    shield: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'],
    file: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M16 13H8', 'M16 17H8', 'M10 9H8'],
    scale: ['m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z', 'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z', 'M7 21h10', 'M12 3v18', 'M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2'],
    database: ['M3 5a9 3 0 1 0 18 0a9 3 0 1 0-18 0', 'M3 5v14a9 3 0 0 0 18 0V5', 'M3 12a9 3 0 0 0 18 0'],
    calendar: ['M8 2v4', 'M16 2v4', 'R 3 4 18 18 2', 'M3 10h18'],
    undo: ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11'],
    userPlus: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'C9 7 4', 'M19 8v6', 'M22 11h-6'],
    home: ['M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8', 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
    users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'C9 7 4', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
    rupee: ['M6 3h12', 'M6 8h12', 'm6 13 8.5 8', 'M6 13h3', 'M9 13c6.667 0 6.667-10 0-10'],
    landmark: ['M10 18v-7', 'M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z', 'M14 18v-7', 'M18 18v-7', 'M3 22h18', 'M6 18v-7'],
    folder: ['M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'],
    settings: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'C12 12 3'],
    search: ['C11 11 8', 'm21 21-4.3-4.3'],
    message: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
    more: ['C12 12 1', 'C19 12 1', 'C5 12 1'],
    pause: ['C12 12 10', 'M10 15V9', 'M14 15V9'],
    enter: ['M20 4v7a4 4 0 0 1-4 4H4', 'm9 10-5 5 5 5'],
    inbox: ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'],
    merge: ['C18 18 3', 'C6 6 3', 'M6 21V9a9 9 0 0 0 9 9'],
    camera: ['M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z', 'C12 13 3'],
    receipt: ['M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z', 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8', 'M12 17.5v-11'],
    briefcase: ['M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', 'R 2 6 20 14 2'],
    heart: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'],
    pencil: ['M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z', 'm15 5 4 4'],
    sparkle: ['M12 3v3', 'M12 18v3', 'M3 12h3', 'M18 12h3'],
    user: ['C12 8 5', 'M20 21a8 8 0 0 0-16 0'],
    smartphone: ['R 5 2 14 20 2', 'M12 18h.01']
  };
  function Icon(props) {
    var size = props.size || 16;
    var parts = (ICONS[props.name] || []).map(function (d, i) {
      var n = d.slice(1).trim().split(' ');
      if (d.charAt(0) === 'C') return h('circle', { key: i, cx: n[0], cy: n[1], r: n[2] });
      if (d.charAt(0) === 'R') return h('rect', { key: i, x: n[0], y: n[1], width: n[2], height: n[3], rx: n[4] });
      return h('path', { key: i, d: d });
    });
    return h('svg', {
      className: cx('dd-icon', props.className), width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: props.strokeWidth || 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true'
    }, parts);
  }

  /* =====================================================================
     PRIMITIVES
     ===================================================================== */

  function Button(props) {
    var variant = props.variant || 'secondary';
    var size = props.size || 'md';
    var rest = omit(props, ['variant', 'size', 'loading', 'icon', 'iconRight', 'className', 'children', 'fullWidth']);
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('dd-btn', 'dd-btn-' + variant, 'dd-btn-' + size, props.fullWidth && 'dd-btn-full', props.className),
      disabled: props.disabled || props.loading,
      'aria-busy': props.loading ? 'true' : undefined
    }),
      props.loading ? h(Icon, { name: 'loader', className: 'dd-spin' }) : (props.icon ? h(Icon, { name: props.icon }) : null),
      props.children,
      props.iconRight ? h(Icon, { name: props.iconRight }) : null);
  }

  function Field(p, control) {
    var hintId = p.id + '-hint';
    var msg = p.error || p.hint;
    return h('div', { className: cx('dd-field', p.error && 'dd-field-error', p.className) },
      p.label ? h('label', { className: 'dd-label', htmlFor: p.id }, p.label,
        p.optional ? h('span', { className: 'dd-optional' }, ' (optional)') : null) : null,
      control(msg ? hintId : undefined),
      msg ? h('p', { id: hintId, className: p.error ? 'dd-error' : 'dd-hint' },
        p.error ? h(Icon, { name: 'alert', size: 14 }) : null, msg) : null);
  }

  function Input(props) {
    var id = useId(props.id);
    var rest = omit(props, ['label', 'hint', 'error', 'prefix', 'suffix', 'optional', 'className', 'id']);
    return Field({ id: id, label: props.label, hint: props.hint, error: props.error, optional: props.optional, className: props.className }, function (describedBy) {
      return h('div', { className: 'dd-control' },
        props.prefix ? h('span', { className: 'dd-affix' }, props.prefix) : null,
        h('input', Object.assign({}, rest, { id: id, className: 'dd-input', 'aria-invalid': props.error ? 'true' : undefined, 'aria-describedby': describedBy })),
        props.suffix ? h('span', { className: 'dd-affix' }, props.suffix) : null);
    });
  }

  function Select(props) {
    var id = useId(props.id);
    var rest = omit(props, ['label', 'hint', 'error', 'options', 'placeholder', 'optional', 'className', 'id']);
    var opts = (props.options || []).map(function (o) {
      var v = typeof o === 'string' ? { value: o, label: o } : o;
      return h('option', { key: v.value, value: v.value, disabled: v.disabled }, v.label);
    });
    if (props.placeholder) opts.unshift(h('option', { key: '__ph', value: '', disabled: true }, props.placeholder));
    var sp = Object.assign({}, rest, { id: id, className: 'dd-select', 'aria-invalid': props.error ? 'true' : undefined });
    if (props.placeholder && props.value === undefined && props.defaultValue === undefined) sp.defaultValue = '';
    return Field({ id: id, label: props.label, hint: props.hint, error: props.error, optional: props.optional, className: props.className }, function (describedBy) {
      sp['aria-describedby'] = describedBy;
      return h('div', { className: 'dd-control dd-control-select' }, h('select', sp, opts), h(Icon, { name: 'chevronDown', className: 'dd-chevron' }));
    });
  }

  var STATUS = {
    'needs-you': ['warning', 'dot', 'Needs you'],
    running: ['info', 'refresh', 'Running'],
    done: ['success', 'check', 'Done'],
    pending: ['warning', 'clock', 'Pending'],
    upcoming: ['neutral', 'calendar', 'Upcoming'],
    shortlist: ['success', 'check', 'Shortlist'],
    hold: ['neutral', 'clock', 'Hold'],
    'awaiting-consent': ['info', 'clock', 'Awaiting consent'],
    'in-review': ['info', 'clock', 'In review'],
    'manager-review': ['neutral', 'clock', 'With manager'],
    approved: ['success', 'check', 'Approved'],
    rejected: ['danger', 'x', 'Rejected'],
    withdrawn: ['neutral', 'dot', 'Withdrawn'],
    draft: ['neutral', 'dot', 'Draft'],
    processing: ['info', 'refresh', 'Processing'],
    paid: ['success', 'check', 'Paid'],
    overdue: ['danger', 'alert', 'Overdue'],
    filed: ['success', 'check', 'Filed'],
    failed: ['danger', 'alert', 'Failed']
  };
  var TONE_ICON = { success: 'check', warning: 'clock', danger: 'alert', info: 'info', neutral: 'dot', brand: 'dot' };
  function Badge(props) {
    var s = props.status ? STATUS[props.status] : null;
    var tone = s ? s[0] : (props.tone || 'neutral');
    var icon = props.icon === false ? null : (props.icon || (s ? s[1] : TONE_ICON[tone]));
    return h('span', { className: cx('dd-badge', 'dd-badge-' + tone, props.className) },
      icon ? h(Icon, { name: icon, size: 12, strokeWidth: 2 }) : null,
      props.children || (s ? s[2] : null));
  }

  function formatINR(value, opts) {
    opts = opts || {};
    var n = Number(value);
    if (!isFinite(n)) return '—';
    var neg = n < 0, a = Math.abs(n), s;
    if (opts.compact && a >= 1e5) {
      var unit = a >= 1e7 ? [1e7, 'Cr'] : [1e5, 'L'];
      var v = a / unit[0];
      s = '₹' + (v >= 100 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(2).replace(/\.?0+$/, '')) + ' ' + unit[1];
    } else {
      var paise = opts.paise === true || (opts.paise !== false && Math.round(a * 100) % 100 !== 0);
      s = '₹' + a.toLocaleString('en-IN', { minimumFractionDigits: paise ? 2 : 0, maximumFractionDigits: paise ? 2 : 0 });
    }
    return neg ? '−' + s : s;
  }
  function Amount(props) {
    return h('span', {
      className: cx('dd-amount', props.size === 'lg' && 'dd-amount-lg', props.tone && 'dd-amount-' + props.tone, props.className),
      title: props.compact ? formatINR(props.value, { paise: true }) : undefined
    }, formatINR(props.value, { compact: props.compact, paise: props.paise }));
  }

  function Table(props) {
    var cols = props.columns || [];
    var rows = props.rows || [];
    var keyOf = props.rowKey || function (r, i) { return r.id != null ? r.id : i; };
    var numeric = function (c) { return c.align === 'right' || c.numeric ? 'dd-num' : undefined; };
    return h('div', { className: cx('dd-table-wrap', props.className) },
      h('table', { className: cx('dd-table', props.density === 'compact' && 'dd-table-compact') },
        props.caption ? h('caption', { className: 'dd-sr' }, props.caption) : null,
        h('thead', null, h('tr', null, cols.map(function (c) {
          return h('th', { key: c.key, scope: 'col', className: numeric(c), style: c.width ? { width: c.width } : undefined }, c.header);
        }))),
        h('tbody', null, rows.length ? rows.map(function (r, i) {
          return h('tr', { key: keyOf(r, i) }, cols.map(function (c) {
            return h('td', { key: c.key, className: numeric(c) }, c.render ? c.render(r) : r[c.key]);
          }));
        }) : h('tr', null, h('td', { className: 'dd-table-empty', colSpan: cols.length }, props.empty || 'Nothing here yet.')))));
  }

  function Dialog(props) {
    var titleId = useId();
    React.useEffect(function () {
      if (!props.onClose || props.open === false) return;
      function onKey(e) { if (e.key === 'Escape') props.onClose(); }
      document.addEventListener('keydown', onKey);
      return function () { document.removeEventListener('keydown', onKey); };
    }, [props.onClose, props.open]);
    if (props.open === false) return null;
    return h('div', { className: cx('dd-overlay', props.inline && 'dd-overlay-inline'), onMouseDown: function (e) { if (e.target === e.currentTarget && props.onClose) props.onClose(); } },
      h('div', { className: cx('dd-dialog', props.size === 'lg' && 'dd-dialog-lg'), role: props.irreversible ? 'alertdialog' : 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
        h('div', { className: 'dd-dialog-head' },
          h('h2', { id: titleId, className: 'dd-dialog-title' }, props.title),
          props.onClose ? h('button', { type: 'button', className: 'dd-icon-btn', 'aria-label': 'Close', onClick: props.onClose }, h(Icon, { name: 'x', size: 18 })) : null),
        props.description ? h('p', { className: 'dd-dialog-desc' }, props.description) : null,
        props.children ? h('div', { className: 'dd-dialog-body' }, props.children) : null,
        props.irreversible ? h('div', { className: 'dd-confirm-strip' }, h(Icon, { name: 'lock', size: 16 }), h('span', null, props.irreversible)) : null,
        props.footer ? h('div', { className: 'dd-dialog-foot' }, props.footer) : null));
  }

  /* =====================================================================
     TRUST SIGNALS
     ===================================================================== */

  var WRITE = {
    read: ['eye', 'Read-only', 'Only reads data. Nothing changes.'],
    guarded: ['shield', 'Reversible', 'Changes data within policy. Can be undone.'],
    irreversible: ['lock', 'Irreversible', 'Moves money, files with the government or revokes access. Cannot be undone.']
  };
  function WriteClass(props) {
    var w = WRITE[props.level || 'read'];
    return h('span', { className: cx('dd-write', 'dd-write-' + (props.level || 'read'), props.className), title: w[2] },
      h(Icon, { name: w[0], size: 13, strokeWidth: 2 }), props.iconOnly ? h('span', { className: 'dd-sr' }, w[1]) : w[1]);
  }

  function Deadline(props) {
    var d = props.daysLeft;
    var tone = d == null ? 'neutral' : d < 0 ? 'danger' : d <= 3 ? 'warning' : 'neutral';
    var rel = d == null ? null : d < 0 ? (-d === 1 ? '1 day overdue' : -d + ' days overdue') : d === 0 ? 'Due today' : d === 1 ? 'Due tomorrow' : 'Due in ' + d + ' days';
    return h('span', { className: cx('dd-deadline', 'dd-deadline-' + tone, props.className) },
      h(Icon, { name: 'calendar', size: 13, strokeWidth: 2 }),
      rel ? h('span', null, rel) : null,
      props.date ? h('span', { className: 'dd-deadline-date' }, (rel ? ' · ' : '') + props.date) : null);
  }

  var SOURCE_ICON = { doc: 'file', law: 'scale', data: 'database' };
  function SourceChip(props) {
    var inner = [h(Icon, { key: 'i', name: SOURCE_ICON[props.kind || 'doc'], size: 13 }), h('span', { key: 't' }, props.label)];
    return props.href
      ? h('a', { className: cx('dd-source', props.className), href: props.href }, inner)
      : h('span', { className: cx('dd-source', props.className) }, inner);
  }

  /* =====================================================================
     CONVERSATION
     ===================================================================== */

  function Avatar(props) {
    var size = props.size || 28;
    if (props.kind === 'person') {
      var initials = (props.name || '?').split(' ').map(function (p) { return p.charAt(0); }).slice(0, 2).join('').toUpperCase();
      return h('span', { className: 'dd-avatar dd-avatar-person', style: { width: size, height: size, fontSize: Math.round(size * 0.4) }, 'aria-label': props.name }, initials);
    }
    return h('span', { className: cx('dd-avatar dd-avatar-daydor', props.live && 'dd-avatar-live'), style: { width: size, height: size, fontSize: Math.round(size * 0.52) }, 'aria-label': 'Daydor' }, 'd');
  }

  function Eyebrow(parts) {
    var list = parts.filter(Boolean);
    return h('div', { className: 'dd-eyebrow' }, list.map(function (p, i) {
      return h(React.Fragment, { key: i }, i ? h('span', { className: 'dd-eyebrow-sep', 'aria-hidden': 'true' }, '·') : null, h('span', null, p));
    }));
  }

  function Message(props) {
    if (props.from === 'user') {
      return h('div', { className: 'dd-msg dd-msg-user' },
        h('div', { className: 'dd-msg-bubble' }, props.children),
        props.time ? h('div', { className: 'dd-msg-time' }, props.time) : null);
    }
    return h('div', { className: 'dd-msg dd-msg-daydor' },
      h(Avatar, { live: props.streaming }),
      h('div', { className: 'dd-msg-main' },
        Eyebrow(['Daydor', props.domain, props.time]),
        h('div', { className: cx('dd-msg-body', props.streaming && 'dd-msg-streaming') }, props.children)));
  }

  function Thinking(props) {
    var steps = props.steps || [];
    var current = steps.length ? steps[steps.length - 1] : null;
    return h('div', { className: 'dd-thinking', role: 'status', 'aria-live': 'polite' },
      h('span', { className: 'dd-live-dot', 'aria-hidden': 'true' }),
      h('div', null,
        h('div', { className: 'dd-shimmer' }, props.label || 'Working on it…'),
        current ? h('div', { className: 'dd-thinking-step' }, current, steps.length > 1 ? h('span', { className: 'dd-thinking-count' }, ' · step ' + steps.length) : null) : null));
  }

  function Composer(props) {
    var _v = React.useState(props.defaultValue || '');
    var value = props.value !== undefined ? props.value : _v[0];
    var setValue = function (v) { if (props.onChange) props.onChange(v); if (props.value === undefined) _v[1](v); };
    var ref = React.useRef(null);
    React.useEffect(function () {
      var el = ref.current; if (!el) return;
      el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }, [value]);
    function send() { if (!value.trim() || props.busy) return; if (props.onSend) props.onSend(value); setValue(''); }
    return h('div', { className: 'dd-composer-wrap' },
      props.suggestions && props.suggestions.length && !value ? h('div', { className: 'dd-suggestions' }, props.suggestions.map(function (s) {
        return h('button', { key: s, type: 'button', className: 'dd-suggestion', onClick: function () { setValue(s); if (ref.current) ref.current.focus(); } }, s);
      })) : null,
      h('div', { className: 'dd-composer' },
        h('textarea', {
          ref: ref, rows: 1, className: 'dd-composer-input', value: value, placeholder: props.placeholder || 'Ask Daydor, or tell it what to do…', 'aria-label': 'Message Daydor',
          onChange: function (e) { setValue(e.target.value); },
          onKeyDown: function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }
        }),
        h('div', { className: 'dd-composer-bar' },
          h('button', { type: 'button', className: 'dd-icon-btn', 'aria-label': 'Attach a file' }, h(Icon, { name: 'paperclip', size: 16 })),
          props.scope ? h('button', { type: 'button', className: 'dd-scope' }, props.scope, h(Icon, { name: 'chevronDown', size: 14 })) : null,
          h('span', { className: 'dd-composer-spacer' }),
          h('button', { type: 'button', className: cx('dd-send', value.trim() && 'dd-send-ready'), 'aria-label': props.busy ? 'Daydor is working' : 'Send', disabled: !value.trim() || props.busy, onClick: send },
            h(Icon, { name: props.busy ? 'loader' : 'arrowUp', size: 16, strokeWidth: 2.25, className: props.busy ? 'dd-spin' : undefined })))),
      props.footnote ? h('p', { className: 'dd-composer-note' }, props.footnote) : null);
  }

  var STEP_ICON = { read: 'eye', write: 'shield', gate: 'lock', done: 'check' };
  function Receipt(props) {
    var _o = React.useState(!!props.defaultOpen);
    var open = _o[0], setOpen = _o[1];
    var steps = props.steps || [];
    var bodyId = useId();
    return h('div', { className: cx('dd-receipt', open && 'dd-receipt-open') },
      h('button', { type: 'button', className: 'dd-receipt-toggle', 'aria-expanded': open ? 'true' : 'false', 'aria-controls': bodyId, onClick: function () { setOpen(!open); } },
        h(Icon, { name: 'chevronRight', size: 14, className: 'dd-receipt-chev' }),
        h('span', null, props.label || 'How I got here'),
        h('span', { className: 'dd-receipt-meta' }, steps.length + ' steps' + (props.duration ? ' · ' + props.duration : '')),
        props.writeClass ? h(WriteClass, { level: props.writeClass }) : null),
      open ? h('div', { id: bodyId, className: 'dd-receipt-body' },
        h('ol', { className: 'dd-steps' }, steps.map(function (s, i) {
          return h('li', { key: i, className: 'dd-step dd-step-' + (s.kind || 'read') },
            h('span', { className: 'dd-step-mark' }, h(Icon, { name: STEP_ICON[s.kind || 'read'], size: 12, strokeWidth: 2 })),
            h('div', { className: 'dd-step-main' },
              h('div', { className: 'dd-step-text' }, s.text),
              h('div', { className: 'dd-step-meta' }, [s.domain, s.worker ? h('code', { key: 'w' }, s.worker) : null, s.time].filter(Boolean).map(function (m, j) {
                return h(React.Fragment, { key: j }, j ? ' · ' : null, m);
              }))));
        })),
        (props.sources && props.sources.length) || props.auditId ? h('div', { className: 'dd-receipt-foot' },
          (props.sources || []).map(function (s, i) { return h(SourceChip, Object.assign({ key: i }, s)); }),
          props.auditId ? h('code', { className: 'dd-audit' }, props.auditId) : null) : null) : null);
  }

  /* =====================================================================
     DECISIONS & RUNS
     ===================================================================== */

  function DecisionCard(props) {
    var resolved = props.state === 'approved' || props.state === 'declined' || props.state === 'delegated';
    if (resolved) {
      var icon = props.state === 'approved' ? 'check' : props.state === 'declined' ? 'x' : 'userPlus';
      return h('div', { className: cx('dd-decision-resolved', 'dd-decision-' + props.state) },
        h('span', { className: 'dd-decision-resolved-mark' }, h(Icon, { name: icon, size: 14, strokeWidth: 2 })),
        h('span', { className: 'dd-decision-resolved-title' }, props.title),
        h('span', { className: 'dd-decision-resolved-meta' }, props.resolvedNote));
    }
    if (props.compact) {
      return h('button', { type: 'button', className: cx('dd-decision-row', props.selected && 'dd-decision-row-selected'), onClick: props.onOpen },
        h('span', { className: 'dd-decision-row-main' },
          Eyebrow([props.domain]),
          h('span', { className: 'dd-decision-row-title' }, props.title),
          h('span', { className: 'dd-decision-row-meta' },
            props.note ? h('span', { className: 'dd-decision-note' }, props.note) : (props.deadline ? h(Deadline, props.deadline) : null),
            props.writeClass === 'irreversible' ? h(WriteClass, { level: 'irreversible', iconOnly: true }) : null)),
        h(Icon, { name: 'chevronRight', size: 16, className: 'dd-decision-row-chev' }));
    }
    return h('section', { className: cx('dd-decision', props.writeClass === 'irreversible' && 'dd-decision-irreversible', props.pace === 'routine' && 'dd-decision-routine') },
      h('header', { className: 'dd-decision-head' },
        Eyebrow([props.domain, props.gate]),
        props.writeClass ? h(WriteClass, { level: props.writeClass }) : null),
      props.escalation ? h('div', { className: 'dd-decision-escalation' }, h(Icon, { name: 'clock', size: 14, strokeWidth: 2 }), h('span', null, props.escalation)) : null,
      h('h3', { className: 'dd-decision-title' }, props.title),
      props.summary ? h('p', { className: 'dd-decision-summary' }, props.summary) : null,
      props.figures && props.figures.length ? h('dl', { className: 'dd-figures' }, props.figures.map(function (f, i) {
        return h('div', { key: i, className: 'dd-figure' }, h('dt', null, f.label), h('dd', null, typeof f.value === 'number' ? h(Amount, { value: f.value }) : f.value, f.note ? h('span', { className: 'dd-figure-note' }, f.note) : null));
      })) : null,
      props.why ? h('p', { className: 'dd-decision-why' }, h(Icon, { name: 'scale', size: 14 }), h('span', null, props.why)) : null,
      props.children,
      h('footer', { className: 'dd-decision-foot' },
        h('div', { className: 'dd-decision-actions' },
          h(Button, { variant: 'primary', size: 'sm', onClick: props.onApprove }, props.approveLabel || 'Approve'),
          h(Button, { variant: 'secondary', size: 'sm', onClick: props.onReview }, props.reviewLabel || 'Review'),
          props.onDelegate !== false ? h(Button, { variant: 'ghost', size: 'sm', onClick: props.onDelegate }, 'Delegate') : null),
        props.note ? h('span', { className: 'dd-decision-note' }, h(Icon, { name: 'clock', size: 13 }), props.note) : (props.deadline ? h(Deadline, props.deadline) : null)));
  }

  function RunRow(props) {
    var state = props.state || 'running';
    var mark = state === 'running' ? h('span', { className: 'dd-live-dot' })
      : h('span', { className: 'dd-run-mark dd-run-' + state }, h(Icon, { name: state === 'done' ? 'check' : state === 'failed' ? 'alert' : 'clock', size: 12, strokeWidth: 2.25 }));
    return h('div', { className: cx('dd-run', 'dd-run-row-' + state) },
      mark,
      h('div', { className: 'dd-run-main' },
        h('div', { className: 'dd-run-title' }, props.title),
        h('div', { className: 'dd-run-meta' }, [props.domain, props.meta].filter(Boolean).join(' · '))),
      props.progress != null ? h('span', { className: 'dd-run-progress', role: 'progressbar', 'aria-valuenow': props.progress, 'aria-valuemin': 0, 'aria-valuemax': 100 },
        h('span', { style: { width: props.progress + '%' } })) : null);
  }

  function Brief(props) {
    return h('section', { className: 'dd-brief' },
      props.date ? h('div', { className: 'dd-eyebrow' }, props.date) : null,
      h('h1', { className: 'dd-brief-greeting' }, props.greeting),
      props.summary ? h('p', { className: 'dd-brief-summary' }, props.summary) : null,
      props.stats && props.stats.length ? h('div', { className: 'dd-brief-stats' }, props.stats.map(function (s, i) {
        return h('div', { key: i, className: cx('dd-brief-stat', s.tone && 'dd-brief-stat-' + s.tone) },
          h('div', { className: 'dd-brief-stat-value' }, s.value),
          h('div', { className: 'dd-brief-stat-label' }, s.label));
      })) : null,
      props.children);
  }

  /* =====================================================================
     NAVIGATION
     ===================================================================== */

  function Kbd(props) { return h('kbd', { className: 'dd-kbd' }, props.children); }

  function Sidebar(props) {
    var items = props.items || [];
    function item(it) {
      return h('a', { key: it.key || it.label, href: it.href || '#', className: cx('dd-nav-item', it.active && 'dd-nav-item-active'), 'aria-current': it.active ? 'page' : undefined, onClick: it.onClick },
        h(Icon, { name: it.icon, size: 17 }),
        h('span', { className: 'dd-nav-label' }, it.label),
        it.count ? h('span', { className: cx('dd-nav-count', it.countTone === 'warning' && 'dd-nav-count-warning') }, it.count) : null);
    }
    return h('nav', { className: 'dd-sidebar', 'aria-label': 'Main' },
      h('div', { className: 'dd-sidebar-head' },
        h('span', { className: 'dd-wordmark' }, 'daydor'),
        props.workspace ? h('button', { type: 'button', className: 'dd-workspace' }, h('span', null, props.workspace), h(Icon, { name: 'chevronDown', size: 14 })) : null),
      h('button', { type: 'button', className: 'dd-ask', onClick: props.onAsk },
        h(Icon, { name: 'search', size: 15 }), h('span', null, 'Ask or go to…'), h('span', { className: 'dd-ask-keys' }, h(Kbd, null, '⌘'), h(Kbd, null, 'K'))),
      h('div', { className: 'dd-nav-group' }, items.map(item)),
      h('span', { className: 'dd-sidebar-spacer' }),
      h('div', { className: 'dd-nav-group' }, (props.footerItems || [{ key: 'settings', label: 'Settings', icon: 'settings' }]).map(item)),
      props.user ? h('div', { className: 'dd-sidebar-user' }, h(Avatar, { kind: 'person', name: props.user.name, size: 26 }),
        h('div', { className: 'dd-sidebar-user-text' }, h('div', null, props.user.name), props.user.role ? h('div', { className: 'dd-sidebar-user-role' }, props.user.role) : null)) : null);
  }

  function CommandBar(props) {
    var _q = React.useState(props.defaultQuery || '');
    var q = _q[0], setQ = _q[1];
    var groups = (props.groups || []).map(function (g) {
      return { label: g.label, items: g.items.filter(function (it) { return !q || (it.label + ' ' + (it.hint || '')).toLowerCase().indexOf(q.toLowerCase()) >= 0; }) };
    }).filter(function (g) { return g.items.length; });
    var flat = [];
    if (q) flat.push({ ask: true, label: q });
    groups.forEach(function (g) { g.items.forEach(function (it) { flat.push(it); }); });
    var _a = React.useState(0);
    var active = Math.min(_a[0], Math.max(flat.length - 1, 0)), setActive = _a[1];
    function onKey(e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, flat.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
      if (e.key === 'Enter' && flat[active] && props.onSelect) props.onSelect(flat[active]);
      if (e.key === 'Escape' && props.onClose) props.onClose();
    }
    var idx = 0;
    function row(it) {
      var i = idx++;
      return h('div', { key: i, role: 'option', 'aria-selected': i === active ? 'true' : 'false', className: cx('dd-cmd-item', i === active && 'dd-cmd-item-active'),
        onMouseEnter: function () { setActive(i); }, onClick: function () { if (props.onSelect) props.onSelect(it); } },
        it.ask ? h(Avatar, { size: 20 }) : h(Icon, { name: it.icon || 'chevronRight', size: 16 }),
        h('span', { className: 'dd-cmd-label' }, it.ask ? h(React.Fragment, null, 'Ask Daydor: ', h('span', { className: 'dd-cmd-query' }, '“' + it.label + '”')) : it.label),
        it.hint ? h('span', { className: 'dd-cmd-hint' }, it.hint) : null,
        it.writeClass && it.writeClass !== 'read' ? h(WriteClass, { level: it.writeClass, iconOnly: true }) : null,
        i === active ? h(Icon, { name: 'enter', size: 14, className: 'dd-cmd-enter' }) : null);
    }
    var panel = h('div', { className: 'dd-cmd', role: 'dialog', 'aria-label': 'Ask Daydor or go to' },
      h('div', { className: 'dd-cmd-input-row' },
        h(Icon, { name: 'search', size: 17 }),
        h('input', { className: 'dd-cmd-input', autoFocus: !props.inline, value: q, placeholder: 'Ask Daydor, find a person, or go to…', onChange: function (e) { setQ(e.target.value); setActive(0); }, onKeyDown: onKey, role: 'combobox', 'aria-expanded': 'true' }),
        h(Kbd, null, 'esc')),
      h('div', { className: 'dd-cmd-list', role: 'listbox' },
        q ? h('div', { className: 'dd-cmd-group' }, row(flat[0])) : null,
        groups.map(function (g) { return h('div', { key: g.label, className: 'dd-cmd-group' }, h('div', { className: 'dd-cmd-group-label' }, g.label), g.items.map(row)); }),
        !flat.length ? h('div', { className: 'dd-cmd-empty' }, 'Type a question and press Enter to ask Daydor.') : null),
      h('div', { className: 'dd-cmd-foot' }, h('span', null, h(Kbd, null, '↑'), h(Kbd, null, '↓'), ' to move'), h('span', null, h(Kbd, null, '↵'), ' to open'), h('span', { className: 'dd-cmd-foot-note' }, 'Actions marked ', h(Icon, { name: 'lock', size: 12 }), ' ask before running')));
    return h('div', { className: cx('dd-overlay dd-overlay-top', props.inline && 'dd-overlay-inline') }, panel);
  }

  function TabBar(props) {
    return h('nav', { className: 'dd-tabbar', 'aria-label': 'Main' }, (props.items || []).map(function (it) {
      return h('a', { key: it.key || it.label, href: it.href || '#', className: cx('dd-tab', it.active && 'dd-tab-active', it.primary && 'dd-tab-primary'), 'aria-current': it.active ? 'page' : undefined },
        h('span', { className: 'dd-tab-icon' }, h(Icon, { name: it.icon, size: it.primary ? 20 : 22 }), it.count ? h('span', { className: 'dd-tab-count' }, it.count) : null),
        h('span', { className: 'dd-tab-label' }, it.label));
    }));
  }

  /* =====================================================================
     SYSTEM STATES
     ===================================================================== */

  var BANNER_ICON = { paused: 'pause', warning: 'alert', danger: 'alert', info: 'info' };
  function Banner(props) {
    var tone = props.tone || 'info';
    return h('div', { className: cx('dd-banner', 'dd-banner-' + tone), role: tone === 'danger' ? 'alert' : 'status' },
      h(Icon, { name: props.icon || BANNER_ICON[tone], size: 16 }),
      h('div', { className: 'dd-banner-text' }, h('strong', null, props.title), props.children ? h('span', null, ' ', props.children) : null),
      props.action ? h(Button, { size: 'sm', variant: 'secondary', onClick: props.action.onClick }, props.action.label) : null);
  }

  var CALLOUT_ICON = { danger: 'alert', warning: 'merge', info: 'info', neutral: 'info' };
  function Callout(props) {
    var tone = props.tone || 'neutral';
    return h('section', { className: cx('dd-callout', 'dd-callout-' + tone) },
      h('span', { className: 'dd-callout-mark' }, h(Icon, { name: props.icon || CALLOUT_ICON[tone], size: 15, strokeWidth: 2 })),
      h('div', { className: 'dd-callout-main' },
        props.eyebrow ? Eyebrow([].concat(props.eyebrow)) : null,
        h('div', { className: 'dd-callout-title' }, props.title),
        props.children ? h('div', { className: 'dd-callout-body' }, props.children) : null,
        props.actions ? h('div', { className: 'dd-callout-actions' }, props.actions) : null));
  }

  function EmptyState(props) {
    return h('div', { className: cx('dd-empty', props.size === 'sm' && 'dd-empty-sm') },
      h('span', { className: 'dd-empty-icon' }, h(Icon, { name: props.icon || 'inbox', size: props.size === 'sm' ? 18 : 22 })),
      h('div', { className: 'dd-empty-title' }, props.title),
      props.children ? h('div', { className: 'dd-empty-body' }, props.children) : null,
      props.action ? h('div', { className: 'dd-empty-action' }, props.action) : null);
  }

  /* =====================================================================
     DOMAIN VIEWS
     ===================================================================== */

  function PageHeader(props) {
    return h('header', { className: 'dd-page-head' },
      h('div', { className: 'dd-page-head-row' },
        props.person ? h(Avatar, { kind: 'person', name: props.person, size: 48 }) : null,
        h('div', { className: 'dd-page-head-text' },
          props.eyebrow ? Eyebrow([].concat(props.eyebrow)) : null,
          h('h1', { className: 'dd-page-title' }, props.title, props.status ? h(Badge, { status: props.status }) : null),
          props.description ? h('p', { className: 'dd-page-desc' }, props.description) : null),
        props.actions ? h('div', { className: 'dd-page-actions' }, props.actions) : null),
      props.tabs ? h(Tabs, { items: props.tabs }) : null);
  }

  function Tabs(props) {
    return h('div', { className: 'dd-tabs', role: 'tablist' }, (props.items || []).map(function (t) {
      var it = typeof t === 'string' ? { label: t } : t;
      return h('button', { key: it.label, type: 'button', role: 'tab', 'aria-selected': it.active ? 'true' : 'false', className: cx('dd-tabs-item', it.active && 'dd-tabs-item-active'), onClick: it.onClick },
        it.label, it.count != null ? h('span', { className: 'dd-tabs-count' }, it.count) : null);
    }));
  }

  var STEP_STATE_ICON = { done: 'check', current: null, blocked: 'alert', waiting: 'clock', upcoming: null };
  function Stepper(props) {
    var vertical = props.orientation === 'vertical';
    return h('ol', { className: cx('dd-stepper', vertical ? 'dd-stepper-v' : 'dd-stepper-h') }, (props.steps || []).map(function (st, i) {
      var state = st.state || 'upcoming';
      var icon = STEP_STATE_ICON[state];
      return h('li', { key: i, className: 'dd-stepper-step dd-stepper-' + state, 'aria-current': state === 'current' ? 'step' : undefined },
        h('span', { className: 'dd-stepper-mark' }, icon ? h(Icon, { name: icon, size: 12, strokeWidth: 2.25 }) : (state === 'current' ? h('span', { className: 'dd-stepper-dot' }) : null)),
        h('div', { className: 'dd-stepper-text' },
          h('div', { className: 'dd-stepper-label' }, st.label, st.writeClass === 'irreversible' ? h(WriteClass, { level: 'irreversible', iconOnly: true }) : null),
          st.meta ? h('div', { className: 'dd-stepper-meta' }, st.meta) : null,
          vertical && st.children ? h('div', { className: 'dd-stepper-extra' }, st.children) : null));
    }));
  }

  function StatRow(props) {
    return h('dl', { className: 'dd-stats' }, (props.items || []).map(function (st, i) {
      return h('div', { key: i, className: 'dd-stat' },
        h('dt', null, st.label),
        h('dd', null, typeof st.value === 'number' ? h(Amount, { value: st.value }) : st.value),
        st.delta ? h('div', { className: cx('dd-stat-delta', st.deltaTone && 'dd-stat-delta-' + st.deltaTone) }, st.delta) : null);
    }));
  }

  function ObligationRow(props) {
    var parts = (props.date || '').split(' ');
    return h('div', { className: cx('dd-obligation', props.status === 'needs-you' && 'dd-obligation-attn', props.status === 'overdue' && 'dd-obligation-overdue') },
      h('div', { className: 'dd-obligation-date' }, h('span', { className: 'dd-obligation-day' }, parts[0]), h('span', { className: 'dd-obligation-mon' }, parts[1] || '')),
      h('div', { className: 'dd-obligation-main' },
        h('div', { className: 'dd-obligation-title' }, props.title),
        h('div', { className: 'dd-obligation-meta' }, [props.authority, props.period, props.note].filter(Boolean).join(' · '))),
      props.amount != null ? h(Amount, { value: props.amount, className: 'dd-obligation-amount' }) : h('span', null),
      h('div', { className: 'dd-obligation-status' }, props.status ? h(Badge, { status: props.status }) : null));
  }

  function Timeline(props) {
    return h('ol', { className: 'dd-timeline' }, (props.items || []).map(function (it, i) {
      return h('li', { key: i, className: 'dd-timeline-item dd-timeline-' + (it.by === 'person' ? 'person' : 'daydor') },
        h('span', { className: 'dd-timeline-mark' }, it.by === 'person' ? h(Avatar, { kind: 'person', name: it.name || '?', size: 22 }) : h(Avatar, { size: 22 })),
        h('div', { className: 'dd-timeline-main' },
          h('div', { className: 'dd-timeline-text' }, it.text, it.writeClass && it.writeClass !== 'read' ? h(WriteClass, { level: it.writeClass, iconOnly: true }) : null),
          h('div', { className: 'dd-timeline-meta' }, [it.domain, it.time].filter(Boolean).join(' · '))));
    }));
  }

  function FactList(props) {
    return h('dl', { className: cx('dd-facts', props.columns === 2 && 'dd-facts-2') }, (props.items || []).map(function (f, i) {
      return h('div', { key: i, className: 'dd-fact' },
        h('dt', null, f.label),
        h('dd', { className: f.mono ? 'dd-fact-mono' : undefined }, typeof f.value === 'number' ? h(Amount, { value: f.value }) : f.value,
          f.locked ? h('span', { className: 'dd-fact-lock', title: 'Changing this needs approval' }, h(Icon, { name: 'lock', size: 12 })) : null));
    }));
  }

  /* =====================================================================
     DOCUMENTS
     ===================================================================== */

  var ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function words99(n) { return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''); }
  function words999(n) { var hnd = Math.floor(n / 100), r = n % 100; return (hnd ? ONES[hnd] + ' Hundred' + (r ? ' ' : '') : '') + (r ? words99(r) : ''); }
  /* Indian system: crore, lakh, thousand, hundred. */
  function amountInWords(value) {
    var n = Math.round(Math.abs(Number(value)) * 100), rupees = Math.floor(n / 100), paise = n % 100;
    if (!rupees && !paise) return 'Rupees Zero Only';
    var parts = [], cr = Math.floor(rupees / 1e7), lk = Math.floor(rupees / 1e5) % 100, th = Math.floor(rupees / 1e3) % 100, rest = rupees % 1000;
    if (cr) parts.push((cr > 999 ? amountInWords(cr).replace(/^Rupees | Only$/g, '') : words999(cr)) + ' Crore');
    if (lk) parts.push(words99(lk) + ' Lakh');
    if (th) parts.push(words99(th) + ' Thousand');
    if (rest) parts.push(words999(rest));
    return 'Rupees ' + parts.join(' ') + (paise ? ' and ' + words99(paise) + ' Paise' : '') + ' Only';
  }

  function DocumentPage(props) {
    /* Paper is always light; a client theme layers only its action colours on top. */
    return h('article', { className: 'dd-doc', 'data-theme': 'light' }, h('div', { className: 'dd-doc-inner', 'data-theme': props.theme || 'light' },
      h('header', { className: 'dd-doc-head' },
        h('div', { className: 'dd-doc-brand' },
          h('span', { className: 'dd-doc-logo' }, props.logo || (props.company || '?').split(' ').map(function (w) { return w.charAt(0); }).slice(0, 2).join('')),
          h('div', null, h('div', { className: 'dd-doc-company' }, props.company), props.address ? h('div', { className: 'dd-doc-address' }, props.address) : null)),
        h('div', { className: 'dd-doc-title-wrap' }, h('div', { className: 'dd-doc-title' }, props.title), props.meta ? h('div', { className: 'dd-doc-meta' }, props.meta) : null)),
      h('div', { className: 'dd-doc-body' }, props.children),
      h('footer', { className: 'dd-doc-foot' },
        h('span', null, props.footer || 'This is a computer-generated document and does not need a signature.'),
        h('span', { className: 'dd-doc-powered' }, 'Prepared with daydor'))));
  }

  function Payslip(props) {
    var e = props.employee || {};
    var sum = function (list) { return (list || []).reduce(function (a, r) { return a + r[1]; }, 0); };
    var gross = sum(props.earnings), ded = sum(props.deductions);
    var net = props.net != null ? props.net : gross - ded;
    function rows(list, total, totalLabel) {
      return h('table', { className: 'dd-doc-table' },
        h('tbody', null, (list || []).map(function (r, i) { return h('tr', { key: i }, h('td', null, r[0]), h('td', { className: 'dd-num' }, h(Amount, { value: r[1], paise: true }))); }),
          h('tr', { className: 'dd-doc-total' }, h('td', null, totalLabel), h('td', { className: 'dd-num' }, h(Amount, { value: total, paise: true })))));
    }
    return h(DocumentPage, { company: props.company, address: props.address, logo: props.logo, theme: props.theme, title: 'Payslip', meta: props.period },
      h('dl', { className: 'dd-doc-facts' }, [
        ['Employee', e.name], ['Employee ID', e.id], ['Designation', e.role], ['Date of joining', e.joined],
        ['PAN', e.pan], ['UAN', e.uan], ['Bank', e.bank], ['Paid days', e.paidDays]
      ].filter(function (f) { return f[1]; }).map(function (f, i) { return h('div', { key: i }, h('dt', null, f[0]), h('dd', null, f[1])); })),
      h('div', { className: 'dd-doc-cols' },
        h('section', null, h('h3', { className: 'dd-doc-h' }, 'Earnings'), rows(props.earnings, gross, 'Gross earnings')),
        h('section', null, h('h3', { className: 'dd-doc-h' }, 'Deductions'), rows(props.deductions, ded, 'Total deductions'))),
      h('div', { className: 'dd-doc-net' },
        h('div', null, h('div', { className: 'dd-doc-net-label' }, 'Net pay'), h('div', { className: 'dd-doc-net-words' }, amountInWords(net))),
        h(Amount, { value: net, paise: true, className: 'dd-doc-net-value' })),
      props.employer && props.employer.length ? h('p', { className: 'dd-doc-note' }, 'Employer contributions (not part of net pay): ' + props.employer.map(function (r) { return r[0] + ' ' + formatINR(r[1], { paise: true }); }).join(' · ')) : null);
  }

  /* =====================================================================
     NEW DOMAINS: hiring, leave, expenses, benefits, self-service
     ===================================================================== */

  var BLOCKER_ICON = { you: 'dot', external: 'clock', agent: null, done: 'check' };
  function CandidateCard(props) {
    var b = props.blocker;
    return h('button', { type: 'button', className: cx('dd-cand', props.selected && 'dd-cand-selected', b && b.kind === 'you' && 'dd-cand-attn'), onClick: props.onOpen },
      h('div', { className: 'dd-cand-top' },
        h(Avatar, { kind: 'person', name: props.name, size: 26 }),
        h('div', { className: 'dd-cand-id' }, h('div', { className: 'dd-cand-name' }, props.name), props.meta ? h('div', { className: 'dd-cand-meta' }, props.meta) : null)),
      props.signal ? h('div', { className: 'dd-cand-signal' }, h(Badge, { status: props.signal }), props.signalNote ? h('span', null, props.signalNote) : null) : null,
      b ? h('div', { className: 'dd-cand-blocker dd-cand-blocker-' + b.kind },
        b.kind === 'agent' ? h('span', { className: 'dd-live-dot dd-live-dot-sm' }) : h(Icon, { name: BLOCKER_ICON[b.kind] || 'dot', size: 13, strokeWidth: 2 }),
        h('span', null, b.text)) : null);
  }

  function StageBoard(props) {
    var items = props.items || [];
    return h('div', { className: 'dd-board', role: 'list' }, (props.stages || []).map(function (st) {
      var cards = items.filter(function (it) { return it.stage === st.key; });
      return h('section', { key: st.key, className: 'dd-board-col', role: 'listitem', 'aria-label': st.label },
        h('header', { className: 'dd-board-head' }, h('span', null, st.label), h('span', { className: 'dd-board-count' }, st.count != null ? st.count : cards.length)),
        h('div', { className: 'dd-board-cards' }, cards.length ? cards.map(function (c) { return h(CandidateCard, Object.assign({ key: c.id || c.name }, c)); })
          : h('div', { className: 'dd-board-empty' }, st.empty || '—')));
    }));
  }

  function VerifyCode(props) {
    var len = props.length || 6;
    var _v = React.useState(props.defaultValue || '');
    var value = (props.value !== undefined ? props.value : _v[0]) || '';
    var refs = React.useRef([]);
    function set(v) { v = v.replace(/\D/g, '').slice(0, len); if (props.onChange) props.onChange(v); if (props.value === undefined) _v[1](v); if (v.length === len && props.onComplete) props.onComplete(v); }
    var boxes = [];
    for (var i = 0; i < len; i++) (function (i) {
      boxes.push(h('input', { key: i, ref: function (el) { refs.current[i] = el; }, className: cx('dd-otp-box', value[i] && 'dd-otp-filled', props.error && 'dd-otp-error'),
        inputMode: 'numeric', autoComplete: i === 0 ? 'one-time-code' : 'off', maxLength: len, value: value[i] || '', 'aria-label': 'Digit ' + (i + 1),
        onChange: function (e) { var d = e.target.value.replace(/\D/g, ''); if (!d) return; var next = (value.slice(0, i) + d + value.slice(i + d.length)).slice(0, len); set(next); var to = Math.min(i + d.length, len - 1); if (refs.current[to]) refs.current[to].focus(); },
        onKeyDown: function (e) { if (e.key === 'Backspace') { e.preventDefault(); set(value.slice(0, value[i] ? i : Math.max(i - 1, 0)) + value.slice(i + 1)); if (!value[i] && refs.current[i - 1]) refs.current[i - 1].focus(); } }
      }));
    })(i);
    return h('div', { className: 'dd-otp' },
      h('span', { className: 'dd-otp-icon' }, h(Icon, { name: 'lock', size: 20 })),
      h('h2', { className: 'dd-otp-title' }, props.title || 'Enter the code we sent you'),
      props.destination ? h('p', { className: 'dd-otp-dest' }, 'Sent by SMS to ', h('strong', null, props.destination)) : null,
      props.summary ? h('div', { className: 'dd-otp-summary' }, props.summary) : null,
      h('div', { className: 'dd-otp-boxes', role: 'group', 'aria-label': 'Verification code' }, boxes),
      props.error ? h('p', { className: 'dd-error dd-otp-msg' }, h(Icon, { name: 'alert', size: 14 }), props.error) : null,
      h('p', { className: 'dd-otp-resend' }, props.resendIn ? 'Resend code in ' + props.resendIn : h('button', { type: 'button', className: 'dd-link-btn', onClick: props.onResend }, 'Resend code')),
      props.footer ? h('div', { className: 'dd-otp-foot' }, props.footer) : null);
  }

  function ReceiptReview(props) {
    return h('div', { className: cx('dd-receipt-review', props.layout === 'stacked' && 'dd-receipt-review-stacked') },
      h('figure', { className: 'dd-receipt-photo' },
        props.src ? h('img', { src: props.src, alt: props.alt || 'Receipt photo' }) : props.photo,
        props.caption ? h('figcaption', null, props.caption) : null),
      h('div', { className: 'dd-extracted' },
        h('div', { className: 'dd-extracted-head' }, h(Avatar, { size: 18 }), h('span', null, props.heading || 'Read from the receipt — check before you submit')),
        h('dl', { className: 'dd-extracted-list' }, (props.fields || []).map(function (f, i) {
          return h('div', { key: i, className: cx('dd-extracted-row', f.confidence === 'low' && 'dd-extracted-low', f.confirmed && 'dd-extracted-ok') },
            h('dt', null, f.label),
            h('dd', null, h('span', { className: 'dd-extracted-value' }, typeof f.value === 'number' ? h(Amount, { value: f.value, paise: true }) : f.value),
              f.confidence === 'low' ? h('span', { className: 'dd-extracted-flag' }, h(Icon, { name: 'alert', size: 12, strokeWidth: 2 }), f.flag || 'Check this') :
              f.confirmed ? h('span', { className: 'dd-extracted-flag dd-extracted-flag-ok' }, h(Icon, { name: 'check', size: 12, strokeWidth: 2 }), 'Confirmed') : null));
        })),
        props.children));
  }

  var ATT = { P: ['present', 'Present'], A: ['absent', 'Absent'], H: ['half', 'Half day'], L: ['leave', 'On leave'], O: ['off', 'Weekly off / holiday'], '-': ['future', 'Upcoming'] };
  var ATT_TEXT = { P: '', A: 'A', H: '½', L: 'L', O: '', '-': '' };
  function AttendanceGrid(props) {
    var days = props.days || [];
    return h('div', { className: 'dd-att' },
      h('table', { className: 'dd-att-table' },
        h('thead', null, h('tr', null, h('th', { scope: 'col', className: 'dd-att-name' }, h('span', { className: 'dd-sr' }, 'Person')),
          days.map(function (d, i) { return h('th', { key: i, scope: 'col', className: d.today ? 'dd-att-today' : undefined }, h('div', null, d.label), d.sub ? h('div', { className: 'dd-att-sub' }, d.sub) : null); }))),
        h('tbody', null, (props.people || []).map(function (p) {
          return h('tr', { key: p.name }, h('th', { scope: 'row', className: 'dd-att-name' }, p.name),
            p.marks.split('').map(function (m, i) { var a = ATT[m] || ATT['-']; return h('td', { key: i, className: days[i] && days[i].today ? 'dd-att-today' : undefined }, h('span', { className: 'dd-att-cell dd-att-' + a[0], title: a[1] }, ATT_TEXT[m] || '', h('span', { className: 'dd-sr' }, a[1]))); }));
        }))),
      props.legend !== false ? h('div', { className: 'dd-att-legend' }, ['P', 'L', 'H', 'A', 'O'].map(function (k) { return h('span', { key: k }, h('span', { className: 'dd-att-cell dd-att-' + ATT[k][0] }, ATT_TEXT[k]), ATT[k][1]); })) : null);
  }

  function ChoiceCard(props) {
    return h('section', { className: cx('dd-choice', props.selected && 'dd-choice-selected') },
      h('label', { className: 'dd-choice-head' },
        h('input', { type: 'checkbox', className: 'dd-choice-input', checked: !!props.selected, onChange: function (e) { if (props.onToggle) props.onToggle(e.target.checked); }, readOnly: !props.onToggle }),
        h('span', { className: 'dd-choice-box', 'aria-hidden': 'true' }, props.selected ? h(Icon, { name: 'check', size: 12, strokeWidth: 2.5 }) : null),
        props.icon ? h('span', { className: 'dd-choice-icon' }, h(Icon, { name: props.icon, size: 18 })) : null,
        h('span', { className: 'dd-choice-text' }, h('span', { className: 'dd-choice-title' }, props.title), props.description ? h('span', { className: 'dd-choice-desc' }, props.description) : null),
        props.meta ? h('span', { className: 'dd-choice-meta' }, props.meta) : null),
      props.selected && props.children ? h('div', { className: 'dd-choice-body' }, props.children) : null);
  }

  var TIER = {
    direct: { action: 'Edit', note: null },
    review: { action: 'Request change', note: 'Checked by your HR team before it changes' },
    gated: { action: 'Change', note: 'Needs a one-time code to your phone' }
  };
  function ProfileField(props) {
    var tier = TIER[props.tier || 'direct'];
    return h('div', { className: cx('dd-pfield', 'dd-pfield-' + (props.tier || 'direct')) },
      h('div', { className: 'dd-pfield-main' },
        h('div', { className: 'dd-pfield-label' }, props.label, props.tier === 'gated' ? h(Icon, { name: 'lock', size: 12 }) : null),
        h('div', { className: 'dd-pfield-value' }, props.value),
        props.pending ? h('div', { className: 'dd-pfield-pending' }, h(Badge, { status: 'in-review' }), h('span', null, props.pending)) : null),
      props.pending ? null : h(Button, { size: 'sm', variant: props.tier === 'direct' ? 'ghost' : 'secondary', onClick: props.onEdit }, props.actionLabel || tier.action));
  }

  var api = {
    Message: Message, Composer: Composer, Thinking: Thinking, Receipt: Receipt, DecisionCard: DecisionCard, RunRow: RunRow, Brief: Brief,
    Avatar: Avatar, WriteClass: WriteClass, Deadline: Deadline, SourceChip: SourceChip,
    Badge: Badge, Amount: Amount, Button: Button, Input: Input, Select: Select, Table: Table, Dialog: Dialog,
    PageHeader: PageHeader, Tabs: Tabs, Stepper: Stepper, StatRow: StatRow, ObligationRow: ObligationRow, Timeline: Timeline, FactList: FactList,
    DocumentPage: DocumentPage, Payslip: Payslip, amountInWords: amountInWords,
    StageBoard: StageBoard, CandidateCard: CandidateCard, VerifyCode: VerifyCode, ReceiptReview: ReceiptReview, AttendanceGrid: AttendanceGrid, ChoiceCard: ChoiceCard, ProfileField: ProfileField,
    Sidebar: Sidebar, CommandBar: CommandBar, TabBar: TabBar, Kbd: Kbd, Banner: Banner, Callout: Callout, EmptyState: EmptyState,
    Icon: Icon, formatINR: formatINR, STATUS: STATUS, WRITE_CLASSES: WRITE
  };
  window.Daydor = Object.assign(window.Daydor || {}, api);
})();
