/* ============================================================
   FUNBOX 玩盒 — 8 件纯本地小工具
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- 工具注册表（驱动侧栏 / 路由 / 首页磁贴） ---------------- */
  var TOOLS = [
    { id: 'password', no: '01', name: '密钥制造机', en: 'PASSWORD', ico: '🔑', color: '#ffd400', desc: '本地随机强密码，长度符号全可调。' },
    { id: 'palette',  no: '02', name: '配色制造机', en: 'PALETTE',  ico: '🎨', color: '#ff5ea8', desc: '一键撞色，锁定喜欢的颜色再随机。' },
    { id: 'lorem',    no: '03', name: '占位文工厂', en: 'LOREM',    ico: '✍️', color: '#19c2d6', desc: '英文乱数假文，或者……互联网黑话。' },
    { id: 'markdown', no: '04', name: 'MD 小笔记本', en: 'MARKDOWN', ico: '📓', color: '#2e6bff', desc: '左边写右边看，草稿自动存在本机。' },
    { id: 'text',     no: '05', name: '文本加工台', en: 'TEXT LAB', ico: '🪚', color: '#12b35f', desc: '大小写、去重、排序、清洗，一键搞定。' },
    { id: 'pomodoro', no: '06', name: '番茄时钟',   en: 'POMODORO', ico: '🍅', color: '#ff4d2e', desc: '25 分钟专注 + 5 分钟喘气，循环。' },
    { id: 'picker',   no: '07', name: '帮我决定',   en: 'PICKER',   ico: '🎯', color: '#8b5cf6', desc: '选择困难症急救：把选项交给命运。' },
    { id: 'image',    no: '08', name: '图片压一压', en: 'IMAGE',    ico: '🗜️', color: '#ff7a1a', desc: '浏览器本地压缩改尺寸，不传服务器。' }
  ];
  var BY_ID = {};
  TOOLS.forEach(function (t) { BY_ID[t.id] = t; });

  /* ---------------- 基础 ---------------- */
  var app = document.getElementById('app');
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var toastT;
  function toast(msg) {
    var w = $('.toast-wrap');
    if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; w.innerHTML = '<div class="toast"></div>'; document.body.appendChild(w); }
    w.firstChild.textContent = msg;
    w.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { w.classList.remove('show'); }, 1600);
  }
  function copy(txt, msg) {
    function done() { toast(msg || '已复制'); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fallback);
    else fallback();
    function fallback() {
      var t = document.createElement('textarea');
      t.value = txt; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请手动选择'); }
      document.body.removeChild(t);
    }
  }
  function head(t, titleHtml, desc) {
    return '<div class="t-head" style="--accent:' + t.color + '">' +
      '<span class="t-no">' + t.no + ' / ' + t.en + '</span>' +
      '<h1>' + titleHtml + '</h1><p>' + desc + '</p></div>';
  }
  function humanSize(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(2) + ' MB';
  }
  function randInt(n) { return Math.floor(Math.random() * n); }

  /* 加密安全的均匀随机整数（拒绝采样，消除模偏差） */
  function secureInt(max) {
    if (max <= 0) return 0;
    var crypto = window.crypto || window.msCrypto;
    if (crypto && crypto.getRandomValues) {
      var buf = new Uint32Array(1), limit = Math.floor(0xFFFFFFFF / max) * max;
      do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
      return buf[0] % max;
    }
    return randInt(max);
  }

  /* 跑马灯内容 */
  (function () {
    var s = '★ 100% 免费使用 ★ 无需注册 ★ 文件不上传 ★ 打开就能用 ★ 断网也能玩 ★ 手机也适配 ★';
    document.getElementById('marqueeTrack').textContent = s + '　　' + s + '　　' + s + '　　' + s;
  })();

  /* 侧栏 */
  document.getElementById('sidenav').innerHTML = TOOLS.map(function (t) {
    return '<a href="#/' + t.id + '" data-nav="' + t.id + '"><span class="n">' + t.no + '</span>' +
      '<span class="ico">' + t.ico + '</span><span class="t-name">' + t.name + '</span></a>';
  }).join('');

  /* 番茄钟计时器（跨视图清理） */
  var pomoTimer = null;
  function clearPomo() { if (pomoTimer) { clearInterval(pomoTimer); pomoTimer = null; } }

  /* ============================================================
     首页：大字报 Hero + 撞色磁贴
     ============================================================ */
  function viewHome() {
    var tiles = TOOLS.map(function (t, i) {
      var cls = 'tile' + (i === 0 || i === 3 ? ' big' : '');
      return '<a class="' + cls + '" href="#/' + t.id + '" style="--tile:' + t.color + '">' +
        '<span class="t-num">' + t.no + '</span>' +
        '<span class="t-ico">' + t.ico + '</span>' +
        '<h3>' + t.name + '</h3><p>' + t.desc + '</p>' +
        '<span class="t-go">打开 →</span></a>';
    }).join('');

    app.innerHTML =
      '<section class="hero">' +
        '<h1><span>在线小工具，</span><span class="row2"><span class="mark">管够。</span> <span class="mark2">还免费。</span></span></h1>' +
        '<p class="lead">FUNBOX 玩盒是 8 件趁手小工具的合集。不搞花里胡哨的注册登录，所有计算都在你自己的浏览器里完成——关了网页，什么数据都不留下。</p>' +
        '<div class="hero-meta">' +
          '<span class="hm"><b>8</b> 件工具</span>' +
          '<span class="hm"><b>0</b> 个后端请求</span>' +
          '<span class="hm"><b>100%</b> 本地运行</span>' +
          '<span class="hm"><b>∞</b> 次免费使用</span>' +
        '</div>' +
        '<div class="tile-grid">' + tiles + '</div>' +
        '<div class="howto">' +
          '<div class="h"><b>① 挑一件</b>从左边工具栏点进去，首页磁贴也行。</div>' +
          '<div class="h"><b>② 直接用</b>输入内容、拖入文件，结果当场出来。</div>' +
          '<div class="h"><b>③ 放心关</b>数据不出浏览器，不写服务器，不用清痕迹。</div>' +
        '</div>' +
      '</section>';
  }

  /* ============================================================
     01 密钥制造机
     ============================================================ */
  function viewPassword() {
    var t = BY_ID.password;
    var history = [];
    app.innerHTML = head(t, '密钥<span class="hl">制造机</span>', '用系统级加密随机源生成密码，全程不联网。') +
      '<div class="grid-2">' +
        '<div>' +
          '<div class="panel" style="--accent:' + t.color + '">' +
            '<p class="panel-title">参数设置</p>' +
            '<label class="fld">长度 <b id="pwLenVal" style="font-family:var(--mono)">16</b> 位</label>' +
            '<input type="range" id="pwLen" min="6" max="40" value="16">' +
            '<div class="fld-row" style="margin-top:12px">' +
              '<label class="check on" style="--accent:' + t.color + '"><input type="checkbox" id="pwUpper" checked> 大写 A-Z</label>' +
              '<label class="check on" style="--accent:' + t.color + '"><input type="checkbox" id="pwLower" checked> 小写 a-z</label>' +
              '<label class="check on" style="--accent:' + t.color + '"><input type="checkbox" id="pwNum" checked> 数字 0-9</label>' +
              '<label class="check" style="--accent:' + t.color + '"><input type="checkbox" id="pwSym"> 符号 !@#$</label>' +
              '<label class="check" style="--accent:' + t.color + '"><input type="checkbox" id="pwNoAmb"> 排除易混字符 il1Lo0O</label>' +
            '</div>' +
            '<div class="btn-row" style="margin-top:18px">' +
              '<button class="btn primary block" id="pwGen" style="--accent:' + t.color + '">🎲 生成密码</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="panel pw-stage" style="--accent:' + t.color + '">' +
            '<div class="pw-out" id="pwOut">点「生成密码」开始</div>' +
            '<div class="strength" id="pwBar"><i></i><i></i><i></i><i></i></div>' +
            '<div class="btn-row" style="justify-content:center">' +
              '<button class="btn dark" id="pwCopy">复制密码</button>' +
            '</div>' +
          '</div>' +
          '<div class="panel">' +
            '<p class="panel-title">本次记录（点击复制）</p>' +
            '<div class="pw-history" id="pwHist"><div class="tag">还没有记录</div></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var els = {
      len: $('#pwLen'), lenVal: $('#pwLenVal'),
      upper: $('#pwUpper'), lower: $('#pwLower'), num: $('#pwNum'), sym: $('#pwSym'), noAmb: $('#pwNoAmb'),
      out: $('#pwOut'), bar: $('#pwBar'), hist: $('#pwHist')
    };
    var current = '';

    $$('.check input', app).forEach(function (cb) {
      cb.addEventListener('change', function () { cb.closest('.check').classList.toggle('on', cb.checked); });
    });
    els.len.addEventListener('input', function () { els.lenVal.textContent = this.value; });

    function gen() {
      var sets = [];
      if (els.upper.checked) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      if (els.lower.checked) sets.push('abcdefghijklmnopqrstuvwxyz');
      if (els.num.checked) sets.push('0123456789');
      if (els.sym.checked) sets.push('!@#$%^&*()-_=+[]{};:,.<>?');
      if (!sets.length) { toast('至少勾选一种字符'); return; }
      var pool = sets.join('');
      if (els.noAmb.checked) pool = pool.replace(/[il1Lo0O]/g, '');
      if (!pool) { toast('排除后没有可用字符了'); return; }
      var len = Number(els.len.value), out = '';
      for (var i = 0; i < len; i++) out += pool[secureInt(pool.length)];
      current = out;
      els.out.textContent = out;
      // 强度：长度 + 字符集种类 + 符号
      var kinds = sets.length + (els.sym.checked ? 1 : 0);
      var score = 1;
      if (len >= 10) score = 2;
      if (len >= 14 && kinds >= 3) score = 3;
      if (len >= 18 && kinds >= 4) score = 4;
      $$('i', els.bar).forEach(function (bar, idx) { bar.className = idx < score ? 'lv' + score : ''; });
      history.unshift(out);
      if (history.length > 6) history.pop();
      renderHist();
    }
    function renderHist() {
      els.hist.innerHTML = history.map(function (h) {
        return '<div class="h-item" data-p="' + h.replace(/"/g, '&quot;') + '"><span>点击复制</span>' +
          (h.length > 24 ? h.slice(0, 24) + '…' : h) + '</div>';
      }).join('');
      $$('.h-item', els.hist).forEach(function (item) {
        item.addEventListener('click', function () { copy(item.getAttribute('data-p'), '已复制该密码'); });
      });
    }
    $('#pwGen').addEventListener('click', gen);
    $('#pwCopy').addEventListener('click', function () { current ? copy(current, '密码已复制') : toast('还没生成呢'); });
    gen();
  }

  /* ============================================================
     02 配色制造机
     ============================================================ */
  function hslToHex(h, s, l) {
    l /= 100; s /= 100;
    var a = s * Math.min(l, 1 - l);
    function f(n) {
      var k = (n + h / 30) % 12, c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * c).toString(16).padStart(2, '0');
    }
    return '#' + f(0) + f(8) + f(4);
  }
  function niceColor() {
    return hslToHex(secureInt(360), 62 + secureInt(28), 48 + secureInt(16));
  }
  function viewPalette() {
    var t = BY_ID.palette;
    var colors = ['#ffd400', '#ff4d2e', '#2e6bff', '#12b35f', '#8b5cf6'];
    var locked = [false, false, false, false, false];

    app.innerHTML = head(t, '配色<span class="hl">制造机</span>', '高饱和撞色随机生成，锁定中意的色块再继续摇。') +
      '<div class="panel" style="--accent:' + t.color + '">' +
        '<div class="btn-row" style="margin-bottom:18px">' +
          '<button class="btn primary" id="palRoll" style="--accent:' + t.color + '">🎲 全部随机</button>' +
          '<button class="btn" id="palUnlock">🔓 全部解锁</button>' +
          '<button class="btn dark" id="palCss">导出 CSS 变量</button>' +
        '</div>' +
        '<div class="pal-row" id="palRow"></div>' +
        '<div class="pal-preview" id="palPreview"></div>' +
      '</div>';

    var row = $('#palRow'), preview = $('#palPreview'), cssOut = null;

    function render() {
      row.innerHTML = colors.map(function (c, i) {
        return '<div class="swatch">' +
          '<div class="sw-color' + (locked[i] ? ' locked' : '') + '" data-copy="' + i + '" style="background:' + c + '" title="点击复制"></div>' +
          '<div class="sw-meta">' + c.toUpperCase() + '</div>' +
          '<div class="sw-acts">' +
            '<button data-lock="' + i + '">' + (locked[i] ? '解锁' : '锁定') + '</button>' +
            '<button data-roll="' + i + '">换它</button>' +
          '</div></div>';
      }).join('');
      preview.innerHTML = colors.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('');

      $$('.sw-color', row).forEach(function (el) {
        el.addEventListener('click', function () { copy(colors[Number(el.getAttribute('data-copy'))], '颜色值已复制'); });
      });
      $$('[data-lock]', row).forEach(function (b) {
        b.addEventListener('click', function () {
          var i = Number(b.getAttribute('data-lock')); locked[i] = !locked[i]; render();
        });
      });
      $$('[data-roll]', row).forEach(function (b) {
        b.addEventListener('click', function () {
          var i = Number(b.getAttribute('data-roll')); colors[i] = niceColor(); render();
        });
      });
    }
    $('#palRoll').addEventListener('click', function () {
      colors = colors.map(function (c, i) { return locked[i] ? c : niceColor(); });
      render();
    });
    $('#palUnlock').addEventListener('click', function () {
      locked = locked.map(function () { return false; }); render(); toast('已全部解锁');
    });
    $('#palCss').addEventListener('click', function () {
      copy(':root {\n' + colors.map(function (c, i) { return '  --color-' + (i + 1) + ': ' + c + ';'; }).join('\n') + '\n}', 'CSS 变量已复制');
    });
    render();
  }

  /* ============================================================
     03 占位文工厂
     ============================================================ */
  var LOREM_WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');
  var JARGON = {
    subj: ['我们', '团队', '业务侧', '产品', '平台', '生态', '组织', '赛道', '用户心智', '商业模式', '底层逻辑', '护城河'],
    verb: ['赋能', '击穿', '打通', '沉淀', '撬动', '拉齐', '对焦', '收口', '跑通', '复用', '串联', '倒逼'],
    obj: ['抓手', '闭环', '颗粒度', '组合拳', '心智', '势能', '调性', '盘口', '水位', '基本盘', '增长点', '交付物'],
    tail: [
      '从而在差异化竞争中建立自己的壁垒',
      '最终形成可复用的方法论沉淀',
      '让整个链路的效率得到指数级提升',
      '在不确定性中找到确定性的增长路径',
      '实现从点到线、再到面的全面升级',
      '把资源真正聚焦到高价值场景上',
      '让每一次动作都可量化、可归因、可迭代',
      '完成从「做了」到「做成」的关键跨越'
    ]
  };
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function loremSentence() {
    var n = 8 + secureInt(10), words = [];
    for (var i = 0; i < n; i++) words.push(LOREM_WORDS[secureInt(LOREM_WORDS.length)]);
    return cap(words.join(' ')) + '.';
  }
  function jargonSentence() {
    var a = JARGON.subj[secureInt(JARGON.subj.length)];
    return '从' + a + '的角度来看，我们需要通过' +
      JARGON.verb[secureInt(JARGON.verb.length)] + JARGON.obj[secureInt(JARGON.obj.length)] + '，' +
      '持续' + JARGON.verb[secureInt(JARGON.verb.length)] + JARGON.obj[secureInt(JARGON.obj.length)] + '，' +
      JARGON.tail[secureInt(JARGON.tail.length)] + '。';
  }
  function viewLorem() {
    var t = BY_ID.lorem;
    app.innerHTML = head(t, '占位文<span class="hl">工厂</span>', '排版占位用的假文本。一本正经模式，和互联网黑话模式。') +
      '<div class="panel" style="--accent:' + t.color + '">' +
        '<div class="fld-row" style="justify-content:space-between">' +
          '<div class="seg" id="lorSeg">' +
            '<button data-m="lorem" class="on">Lorem Ipsum</button>' +
            '<button data-m="jargon">互联网黑话</button>' +
          '</div>' +
          '<div class="fld-row">' +
            '<label class="fld" style="margin:0">段落</label>' +
            '<select id="lorPar" style="width:90px">' + [1,2,3,4,5,6,8].map(function (n) {
              return '<option value="' + n + '"' + (n === 3 ? ' selected' : '') + '>' + n + '</option>';
            }).join('') + '</select>' +
            '<button class="btn primary" id="lorGen" style="--accent:' + t.color + '">🎲 重新生成</button>' +
          '</div>' +
        '</div>' +
        '<div class="lorem-out" id="lorOut"></div>' +
        '<div class="btn-row" style="margin-top:14px"><button class="btn dark" id="lorCopy">复制全文</button></div>' +
      '</div>';

    var mode = 'lorem', out = $('#lorOut');
    function gen() {
      var paras = Number($('#lorPar').value), parts = [];
      for (var p = 0; p < paras; p++) {
        var n = 3 + secureInt(4), sents = [];
        for (var i = 0; i < n; i++) sents.push(mode === 'lorem' ? loremSentence() : jargonSentence());
        parts.push(sents.join(mode === 'lorem' ? ' ' : ''));
      }
      out.textContent = parts.join('\n\n');
    }
    $$('#lorSeg button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#lorSeg button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on'); mode = b.getAttribute('data-m'); gen();
      });
    });
    $('#lorPar').addEventListener('change', gen);
    $('#lorGen').addEventListener('click', gen);
    $('#lorCopy').addEventListener('click', function () { copy(out.textContent, '占位文已复制'); });
    gen();
  }

  /* ============================================================
     04 Markdown 小笔记本
     ============================================================ */
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function mdInline(text) {
    return text
      .replace(/`([^`]+)`/g, function (m, c) { return '<code>' + c + '</code>'; })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function parseMd(src) {
    var blocks = [];
    src = src.replace(/```[\s\S]*?```/g, function (b) {
      blocks.push(b);
      return '\u0000' + (blocks.length - 1) + '\u0000';
    });
    var lines = escapeHtml(src).split('\n'), html = [], i = 0;
    while (i < lines.length) {
      var line = lines[i];
      var m;
      if (line.trim() === '\u0000') { i++; continue; }
      var cb = line.match(/^\u0000(\d+)\u0000$/);
      if (cb) {
        var raw = blocks[Number(cb[1])].replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
        html.push('<pre><code>' + raw.replace(/^\n+|\n+$/g, '') + '</code></pre>');
        i++; continue;
      }
      if (/^\s*$/.test(line)) { i++; continue; }
      if (/^(\s*[-*]\s+)/.test(line)) {
        var items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push('<li>' + mdInline(lines[i].replace(/^\s*[-*]\s+/, '')) + '</li>'); i++; }
        html.push('<ul>' + items.join('') + '</ul>'); continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        var ol = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { ol.push('<li>' + mdInline(lines[i].replace(/^\s*\d+\.\s+/, '')) + '</li>'); i++; }
        html.push('<ol>' + ol.join('') + '</ol>'); continue;
      }
      if (/^&gt;\s?/.test(line)) {
        var q = [];
        while (i < lines.length && /^&gt;\s?/.test(lines[i])) { q.push(lines[i].replace(/^&gt;\s?/, '')); i++; }
        html.push('<blockquote>' + mdInline(q.join('<br>')) + '</blockquote>'); continue;
      }
      if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { html.push('<hr>'); i++; continue; }
      if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
        html.push('<h' + m[1].length + '>' + mdInline(m[2]) + '</h' + m[1].length + '>'); i++; continue;
      }
      // 普通段落（合并连续行）
      var para = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) &&
             !/^(#{1,6}\s|```|\s*[-*]\s|\s*\d+\.\s|&gt;\s|---|\u0000)/.test(lines[i])) {
        para.push(lines[i]); i++;
      }
      html.push('<p>' + mdInline(para.join('<br>')) + '</p>');
    }
    return html.join('\n');
  }
  function viewMarkdown() {
    var t = BY_ID.markdown;
    var DEMO = '# 欢迎使用 MD 小笔记本\n\n左边写 **Markdown**，右边立刻出效果。草稿会自动保存在 *本机浏览器*。\n\n## 支持的语法\n\n- **加粗**、*斜体*、~~删除线~~、`行内代码`\n- 标题、列表、引用、分割线\n- [链接](https://example.com)\n- 代码块：\n\n```\nfunction hello(name) {\n  return "你好，" + name;\n}\n```\n\n> 提示：试试上方工具栏的按钮。\n\n---\n\n开始把这段替换成你自己的内容吧。';
    var saved = '';
    try { saved = localStorage.getItem('funbox-md'); } catch (e) {}

    app.innerHTML = head(t, 'MD <span class="hl">小笔记本</span>', '极简 Markdown 编辑器，左右分屏，本地自动存草稿。') +
      '<div class="md-layout" style="--accent:' + t.color + '">' +
        '<div class="md-editor">' +
          '<div class="md-toolbar">' +
            '<button data-ins="h1" title="一级标题">H1</button>' +
            '<button data-ins="h2" title="二级标题">H2</button>' +
            '<button data-ins="bold" title="加粗">B</button>' +
            '<button data-ins="italic" title="斜体">I</button>' +
            '<button data-ins="code" title="行内代码">&lt;/&gt;</button>' +
            '<button data-ins="link" title="链接">链接</button>' +
            '<button data-ins="list" title="列表">• 列表</button>' +
            '<button data-ins="quote" title="引用">引用</button>' +
            '<button data-ins="block" title="代码块">{ }</button>' +
          '</div>' +
          '<textarea id="mdInput" spellcheck="false" placeholder="在这里写 Markdown…">' + escapeHtml(saved || DEMO) + '</textarea>' +
        '</div>' +
        '<div class="md-preview" id="mdView"></div>' +
      '</div>' +
      '<div class="btn-row" style="margin:14px 0 0">' +
        '<span class="tag" id="mdCount">0 字</span>' +
        '<button class="btn sm" id="mdCopy">复制 Markdown</button>' +
        '<button class="btn sm dark" id="mdClear">清空</button>' +
        '<button class="btn sm" id="mdDemo">载入示例</button>' +
      '</div>';

    var input = $('#mdInput'), view = $('#mdView'), count = $('#mdCount'), saveT;
    function render() {
      view.innerHTML = parseMd(input.value) || '<p style="color:#999">预览区…</p>';
      count.textContent = input.value.replace(/\s/g, '').length + ' 字';
      clearTimeout(saveT);
      saveT = setTimeout(function () { try { localStorage.setItem('funbox-md', input.value); } catch (e) {} }, 300);
    }
    input.addEventListener('input', render);

    function wrap(before, after, placeholder) {
      var s = input.selectionStart, e = input.selectionEnd, val = input.value;
      var sel = val.slice(s, e) || placeholder;
      input.value = val.slice(0, s) + before + sel + after + val.slice(e);
      input.focus();
      input.setSelectionRange(s + before.length, s + before.length + sel.length);
      render();
    }
    function linePrefix(prefix) {
      var s = input.selectionStart, val = input.value;
      var ls = val.lastIndexOf('\n', s - 1) + 1;
      input.value = val.slice(0, ls) + prefix + val.slice(ls);
      input.focus(); input.selectionStart = input.selectionEnd = s + prefix.length;
      render();
    }
    var INS = {
      h1: function () { linePrefix('# '); }, h2: function () { linePrefix('## '); },
      bold: function () { wrap('**', '**', '加粗文字'); },
      italic: function () { wrap('*', '*', '斜体文字'); },
      code: function () { wrap('`', '`', 'code'); },
      link: function () { wrap('[', '](https://)', '链接文字'); },
      list: function () { linePrefix('- '); },
      quote: function () { linePrefix('> '); },
      block: function () { wrap('\n```\n', '\n```\n', '代码'); }
    };
    $$('.md-toolbar button').forEach(function (b) {
      b.addEventListener('click', function () { INS[b.getAttribute('data-ins')](); });
    });
    $('#mdCopy').addEventListener('click', function () { copy(input.value, 'Markdown 已复制'); });
    $('#mdClear').addEventListener('click', function () { input.value = ''; render(); input.focus(); toast('已清空'); });
    $('#mdDemo').addEventListener('click', function () { input.value = DEMO; render(); toast('已载入示例'); });
    render();
  }

  /* ============================================================
     05 文本加工台
     ============================================================ */
  function viewText() {
    var t = BY_ID.text;
    app.innerHTML = head(t, '文本<span class="hl">加工台</span>', '十二种一键处理：改大小写、清洗空白、去重、排序、反转。') +
      '<div class="stat-row" style="--accent:' + t.color + ';margin-bottom:18px">' +
        '<div class="stat acc"><b id="stChar">0</b><span>总字符数</span></div>' +
        '<div class="stat"><b id="stNoSpace">0</b><span>不含空白</span></div>' +
        '<div class="stat"><b id="stLine">0</b><span>行数</span></div>' +
        '<div class="stat"><b id="stByte">0</b><span>UTF-8 字节</span></div>' +
      '</div>' +
      '<div class="panel">' +
        '<textarea id="txtInput" rows="10" spellcheck="false" placeholder="把文本粘贴到这里…"></textarea>' +
        '<div class="op-grid" style="margin-top:14px">' +
          '<button class="btn" data-op="upper">ABC 全大写</button>' +
          '<button class="btn" data-op="lower">abc 全小写</button>' +
          '<button class="btn" data-op="cap">每行首字母大写</button>' +
          '<button class="btn" data-op="reverseAll">文字倒序</button>' +
          '<button class="btn" data-op="reverseLine">每行字符倒序</button>' +
          '<button class="btn" data-op="noSpace">删除所有空格</button>' +
          '<button class="btn" data-op="trimLine">每行去首尾空格</button>' +
          '<button class="btn" data-op="squeezeBlank">压缩连续空行</button>' +
          '<button class="btn" data-op="dedup">去重复行</button>' +
          '<button class="btn" data-op="sortAsc">行 A→Z 排序</button>' +
          '<button class="btn" data-op="sortDesc">行 Z→A 排序</button>' +
          '<button class="btn" data-op="numberLine">添加行号</button>' +
        '</div>' +
        '<div class="btn-row" style="margin-top:14px">' +
          '<button class="btn primary" id="txtCopy" style="--accent:' + t.color + '">复制结果</button>' +
          '<button class="btn dark" id="txtClear">清空</button>' +
          '<button class="btn" id="txtSample">载入示例</button>' +
        '</div>' +
      '</div>';

    var input = $('#txtInput');
    var SAMPLE = 'banana\nApple\ncherry\napple\n  banana  \nBanana\n\n\n  两边带空格的行  \n123 456\nhello WORLD';
    function update() {
      var v = input.value;
      $('#stChar').textContent = v.length;
      $('#stNoSpace').textContent = v.replace(/\s/g, '').length;
      $('#stLine').textContent = v ? v.split('\n').length : 0;
      try { $('#stByte').textContent = new Blob([v]).size; } catch (e) { $('#stByte').textContent = '-'; }
    }
    input.addEventListener('input', update);

    var OPS = {
      upper: function (v) { return v.toUpperCase(); },
      lower: function (v) { return v.toLowerCase(); },
      cap: function (v) {
        return v.split('\n').map(function (l) {
          var m = l.match(/^\s*/);
          return m[0] + (l[m[0].length] || '').toUpperCase() + l.slice(m[0].length + 1);
        }).join('\n');
      },
      reverseAll: function (v) { return v.split('').reverse().join(''); },
      reverseLine: function (v) { return v.split('\n').map(function (l) { return l.split('').reverse().join(''); }).join('\n'); },
      noSpace: function (v) { return v.replace(/[ \t\u00a0]/g, ''); },
      trimLine: function (v) { return v.split('\n').map(function (l) { return l.trim(); }).join('\n'); },
      squeezeBlank: function (v) { return v.replace(/\n{3,}/g, '\n\n').replace(/^\n+/, ''); },
      dedup: function (v) {
        var seen = {};
        return v.split('\n').filter(function (l) {
          var k = l.trim();
          if (k === '' || seen[k]) return false;
          seen[k] = true; return true;
        }).join('\n');
      },
      sortAsc: function (v) { return v.split('\n').filter(function (l) { return l.trim(); }).sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); }).join('\n'); },
      sortDesc: function (v) { return v.split('\n').filter(function (l) { return l.trim(); }).sort(function (a, b) { return b.localeCompare(a, 'zh-CN'); }).join('\n'); },
      numberLine: function (v) {
        var n = v.split('\n').length;
        var w = String(n).length;
        return v.split('\n').map(function (l, i) { return String(i + 1).padStart(w, '0') + '. ' + l; }).join('\n');
      }
    };
    $$('[data-op]').forEach(function (b) {
      b.addEventListener('click', function () {
        input.value = OPS[b.getAttribute('data-op')](input.value);
        update(); toast('已处理：' + b.textContent);
      });
    });
    $('#txtCopy').addEventListener('click', function () { input.value ? copy(input.value, '文本已复制') : toast('还没有内容'); });
    $('#txtClear').addEventListener('click', function () { input.value = ''; update(); });
    $('#txtSample').addEventListener('click', function () { input.value = SAMPLE; update(); });
    update();
  }

  /* ============================================================
     06 番茄时钟
     ============================================================ */
  function beep(times) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC();
      for (var n = 0; n < times; n++) {
        (function (n) {
          setTimeout(function () {
            var o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = 'square'; o.frequency.value = n % 2 ? 660 : 880;
            g.gain.setValueAtTime(.18, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .25);
            o.start(); o.stop(ctx.currentTime + .25);
          }, n * 380);
        })(n);
      }
    } catch (e) {}
  }
  function viewPomodoro() {
    var t = BY_ID.pomodoro;
    var MODES = [
      { id: 'focus', name: '专注工作', min: 25, color: '#ffd400' },
      { id: 'short', name: '短休息', min: 5, color: '#19c2d6' },
      { id: 'long', name: '长休息', min: 15, color: '#12b35f' }
    ];
    var mode = MODES[0], remaining = mode.min * 60, running = false, endAt = 0, rounds = 0;

    app.innerHTML = head(t, '番茄<span class="hl">时钟</span>', '25 分钟干活，5 分钟喘气。每完成 4 个番茄，奖励一次长休息。') +
      '<div class="pomo">' +
        '<div class="pomo-clock" id="pomoClock">' +
          '<span class="mode-tag" id="pomoMode">FOCUS</span>' +
          '<div class="pomo-time" id="pomoTime">25:00</div>' +
          '<div class="pomo-round">已完成番茄 <b id="pomoRound">0</b><span class="dots" id="pomoDots"><i></i><i></i><i></i><i></i></span></div>' +
          '<div class="btn-row" style="justify-content:center">' +
            '<button class="btn primary" id="pomoStart" style="--accent:#ffd400">开始</button>' +
            '<button class="btn" id="pomoReset" style="background:#fff">重置</button>' +
            '<button class="btn" id="pomoSkip" style="background:#fff">跳过</button>' +
          '</div>' +
        '</div>' +
        '<div class="pomo-side">' +
          '<div class="pomo-modes" id="pomoModes">' +
            MODES.map(function (m, i) {
              return '<button data-m="' + i + '" class="' + (i === 0 ? 'on' : '') + '">' + m.name + '<small>' + m.min + ':00</small></button>';
            }).join('') +
          '</div>' +
          '<div class="panel" style="margin:0">' +
            '<p class="panel-title">玩法</p>' +
            '<p style="margin:0;font-size:13.5px;font-weight:600">① 选定一个任务 → ② 点开始，这 25 分钟只做这件事 → ③ 响铃后休息，划掉一个番茄。<br><br>短休息 5 分钟、长休息 15 分钟会自动轮转，你只管点开始。</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    var els = {
      time: $('#pomoTime'), modeTag: $('#pomoMode'), round: $('#pomoRound'), dots: $('#pomoDots'),
      clock: $('#pomoClock'), start: $('#pomoStart')
    };
    function fmt(s) {
      var m = Math.floor(s / 60), r = s % 60;
      return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
    }
    function paint() {
      els.time.textContent = fmt(remaining);
      els.modeTag.textContent = mode.id.toUpperCase();
      els.modeTag.style.background = mode.color;
      els.round.textContent = rounds;
      $$('i', els.dots).forEach(function (d, i) { d.classList.toggle('on', i < rounds % 4); });
      els.start.textContent = running ? '暂停' : '开始';
      document.title = (running || remaining !== mode.min * 60 ? fmt(remaining) + ' · ' : '') + 'FUNBOX 玩盒';
    }
    function setMode(idx) {
      mode = MODES[idx]; remaining = mode.min * 60; running = false;
      clearPomo();
      $$('#pomoModes button').forEach(function (b, i) { b.classList.toggle('on', i === idx); });
      paint();
    }
    function tick() {
      remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      if (remaining <= 0) { finish(); return; }
      paint();
    }
    function finish() {
      clearPomo(); running = false;
      if (mode.id === 'focus') {
        rounds++;
        beep(3);
        toast('🎉 一个番茄完成，去休息！');
        setMode(rounds % 4 === 0 ? 2 : 1);
      } else {
        beep(2);
        toast('休息结束，回来继续！');
        setMode(0);
      }
      running = true; endAt = Date.now() + remaining * 1000;
      pomoTimer = setInterval(tick, 250);
      paint();
    }
    els.start.addEventListener('click', function () {
      if (running) { running = false; clearPomo(); paint(); return; }
      running = true; endAt = Date.now() + remaining * 1000;
      pomoTimer = setInterval(tick, 250);
      paint();
    });
    $('#pomoReset').addEventListener('click', function () { setMode(MODES.indexOf(mode)); });
    $('#pomoSkip').addEventListener('click', function () { remaining = 1; if (!running) { running = true; endAt = Date.now() + 1000; pomoTimer = setInterval(tick, 250); } });
    $$('#pomoModes button').forEach(function (b) {
      b.addEventListener('click', function () { setMode(Number(b.getAttribute('data-m'))); });
    });
    paint();
  }

  /* ============================================================
     07 帮我决定
     ============================================================ */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function viewPicker() {
    var t = BY_ID.picker;
    var DEFAULT_OPTS = ['吃火锅', '吃日料', '吃烧烤', '吃沙拉', '吃泡面', '再想想'];
    var rolling = false;

    app.innerHTML = head(t, '帮我<span class="hl">决定</span>', '把纠结的选项丢进来，命运（随机数）替你拍板。') +
      '<div class="grid-2">' +
        '<div class="panel" style="--accent:' + t.color + '">' +
          '<p class="panel-title">候选选项（每行一个）</p>' +
          '<textarea id="pickOpts" rows="9" spellcheck="false">' + DEFAULT_OPTS.join('\n') + '</textarea>' +
          '<div class="fld-row" style="margin-top:14px">' +
            '<label class="fld" style="margin:0">抽出</label>' +
            '<select id="pickN" style="width:80px"><option value="1">1 个</option><option value="2">2 个</option><option value="3">3 个</option></select>' +
          '</div>' +
        '</div>' +
        '<div class="panel pick-stage" style="--accent:' + t.color + '">' +
          '<span class="tag">命运的答案是</span>' +
          '<div class="pick-result rolling" id="pickResult">点下面按钮</div>' +
          '<button class="btn primary" id="pickGo" style="--accent:' + t.color + ';font-size:17px;padding:15px 34px">🎯 帮我决定！</button>' +
        '</div>' +
      '</div>';

    var result = $('#pickResult');
    function getOpts() {
      var seen = {}, list = [];
      $('#pickOpts').value.split('\n').forEach(function (l) {
        var v = l.trim();
        if (v && !seen[v]) { seen[v] = true; list.push(v); }
      });
      return list;
    }
    $('#pickGo').addEventListener('click', async function () {
      if (rolling) return;
      var opts = getOpts(), n = Math.min(Number($('#pickN').value), opts.length);
      if (!opts.length) { toast('至少写一个选项吧'); return; }
      if (opts.length < n) { toast('选项不够 ' + n + ' 个'); return; }
      rolling = true;
      result.classList.remove('done'); result.classList.add('rolling');
      var total = 2000, elapsed = 0, delay = 70;
      while (elapsed < total) {
        result.textContent = opts[secureInt(opts.length)];
        await sleep(delay);
        elapsed += delay;
        delay = 70 + Math.pow(elapsed / total, 2.5) * 320;
      }
      // Fisher–Yates 抽取 n 个
      var pool = opts.slice();
      for (var i = pool.length - 1; i > 0; i--) {
        var j = secureInt(i + 1), tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
      }
      var wins = pool.slice(0, n);
      result.textContent = wins.join('　·　');
      result.classList.remove('rolling'); result.classList.add('done');
      rolling = false;
      beep(n === 1 ? 2 : 3);
    });
  }

  /* ============================================================
     08 图片压一压
     ============================================================ */
  function viewImage() {
    var t = BY_ID.image;
    app.innerHTML = head(t, '图片<span class="hl">压一压</span>', '拖入图片，本地 Canvas 压缩与缩放，不上传、不加水印。') +
      '<label class="dropzone" id="imgDrop" style="--accent:' + t.color + '">' +
        '<span class="dz-ico">🖼️</span><b>点击选择 / 直接拖入图片</b>' +
        '<span>支持 JPG · PNG · WebP · GIF（仅首帧）</span>' +
        '<input type="file" id="imgFile" accept="image/*" hidden>' +
      '</label>' +
      '<div id="imgPanel" style="display:none;margin-top:20px">' +
        '<div class="panel" style="--accent:' + t.color + '">' +
          '<div class="fld-row" style="gap:24px">' +
            '<div style="flex:1;min-width:200px"><label class="fld">输出格式</label>' +
              '<select id="imgFmt"><option value="jpeg">JPEG（体积小）</option><option value="webp">WebP（更优）</option><option value="png">PNG（无损）</option></select>' +
            '</div>' +
            '<div style="flex:1;min-width:200px"><label class="fld">最大宽度（等比缩放）</label>' +
              '<select id="imgMaxW"><option value="0">保持原尺寸</option><option value="1920">1920 px</option><option value="1280" selected>1280 px</option><option value="800">800 px</option></select>' +
            '</div>' +
            '<div style="flex:1;min-width:200px"><label class="fld">画质 <b id="imgQVal" style="font-family:var(--mono)">82</b>%</label>' +
              '<input type="range" id="imgQ" min="20" max="100" value="82"></div>' +
          '</div>' +
        '</div>' +
        '<div class="panel"><div class="img-result">' +
          '<img id="imgPrev" alt="预览">' +
          '<div>' +
            '<table class="compare-table" id="imgTable"></table>' +
            '<div class="btn-row" style="margin-top:16px"><button class="btn primary" id="imgDl" style="--accent:' + t.color + '">⬇ 下载压缩后图片</button></div>' +
          '</div>' +
        '</div></div>' +
      '</div>';

    var file = null, dataUrl = '', outBlob = null, outName = 'image';
    var drop = $('#imgDrop'), panel = $('#imgPanel');

    $('#imgFile').addEventListener('change', function () { if (this.files[0]) loadFile(this.files[0]); });
    ['dragover', 'dragenter'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); });
    });
    drop.addEventListener('drop', function (e) { if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); });

    function loadFile(f) {
      if (!/^image\//.test(f.type)) { toast('请选择图片文件'); return; }
      file = f;
      dataUrl = URL.createObjectURL(f);
      $('#imgPrev').src = dataUrl;
      panel.style.display = 'block';
      process();
    }
    function process() {
      if (!file) return;
      var fmt = $('#imgFmt').value, q = Number($('#imgQ').value) / 100, maxW = Number($('#imgMaxW').value);
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height, nw = w, nh = h;
        if (maxW && w > maxW) { nw = maxW; nh = Math.round(h * maxW / w); }
        var canvas = document.createElement('canvas');
        canvas.width = nw; canvas.height = nh;
        var ctx = canvas.getContext('2d');
        if (fmt === 'jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, nw, nh); }
        ctx.drawImage(img, 0, 0, nw, nh);
        var type = 'image/' + fmt;
        canvas.toBlob(function (blob) {
          if (!blob) { toast('当前浏览器不支持该格式输出'); return; }
          outBlob = blob;
          var base = file.name.replace(/\.[^.]+$/, '');
          var ext = fmt === 'jpeg' ? 'jpg' : fmt;
          outName = base + '-funbox.' + ext;
          var ratio = file.size ? Math.round((1 - blob.size / file.size) * 100) : 0;
          var dim = w + ' × ' + h;
          var dim2 = nw + ' × ' + nh;
          $('#imgTable').innerHTML =
            '<tr><td>文件</td><td>' + escapeHtml(file.name) + '</td></tr>' +
            '<tr><td>原始大小</td><td>' + humanSize(file.size) + '</td></tr>' +
            '<tr><td>压缩后</td><td>' + humanSize(blob.size) + '</td></tr>' +
            '<tr><td>体积变化</td><td><span class="' + (ratio >= 0 ? 'save' : 'bigger') + '">' +
              (ratio >= 0 ? '减小 ' + ratio + '%' : '反而增大 ' + Math.abs(ratio) + '%（建议换格式/提高画质）') + '</span></td></tr>' +
            '<tr><td>原始尺寸</td><td>' + dim + '</td></tr>' +
            '<tr><td>输出尺寸</td><td>' + dim2 + (dim !== dim2 ? '（已缩放）' : '') + '</td></tr>';
        }, type, fmt === 'png' ? undefined : q);
      };
      img.src = dataUrl;
    }
    $('#imgFmt').addEventListener('change', function () {
      var png = this.value === 'png';
      $('#imgQ').disabled = png;
      process();
    });
    $('#imgMaxW').addEventListener('change', process);
    $('#imgQ').addEventListener('input', function () { $('#imgQVal').textContent = this.value; });
    $('#imgQ').addEventListener('change', process);
    $('#imgDl').addEventListener('click', function () {
      if (!outBlob) return;
      var a = document.createElement('a');
      a.href = URL.createObjectURL(outBlob); a.download = outName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast('开始下载');
    });
  }

  /* ============================================================
     路由
     ============================================================ */
  var TITLES = {
    '': '首页', password: '密钥制造机', palette: '配色制造机', lorem: '占位文工厂',
    markdown: 'MD 小笔记本', text: '文本加工台', pomodoro: '番茄时钟', picker: '帮我决定', image: '图片压一压'
  };
  function route() {
    clearPomo();
    var id = (location.hash || '#/').replace(/^#\/?/, '').split('?')[0].split('/')[0];
    var map = {
      '': viewHome, password: viewPassword, palette: viewPalette, lorem: viewLorem,
      markdown: viewMarkdown, text: viewText, pomodoro: viewPomodoro, picker: viewPicker, image: viewImage
    };
    if (!map[id]) { id = ''; location.hash = '#/'; }
    map[id]();
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === id); });
    document.title = (id ? TITLES[id] + ' · ' : '') + 'FUNBOX 玩盒 · 在线趣味工具箱';
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
