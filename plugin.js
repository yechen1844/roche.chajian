/**
 * Roche Hub 悬浮球 v1.0.1
 * 全局悬浮球中心 — 统一入口、快捷跳转、子插件托管、全局心跳引擎
 *
 * 修复：
 * - 移除所有 ES2015+ Unicode 转义 \u{...}，替换为直接 emoji 字符
 *   解决 Roche WebView "Invalid or unexpected token" 报错
 */
;(function () {
  'use strict'

  /* ════════════════════════════════════════════════════════════
     CSS 样式 — 精致优雅的视觉系统
     ════════════════════════════════════════════════════════════ */

  var CSS = '.roche-hub-ball{position:fixed;z-index:2147483646;width:50px;height:50px;border-radius:50%;cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#7C3AED 0%,#2563EB 50%,#06B6D4 100%);box-shadow:0 2px 12px rgba(124,58,237,.4),0 0 24px rgba(124,58,237,.15),inset 0 1px 1px rgba(255,255,255,.2);transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s ease;will-change:transform,left,top}.roche-hub-ball:active{cursor:grabbing;transform:scale(1.08);box-shadow:0 4px 20px rgba(124,58,237,.5),0 0 40px rgba(124,58,237,.2)}.roche-hub-ball:hover{box-shadow:0 4px 20px rgba(124,58,237,.5),0 0 40px rgba(124,58,237,.25)}.roche-hub-ball-inner{width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;background-size:cover;background-position:center;background-repeat:no-repeat}.roche-hub-ball-icon{font-size:22px;color:#fff;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3));line-height:1;pointer-events:none}@keyframes rocheHubPulse{0%{box-shadow:0 0 0 0 rgba(124,58,237,.45)}60%{box-shadow:0 0 0 10px rgba(124,58,237,0)}100%{box-shadow:0 0 0 0 rgba(124,58,237,0)}}.roche-hub-ball.idle-pulse{animation:rocheHubPulse 2.5s ease-in-out infinite}.roche-hub-ball.idle-pulse:hover,.roche-hub-ball.idle-pulse:active{animation:none}.roche-hub-overlay{position:fixed;inset:0;z-index:2147483645;background:rgba(0,0,0,.35);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .28s ease}.roche-hub-overlay.visible{opacity:1;pointer-events:auto}.roche-hub-menu{position:fixed;z-index:2147483647;pointer-events:none}.roche-hub-menu-item{position:absolute;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:auto;cursor:pointer;opacity:0;transform:scale(.3);transition:opacity .3s ease,transform .35s cubic-bezier(.34,1.56,.64,1)}.roche-hub-menu-item.show{opacity:1;transform:scale(1)}.roche-hub-menu-btn{width:44px;height:44px;border-radius:50%;background:rgba(30,30,42,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;color:#E2E8F0;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.06);transition:transform .2s ease,background .2s ease,box-shadow .2s ease}.roche-hub-menu-btn:hover{transform:scale(1.12);background:rgba(55,55,75,.95);box-shadow:0 4px 14px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.08)}.roche-hub-menu-btn:active{transform:scale(.95)}.roche-hub-menu-label{font-size:11px;color:#E2E8F0;text-shadow:0 1px 3px rgba(0,0,0,.7);white-space:nowrap;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.02em}.roche-hub-app{--hub-bg:#0f0f14;--hub-surface:#1a1a24;--hub-surface2:#222230;--hub-border:rgba(255,255,255,.07);--hub-text:#E2E8F0;--hub-text2:#94A3B8;--hub-accent:#7C3AED;--hub-accent2:#06B6D4;--hub-radius:14px;height:100%;overflow-y:auto;overflow-x:hidden;background:var(--hub-bg);color:var(--hub-text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-overflow-scrolling:touch}.roche-hub-app::-webkit-scrollbar{width:4px}.roche-hub-app::-webkit-scrollbar-thumb{background:rgba(124,58,237,.3);border-radius:4px}.roche-hub-header{padding:28px 24px 20px;text-align:center;background:linear-gradient(180deg,rgba(124,58,237,.12) 0%,transparent 100%);border-bottom:1px solid var(--hub-border)}.roche-hub-logo{width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,#7C3AED,#2563EB,#06B6D4);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:26px;box-shadow:0 4px 16px rgba(124,58,237,.3)}.roche-hub-title{font-size:20px;font-weight:700;margin:0 0 4px;letter-spacing:-.02em}.roche-hub-subtitle{font-size:13px;color:var(--hub-text2);margin:0}.roche-hub-section{margin:16px 16px 0;background:var(--hub-surface);border-radius:var(--hub-radius);border:1px solid var(--hub-border);overflow:hidden}.roche-hub-section-title{font-size:12px;font-weight:600;color:var(--hub-text2);text-transform:uppercase;letter-spacing:.08em;padding:14px 18px 8px;display:flex;align-items:center;gap:8px}.roche-hub-section-title .icon{font-size:15px}.roche-hub-row{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--hub-border);transition:background .15s ease}.roche-hub-row:last-child{border-bottom:none}.roche-hub-row:active{background:rgba(255,255,255,.03)}.roche-hub-row-label{font-size:14px;font-weight:500;flex:1}.roche-hub-row-desc{font-size:11px;color:var(--hub-text2);margin-top:2px}.roche-hub-row-value{font-size:13px;color:var(--hub-accent2);font-weight:600}.roche-hub-slider-wrap{flex:1;max-width:140px;margin-left:12px}.roche-hub-slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:2px;background:var(--hub-surface2);outline:none}.roche-hub-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,var(--hub-accent),var(--hub-accent2));cursor:pointer;box-shadow:0 2px 6px rgba(124,58,237,.4);transition:transform .15s ease}.roche-hub-slider::-webkit-slider-thumb:hover{transform:scale(1.15)}.roche-hub-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,var(--hub-accent),var(--hub-accent2));cursor:pointer;border:none;box-shadow:0 2px 6px rgba(124,58,237,.4)}.roche-hub-color-picker{-webkit-appearance:none;appearance:none;width:32px;height:32px;border:2px solid var(--hub-border);border-radius:50%;cursor:pointer;padding:0;overflow:hidden}.roche-hub-color-picker::-webkit-color-swatch-wrapper{padding:0}.roche-hub-color-picker::-webkit-color-swatch{border:none;border-radius:50%}.roche-hub-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:10px;border:1px solid var(--hub-border);background:var(--hub-surface2);color:var(--hub-text);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s ease;font-family:inherit}.roche-hub-btn:hover{background:rgba(124,58,237,.15);border-color:rgba(124,58,237,.3)}.roche-hub-btn:active{transform:scale(.97)}.roche-hub-btn-primary{background:linear-gradient(135deg,var(--hub-accent),#2563EB);border:none;color:#fff}.roche-hub-btn-primary:hover{box-shadow:0 4px 12px rgba(124,58,237,.35)}.roche-hub-btn-danger{color:#F87171;border-color:rgba(248,113,113,.2)}.roche-hub-btn-danger:hover{background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.35)}.roche-hub-btn-sm{padding:5px 12px;font-size:12px;border-radius:8px}.roche-hub-shortcut-item{display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:1px solid var(--hub-border);transition:background .15s ease}.roche-hub-shortcut-item:last-child{border-bottom:none}.roche-hub-shortcut-item:active{background:rgba(255,255,255,.03)}.roche-hub-sc-icon{width:36px;height:36px;border-radius:10px;background:var(--hub-surface2);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}.roche-hub-sc-info{flex:1;min-width:0}.roche-hub-sc-name{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.roche-hub-sc-type{font-size:11px;color:var(--hub-text2);margin-top:1px}.roche-hub-sc-actions{display:flex;gap:4px;flex-shrink:0}.roche-hub-sc-action-btn{width:30px;height:30px;border-radius:8px;border:1px solid var(--hub-border);background:transparent;color:var(--hub-text2);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s ease}.roche-hub-sc-action-btn:hover{background:var(--hub-surface2);color:var(--hub-text)}.roche-hub-sc-action-btn.danger:hover{background:rgba(248,113,113,.1);color:#F87171;border-color:rgba(248,113,113,.2)}.roche-hub-modal-mask{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s ease;padding:24px}.roche-hub-modal-mask.show{opacity:1;pointer-events:auto}.roche-hub-modal{width:100%;max-width:380px;max-height:80vh;background:var(--hub-surface);border-radius:18px;border:1px solid var(--hub-border);overflow:hidden;transform:translateY(16px) scale(.97);transition:transform .3s cubic-bezier(.34,1.56,.64,1);display:flex;flex-direction:column}.roche-hub-modal-mask.show .roche-hub-modal{transform:translateY(0) scale(1)}.roche-hub-modal-header{padding:18px 20px 14px;border-bottom:1px solid var(--hub-border);display:flex;align-items:center;justify-content:space-between}.roche-hub-modal-title{font-size:16px;font-weight:700;margin:0}.roche-hub-modal-close{width:30px;height:30px;border-radius:8px;border:none;background:transparent;color:var(--hub-text2);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s ease}.roche-hub-modal-close:hover{background:rgba(255,255,255,.06);color:var(--hub-text)}.roche-hub-modal-body{padding:16px 20px;overflow-y:auto;flex:1}.roche-hub-modal-footer{padding:14px 20px;border-top:1px solid var(--hub-border);display:flex;justify-content:flex-end;gap:8px}.roche-hub-input,.roche-hub-select,.roche-hub-textarea{width:100%;padding:10px 14px;border-radius:10px;border:1px solid var(--hub-border);background:var(--hub-bg);color:var(--hub-text);font-size:14px;font-family:inherit;outline:none;transition:border-color .2s ease,box-shadow .2s ease;box-sizing:border-box}.roche-hub-input:focus,.roche-hub-select:focus,.roche-hub-textarea:focus{border-color:var(--hub-accent);box-shadow:0 0 0 3px rgba(124,58,237,.15)}.roche-hub-select{cursor:pointer;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394A3B8\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}.roche-hub-textarea{resize:vertical;min-height:72px;line-height:1.5}.roche-hub-form-group{margin-bottom:14px}.roche-hub-form-label{display:block;font-size:12px;font-weight:600;color:var(--hub-text2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em}.roche-hub-switch{position:relative;width:44px;height:24px;flex-shrink:0}.roche-hub-switch input{display:none}.roche-hub-switch-track{position:absolute;inset:0;background:var(--hub-surface2);border-radius:12px;cursor:pointer;transition:background .25s ease;border:1px solid var(--hub-border)}.roche-hub-switch-knob{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--hub-text2);transition:transform .25s cubic-bezier(.34,1.56,.64,1),background .25s ease}.roche-hub-switch input:checked+.track{background:var(--hub-accent);border-color:var(--hub-accent)}.roche-hub-switch input:checked+.track .knob{transform:translateX(20px);background:#fff}.roche-hub-empty{padding:32px 20px;text-align:center;color:var(--hub-text2);font-size:13px}.roche-hub-empty-icon{font-size:36px;margin-bottom:10px;opacity:.5}.roche-hub-safe-bottom{height:env(safe-area-inset-bottom,24px)}.roche-hub-hint{font-size:11px;color:var(--hub-text2);padding:8px 18px 12px;line-height:1.5;opacity:.8}.roche-hub-preview-img{width:60px;height:60px;border-radius:14px;object-fit:cover;border:2px solid var(--hub-border)}'

  var DEFAULTS = {
    ball: { size: 50, opacity: 1, colorStart: '#7C3AED', colorMid: '#2563EB', colorEnd: '#06B6D4', customImage: '', shape: 'circle' },
    menu: { radius: 100, itemSize: 44 },
    heartbeat: { enabled: false, intervalMs: 60000 },
    shortcuts: [],
    subPlugins: []
  }

  function uid() { return 'hub-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
  function deepMerge(target, source) {
    var out = Object.assign({}, target)
    for (var k in source) {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        out[k] = deepMerge(target[k] || {}, source[k])
      } else { out[k] = source[k] }
    }
    return out
  }
  function radialPosition(index, total, radius, ballSize) {
    var startAngle, angleStep
    if (total <= 4) { startAngle = -Math.PI * 5 / 6; angleStep = Math.PI * 4 / 6 / (total - 1 || 1) }
    else if (total <= 8) { startAngle = -Math.PI * 17 / 18; angleStep = Math.PI * 16 / 18 / (total - 1 || 1) }
    else { startAngle = -Math.PI * 3 / 4; angleStep = (Math.PI * 270 / 180) / (total - 1 || 1) }
    var angle = startAngle + angleStep * index
    var r = radius + ballSize / 2 + 10
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r }
  }

  function RocheHub(roche) {
    this.roche = roche
    this.config = null
    this.ballEl = null
    this.overlayEl = null
    this.menuEl = null
    this.menuItems = []
    this.styleEl = null
    this.isOpen = false
    this.isDragging = false
    this.dragOffset = { x: 0, y: 0 }
    this.ballPos = { x: 0, y: 0 }
    this._heartbeatTimer = null
    this._heartbeatTasks = []
    this._boundHandlers = {}
    this._container = null
  }

  var _p = RocheHub.prototype

  _p.init = async function(container) {
    this._container = container
    await this._loadConfig()
    this._injectStyles()
    this._createBall()
    this._bindEvents()
    if (this.config.heartbeat.enabled) this._startHeartbeat()
    this._renderAppView()
  }

  _p._loadConfig = async function() {
    try { var s = await this.roche.storage.get('config'); this.config = deepMerge(DEFAULTS, s || {}) }
    catch (e) { console.warn('[RocheHub] load config failed', e); this.config = JSON.parse(JSON.stringify(DEFAULTS)) }
  }

  _p._saveConfig = async function() {
    try { await this.roche.storage.set('config', this.config) }
    catch (e) { console.warn('[RocheHub] save config failed', e) }
  }

  _p._injectStyles = function() {
    this.styleEl = document.createElement('style')
    this.styleEl.textContent = CSS
    document.head.appendChild(this.styleEl)
  }

  _p._createBall = function() {
    var self = this
    var ball = document.createElement('div')
    ball.className = 'roche-hub-ball idle-pulse'
    ball.id = 'roche-hub-ball'
    var inner = document.createElement('div')
    inner.className = 'roche-hub-ball-inner'
    if (this.config.ball.customImage) {
      inner.style.backgroundImage = 'url(' + this.config.ball.customImage + ')'
      inner.style.backgroundSize = 'cover'
    } else {
      var icon = document.createElement('span')
      icon.className = 'roche-hub-ball-icon'
      icon.textContent = '\u2606'
      inner.appendChild(icon)
    }
    ball.appendChild(inner)
    this._applyBallStyle(ball)
    var size = this.config.ball.size
    this.ballPos.x = window.innerWidth - size - 20
    this.ballPos.y = window.innerHeight - size - 100
    ball.style.left = this.ballPos.x + 'px'
    ball.style.top = this.ballPos.y + 'px'
    document.body.appendChild(ball)
    this.ballEl = ball
  }

  _p._applyBallStyle = function(ball) {
    var b = this.config.ball
    var s = b.size
    ball.style.width = s + 'px'
    ball.style.height = s + 'px'
    ball.style.opacity = b.opacity
    if (!b.customImage) {
      ball.style.background = 'linear-gradient(135deg, ' + b.colorStart + ' 0%, ' + b.colorMid + ' 50%, ' + b.colorEnd + ' 100%)'
    } else { ball.style.background = 'transparent' }
    switch (b.shape) {
      case 'rounded': ball.style.borderRadius = '30%'; break
      case 'square': ball.style.borderRadius = '12px'; break
      default: ball.style.borderRadius = '50%'
    }
  }

  _p._bindEvents = function() {
    var ball = this.ballEl
    if (!ball) return
    var self = this
    this._on(ball, 'pointerdown', function(e) { self._onDragStart.call(self, e) })
    this._on(document, 'pointermove', function(e) { self._onDragMove.call(self, e) })
    this._on(document, 'pointerup', function(e) { self._onDragEnd.call(self, e) })
    this._on(window, 'resize', function() { self._constrainBall.call(self) })
  }

  _p._on = function(el, type, fn) {
    el.addEventListener(type, fn)
    this._boundHandlers[type] = this._boundHandlers[type] || []
    this._boundHandlers[type].push({ el: el, fn: fn })
  }

  _p._onDragStart = function(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    this.isDragging = false
    this.dragStartPos = { x: e.clientX, y: e.clientY }
    this.dragStartBall = { x: this.ballPos.x, y: this.ballPos.y }
    var ball = this.ballEl
    ball.classList.remove('idle-pulse')
    ball.style.transition = 'none'
    ball.setPointerCapture(e.pointerId)
    this._dragPointerId = e.pointerId
  }

  _p._onDragMove = function(e) {
    if (this._dragPointerId == null) return
    var dx = e.clientX - this.dragStartPos.x
    var dy = e.clientY - this.dragStartPos.y
    var dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 5 && !this.isDragging) this.isDragging = true
    if (this.isDragging) {
      this.ballPos.x = this.dragStartBall.x + dx
      this.ballPos.y = this.dragStartBall.y + dy
      this.ballEl.style.left = this.ballPos.x + 'px'
      this.ballEl.style.top = this.ballPos.y + 'px'
    }
  }

  _p._onDragEnd = function(e) {
    if (this._dragPointerId == null) return
    var ball = this.ballEl
    ball.releasePointerCapture(this._dragPointerId)
    this._dragPointerId = null
    ball.style.transition = ''
    if (this.isDragging) { this._snapToEdge(); this.isDragging = false }
    else { this.toggleMenu() }
    ball.classList.add('idle-pulse')
  }

  _p._snapToEdge = function() {
    var ball = this.ballEl
    var size = this.config.ball.size
    var w = window.innerWidth
    var h = window.innerHeight
    var edgeMargin = 8
    var centerX = this.ballPos.x + size / 2
    if (centerX < w / 2) this.ballPos.x = edgeMargin
    else this.ballPos.x = w - size - edgeMargin
    this.ballPos.y = Math.max(edgeMargin, Math.min(h - size - edgeMargin, this.ballPos.y))
    ball.style.left = this.ballPos.x + 'px'
    ball.style.top = this.ballPos.y + 'px'
  }

  _p._constrainBall = function() {
    var size = this.config.ball.size
    var margin = 8
    this.ballPos.x = Math.max(margin, Math.min(window.innerWidth - size - margin, this.ballPos.x))
    this.ballPos.y = Math.max(margin, Math.min(window.innerHeight - size - margin, this.ballPos.y))
    if (this.ballEl) { this.ballEl.style.left = this.ballPos.x + 'px'; this.ballEl.style.top = this.ballPos.y + 'px' }
    if (this.isOpen) this._positionMenu()
  }

  _p.toggleMenu = function() { this.isOpen ? this.closeMenu() : this.openMenu() }

  _p.openMenu = function() {
    if (this.isOpen) return
    this.isOpen = true
    var self = this
    this.overlayEl = document.createElement('div')
    this.overlayEl.className = 'roche-hub-overlay'
    document.body.appendChild(this.overlayEl)
    requestAnimationFrame(function() { self.overlayEl.classList.add('visible') })
    this._on(this.overlayEl, 'click', function() { self.closeMenu() })
    this.menuEl = document.createElement('div')
    this.menuEl.className = 'roche-hub-menu'
    document.body.appendChild(this.menuEl)
    this._positionMenu()
    this._buildMenuItems()
  }

  _p.closeMenu = function() {
    if (!this.isOpen) return
    this.isOpen = false
    var self = this
    this.menuItems.forEach(function(item) { item.el.classList.remove('show') })
    setTimeout(function() {
      if (self.overlayEl) { self.overlayEl.remove(); self.overlayEl = null }
      if (self.menuEl) { self.menuEl.remove(); self.menuEl = null }
      self.menuItems = []
    }, 300)
    if (this.overlayEl) this.overlayEl.classList.remove('visible')
  }

  _p._positionMenu = function() {
    if (!this.menuEl || !this.ballEl) return
    var rect = this.ballEl.getBoundingClientRect()
    var size = this.config.ball.size
    this.menuEl.style.left = (rect.left + size / 2) + 'px'
    this.menuEl.style.top = (rect.top + size / 2) + 'px'
  }

  _p._buildMenuItems = function() {
    var items = this._getMenuItems()
    var total = items.length
    var radius = this.config.menu.radius
    var ballSize = this.config.ball.size
    var self = this
    items.forEach(function(item, i) {
      var pos = radialPosition(i, total, radius, ballSize)
      var el = self._createMenuItem(item)
      el.style.transform = 'translate(' + pos.x + 'px, ' + pos.y + 'px) scale(0.3)'
      el.style.opacity = '0'
      self.menuEl.appendChild(el)
      self.menuItems.push({ el: el, item: item })
      setTimeout(function() { el.classList.add('show') }, 50 + i * 45)
    })
  }

  _p._getMenuItems = function() {
    var items = []
    var self = this
    ;(this.config.subPlugins || []).forEach(function(sp) {
      items.push({ id: sp.id, name: sp.name, icon: sp.icon || '\uD83D\uDE80', type: 'subplugin', action: function() { self.closeMenu(); if (typeof sp.action === 'function') sp.action(self.roche); else self.roche.ui.toast('\u6253\u5F00 ' + sp.name) } })
    })
    ;(this.config.shortcuts || []).forEach(function(sc) {
      items.push({ id: sc.id, name: sc.name, icon: sc.icon || '\uD83D\uDCCD', type: sc.type, action: function() { self.closeMenu(); self._executeShortcut(sc) } })
    })
    items.push({ id: '__settings__', name: '\u8BBE\u7F6E', icon: '\u2699', type: 'builtin', action: function() { self.closeMenu(); self.roche.ui.openApp('roche-hub-home') } })
    return items
  }

  _p._createMenuItem = function(item) {
    var wrap = document.createElement('div')
    wrap.className = 'roche-hub-menu-item'
    var btn = document.createElement('div')
    btn.className = 'roche-hub-menu-btn'
    btn.textContent = item.icon
    var label = document.createElement('span')
    label.className = 'roche-hub-menu-label'
    label.textContent = item.name
    wrap.appendChild(btn)
    wrap.appendChild(label)
    var self = this
    wrap.addEventListener('click', function(e) { e.stopPropagation(); item.action() })
    return wrap
  }

  _p._executeShortcut = async function(sc) {
    try {
      switch (sc.type) {
        case 'character':
          if (sc.targetId) { this.roche.ui.openApp('chat'); this.roche.ui.toast('\u6B63\u5728\u524D\u5F80 ' + sc.name + ' \u7684\u5BF9\u8BDD...') }
          else this.roche.ui.toast('\u672A\u6307\u5B9A\u89D2\u8272')
          break
        case 'app':
          if (sc.targetId) this.roche.ui.openApp(sc.targetId)
          else this.roche.ui.toast('\u672A\u6307\u5B9A\u76EE\u6807 App')
          break
        case 'custom':
          if (sc.customAction) new Function('roche', 'hub', sc.customAction)(this.roche, this)
          else this.roche.ui.toast('\u672A\u914D\u7F6E\u52A8\u4F5C')
          break
        default:
          this.roche.ui.toast('\u672A\u77E5\u7C7B\u578B')
      }
    } catch (err) { console.error('[RocheHub] shortcut error:', err); this.roche.ui.toast('\u6267\u884C\u5931\u8D25: ' + err.message) }
  }

  _p._renderAppView = function() {
    var c = this._container
    c.innerHTML = ''
    var app = document.createElement('div')
    app.className = 'roche-hub-app'
    var cfg = this.config
    app.innerHTML = '<div class="roche-hub-header"><div class="roche-hub-logo">\u2606</div><h1 class="roche-hub-title">Hub \u60AC\u6D6E\u7403</h1><p class="roche-hub-subtitle">\u5168\u5C40\u63A7\u5236\u4E2D\u5FC3 \u00B7 \u7CBE\u81F4\u4F18\u96C5</p></div>'
      + '<div class="roche-hub-section"><div class="roche-hub-section-title"><span class="icon">\uD83C\uDFA8</span> \u5916\u89C2</div>'
      + '<div class="roche-hub-row"><div><div class="roche-hub-row-label">\u60AC\u6D6E\u7403\u5927\u5C0F</div><div class="roche-hub-row-desc" id="hub-size-val">' + cfg.ball.size + 'px</div></div><div class="roche-hub-slider-wrap"><input type="range" class="roche-hub-slider" id="hub-size" min="36" max="80" value="' + cfg.ball.size + '"></div></div>'
      + '<div class="roche-hub-row"><div><div class="roche-hub-row-label">\u900F\u660E\u5EA6</div><div class="roche-hub-row-desc" id="hub-opacity-val">' + Math.round(cfg.ball.opacity * 100) + '%</div></div><div class="roche-hub-slider-wrap"><input type="range" class="roche-hub-slider" id="hub-opacity" min="30" max="100" value="' + Math.round(cfg.ball.opacity * 100) + '"></div></div>'
      + '<div class="roche-hub-row"><div><div class="roche-hub-row-label">\u5F62\u72B6</div></div><select class="roche-hub-select" id="hub-shape" style="width:auto;min-width:90px;"><option value="circle"' + (cfg.ball.shape === 'circle' ? ' selected' : '') + '>\u5706\u5F62</option><option value="rounded"' + (cfg.ball.shape === 'rounded' ? ' selected' : '') + '>\u5706\u89D2</option><option value="square"' + (cfg.ball.shape === 'square' ? ' selected' : '') + '>\u65B9\u5F62</option></select></div>'
      + '<div class="roche-hub-row"><div><div class="roche-hub-row-label">\u6E10\u53D8\u8D77\u59CB\u8272</div></div><input type="color" class="roche-hub-color-picker" id="hub-c1" value="' + cfg.ball.colorStart + '"></div>'
      + '<div class="roche-hub-row"><div><div class="roche-hub-row-label">\u6E10\u53D8\u4E2D\u95F4\u8272</div></div><input type="color" class="roche-hub-color-picker" id="hub-c2" value="' + cfg.ball.colorMid + '"></div>'
      + '<div class="roche-hub-row"><div><div class="roche-hub-row-label">\u6E10\u53D8\u7ED3\u675F\u8272</div></div><input type="color" class="roche-hub-color-picker" id="hub-c3" value="' + cfg.ball.colorEnd + '"></div>'
      + '<div class="roche-hub-row"><div><div class="roche-hub-row-label">\u81EA\u5B9A\u4E49\u56FE\u7247</div><div class="roche-hub-row-desc" id="hub-img-status">' + (cfg.ball.customImage ? '\u5DF2\u8BBE\u7F6E' : '\u672A\u8BBE\u7F6E') + '</div></div><label class="roche-hub-btn roche-hub-btn-sm">' + (cfg.ball.customImage ? '\u66F4\u6362' : '\u4E0A\u4F20') + '<input type="file" accept="image/png,image/jpeg,image/webp" id="hub-img-upload" style="display:none"></label></div>'
      + (cfg.ball.customImage ? '<div class="roche-hub-row" style="justify-content:center;padding:12px;"><img class="roche-hub-preview-img" id="hub-img-preview" src="' + cfg.ball.customImage + '" alt="\u9884\u89C8"><button class="roche-hub-btn roche-hub-btn-sm roche-hub-btn-danger" id="hub-img-clear" style="margin-left:10px;">\u6E05\u9664</button></div>' : '')
      + '</div>'
      + '<div class="roche-hub-section"><div class="roche-hub-section-title"><span class="icon">\uD83D\uDD17</span> \u5FEB\u6377\u65B9\u5F0F<button class="roche-hub-btn roche-hub-btn-sm" id="hub-add-sc" style="margin:left:auto;">+ \u6DFB\u52A0</button></div><div id="hub-sc-list"></div></div>'
      + '<div class="roche-hub-section"><div class="roche-hub-section-title"><span class="icon">\u2764\uFE0F</span> \u540E\u53F0\u5F15\u64CE</div>'
      + '<div class="roche-hub-row"><div><div class="roche-hub-row-label">\u542F\u7528\u5168\u5C40\u5FC3\u8DF3</div><div class="roche-hub-row-desc">\u9ED8\u8BA4\u5173\u95ED\uFF0C\u624B\u52A8\u5F00\u542F\u540E\u5B50\u63D2\u4EF6\u53EF\u6CE8\u518C\u540E\u53F0\u4EFB\u52A1</div></div><label class="roche-hub-switch"><input type="checkbox" id="hub-heartbeat-toggle"' + (cfg.heartbeat.enabled ? ' checked' : '') + '><div class="roche-hub-switch track"><div class="roche-hub-switch knob"></div></div></label></div>'
      + '<div class="roche-hub-row" id="hb-interval-row" style="' + (cfg.heartbeat.enabled ? '' : 'opacity:.4;pointer-events:none') + '"><div><div class="roche-hub-row-label">\u5FC3\u8DF3\u95F4\u9694</div><div class="roche-hub-row-desc" id="hub-hb-val">' + (cfg.heartbeat.intervalMs / 1000).toFixed(0) + '\u79D2</div></div><div class="roche-hub-slider-wrap"><input type="range" class="roche-hub-slider" id="hub-hb-interval" min="10" max="3600" value="' + (cfg.heartbeat.intervalMs / 1000) + '" step="10"></div></div></div></div>'
      + '<div class="roche-hub-section"><div class="roche-hub-section-title"><span class="icon">\uD83D\uDE80</span> \u5DF2\u6CE8\u518C\u5B50\u63D2\u4EF6</div><div id="hub-sp-list"></div></div>'
      + '<div class="roche-hub-safe-bottom"></div>'
    c.appendChild(app)
    this._bindAppEvents(app)
    this._renderShortcutList()
    this._renderSubPluginList()
  }

  _p._bindAppEvents = function(app) {
    var self = this
    var sizeSlider = app.querySelector('#hub-size')
    var sizeVal = app.querySelector('#hub-size-val')
    sizeSlider.addEventListener('input', async function() { var v = parseInt(sizeSlider.value); self.config.ball.size = v; sizeVal.textContent = v + 'px'; self._applyBallStyle(self.ballEl); await self._saveConfig() })
    var opSlider = app.querySelector('#hub-opacity')
    var opVal = app.querySelector('#hub-opacity-val')
    opSlider.addEventListener('input', async function() { var v = parseInt(opSlider.value) / 100; self.config.ball.opacity = v; opVal.textContent = Math.round(v * 100) + '%'; self._applyBallStyle(self.ballEl); await self._saveConfig() })
    var shapeSel = app.querySelector('#hub-shape')
    shapeSel.addEventListener('change', async function() { self.config.ball.shape = shapeSel.value; self._applyBallStyle(self.ballEl); await self._saveConfig() })
    var colors = ['c1','c2','c3']
    var fields = ['colorStart','colorMid','colorEnd']
    colors.forEach(function(key, i) {
      var picker = app.querySelector('#hub-' + key)
      picker.addEventListener('input', async function() { self.config.ball[fields[i]] = picker.value; self._applyBallStyle(self.ballEl); await self._saveConfig() })
    })
    var imgUpload = app.querySelector('#hub-img-upload')
    imgUpload.addEventListener('change', async function(e) {
      var file = e.target.files[0]; if (!file) return
      var reader = new FileReader()
      reader.onload = async function(ev) {
        self.config.ball.customImage = ev.target.result
        await self._saveConfig()
        self._applyBallStyle(self.ballEl)
        var inner = self.ballEl.querySelector('.roche-hub-ball-inner')
        if (inner) { inner.style.backgroundImage = 'url(' + ev.target.result + ')'; inner.innerHTML = '' }
        self._renderAppView()
      }
      reader.readAsDataURL(file)
    })
    var clearBtn = app.querySelector('#hub-img-clear')
    if (clearBtn) clearBtn.addEventListener('click', async function() {
      self.config.ball.customImage = ''
      await self._saveConfig()
      self._applyBallStyle(self.ballEl)
      var inner = self.ballEl.querySelector('.roche-hub-ball-inner')
      if (inner) { inner.style.backgroundImage = ''; inner.innerHTML = '<span class="roche-hub-ball-icon">\u2606</span>' }
      self._renderAppView()
    })
    app.querySelector('#hub-add-sc').addEventListener('click', function() { self._showShortcutModal() })
    var hbToggle = app.querySelector('#hub-heartbeat-toggle')
    var hbRow = app.querySelector('#hb-interval-row')
    hbToggle.addEventListener('change', async function() {
      self.config.heartbeat.enabled = hbToggle.checked
      hbRow.style.opacity = hbToggle.checked ? '' : '.4'
      hbRow.style.pointerEvents = hbToggle.checked ? '' : 'none'
      await self._saveConfig()
      if (hbToggle.checked) self._startHeartbeat(); else self._stopHeartbeat()
    })
    var hbInterval = app.querySelector('#hub-hb-interval')
    var hbVal = app.querySelector('#hub-hb-val')
    hbInterval.addEventListener('input', async function() {
      var sec = parseInt(hbInterval.value)
      self.config.heartbeat.intervalMs = sec * 1000
      hbVal.textContent = sec + '\u79D2'
      await self._saveConfig()
      if (self.config.heartbeat.enabled) self._restartHeartbeat()
    })
  }

  _p._renderShortcutList = function() {
    var listEl = document.querySelector('#hub-sc-list')
    if (!listEl) return
    var shorts = this.config.shortcuts || []
    var self = this
    if (shorts.length === 0) { listEl.innerHTML = '<div class="roche-hub-empty"><div class="roche-hub-empty-icon">\uD83D\uDCDD</div>\u8FD8\u6CA1\u6709\u5FEB\u6377\u65B9\u5F0F<br>\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u6DFB\u52A0</div>'; return }
    var labels = { character: '\uD83D\uDC64 \u89D2\u8272\u804A\u5929', app: '\uD83D\uDCBB App \u8DF3\u8F6C', custom: '\u2728 \u81EA\u5B9A\u4E49\u52A8\u4F5C' }
    var icons = { character: '\uD83D\uDC64', app: '\uD83D\uDCBB', custom: '\u2728' }
    listEl.innerHTML = shorts.map(function(sc, idx) {
      var tl = labels[sc.type] || sc.type
      var ic = icons[sc.type] || '\uD83D\uDD17'
      return '<div class="roche-hub-shortcut-item" data-idx="' + idx + '"><div class="roche-hub-sc-icon">' + ic + '</div><div class="roche-hub-sc-info"><div class="roche-hub-sc-name">' + self._escHtml(sc.name) + '</div><div class="roche-hub-sc-type">' + tl + (sc.targetId ? ' \u00B7 ' + sc.targetId : '') + '</div></div><div class="roche-hub-sc-actions"><button class="roche-hub-sc-action-btn edit-btn" title="\u7F16\u8F91">&#9998;</button><button class="roche-hub-sc-action-btn danger del-btn" title="\u5220\u9664">&times;</button></div></div>'
    }).join('')
    listEl.querySelectorAll('.edit-btn').forEach(function(btn, i) { btn.addEventListener('click', function() { self._showShortcutModal(i) }) })
    listEl.querySelectorAll('.del-btn').forEach(function(btn, i) { btn.addEventListener('click', function() { self._deleteShortcut(i) }) })
  }

  _p._escHtml = function(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML }

  _p._showShortcutModal = function(editIdx) {
    var isEdit = typeof editIdx === 'number'
    var sc = isEdit ? this.config.shortcuts[editIdx] : { id: uid(), name: '', type: 'character', targetId: '', icon: '', customAction: '' }
    var self = this
    var mask = document.createElement('div')
    mask.className = 'roche-hub-modal-mask'
    mask.innerHTML = '<div class="roche-hub-modal"><div class="roche-hub-modal-header"><h3 class="roche-hub-modal-title">' + (isEdit ? '\u7F16\u8F91\u5FEB\u6377\u65B9\u5F0F' : '\u6DFB\u52A0\u5FEB\u6377\u65B9\u5F0F') + '</h3><button class="roche-hub-modal-close hub-modal-close">&times;</button></div><div class="roche-hub-modal-body">'
      + '<div class="roche-hub-form-group"><label class="roche-hub-form-label">\u540D\u79F0 *</label><input class="roche-hub-input" id="modal-sc-name" value="' + self._escHtml(sc.name) + '" placeholder="\u4F8B\u5982\uFF1A\u548C\u6C88\u785A\u804A\u5929"></div>'
      + '<div class="roche-hub-form-group"><label class="roche-hub-form-label">\u7C7B\u578B</label><select class="roche-hub-select" id="modal-sc-type"><option value="character"' + (sc.type === 'character' ? ' selected' : '') + '>\u89D2\u8272\u804A\u5929</option><option value="app"' + (sc.type === 'app' ? ' selected' : '') + '>App \u8DF3\u8F6C</option><option value="custom"' + (sc.type === 'custom' ? ' selected' : '') + '>\u81EA\u5B9A\u4E49\u52A8\u4F5C</option></select></div>'
      + '<div class="roche-hub-form-group" id="modal-target-group"><label class="roche-hub-form-label" id="modal-target-label">\u76EE\u6807 ID</label><input class="roche-hub-input" id="modal-sc-target" value="' + self._escHtml(sc.targetId || '') + '" placeholder="' + (sc.type === 'character' ? '\u89D2\u8272 ID' : sc.type === 'app' ? 'App ID' : '') + '"></div>'
      + '<div class="roche-hub-form-group" id="modal-custom-group" style="' + (sc.type === 'custom' ? '' : 'display:none') + '"><label class="roche-hub-form-label">\u81EA\u5B9A\u4E49\u811A\u672C</label><textarea class="roche-hub-textarea" id="modal-sc-custom" placeholder="function(roche, hub) { ... }">' + self._escHtml(sc.customAction || '') + '</textarea><div class="roche-hub-hint">\u53EF\u7528\u53C2\u6570\uFF1Aroche\uFF08API\uFF09\u3001hub\uFF08Hub\u5B9E\u4F8B\uFF09\u3002\u8BF7\u52FF\u5305\u542B\u6027\u610F\u4EE3\u7801\u3002</div></div>'
      + '<div class="roche-hub-form-group"><label class="roche-hub-form-label">\u56FE\u6807\uFF08\u53EF\u9009\uFF09</label><input class="roche-hub-input" id="modal-sc-icon" value="' + self._escHtml(sc.icon || '') + '" placeholder="emoji \u6216\u5B57\u7B26\uFF0C\u5982 \u2764\uFE0F"></div>'
      + '</div><div class="roche-hub-modal-footer"><button class="roche-hub-btn hub-modal-cancel">\u53D6\u6D88</button><button class="roche-hub-btn roche-hub-btn-primary hub-modal-save">' + (isEdit ? '\u4FDD\u5B58' : '\u6DFB\u52A0') + '</button></div></div>'
    document.body.appendChild(mask)
    requestAnimationFrame(function() { mask.classList.add('show') })
    var typeSel = mask.querySelector('#modal-sc-type')
    var targetGroup = mask.querySelector('#modal-target-group')
    var customGroup = mask.querySelector('#modal-custom-group')
    typeSel.addEventListener('change', function() {
      if (typeSel.value === 'custom') { targetGroup.style.display = 'none'; customGroup.style.display = '' }
      else { targetGroup.style.display = ''; customGroup.style.display = 'none' }
    })
    mask.querySelector('.hub-modal-close').addEventListener('click', function() { self._closeModal(mask) })
    mask.querySelector('.hub-modal-cancel').addEventListener('click', function() { self._closeModal(mask) })
    mask.querySelector('.hub-modal-save').addEventListener('click', async function() {
      var name = mask.querySelector('#modal-sc-name').value.trim()
      if (!name) { self.roche.ui.toast('\u8BF7\u8F93\u5165\u540D\u79F0'); return }
      var data = { id: sc.id, name: name, type: typeSel.value, targetId: mask.querySelector('#modal-sc-target').value.trim(), icon: mask.querySelector('#modal-sc-icon').value.trim(), customAction: mask.querySelector('#modal-sc-custom').value.trim() }
      if (isEdit) self.config.shortcuts[editIdx] = data
      else self.config.shortcuts.push(data)
      await self._saveConfig()
      self._closeModal(mask)
      self._renderShortcutList()
      self.roche.ui.toast(isEdit ? '\u5DF2\u4FDD\u5B58' : '\u5DF2\u6DFB\u52A0')
    })
  }

  _p._deleteShortcut = function(idx) {
    var self = this
    this.roche.ui.confirm({ title: '\u5220\u9664\u786E\u8BA4', message: '\u786E\u5B9A\u8981\u5220\u9664\u300C' + this.config.shortcuts[idx].name + '\u300D\u5417\uFF1F' }).then(function(ok) {
      if (ok) { self.config.shortcuts.splice(idx, 1); self._saveConfig().then(function() { self._renderShortcutList(); self.roche.ui.toast('\u5DF2\u5220\u9664') }) }
    }).catch(function() {})
  }

  _p._closeModal = function(mask) { mask.classList.remove('show'); setTimeout(function() { mask.remove() }, 280) }

  _p._renderSubPluginList = function() {
    var listEl = document.querySelector('#hub-sp-list')
    if (!listEl) return
    var plugins = this.config.subPlugins || []
    var self = this
    if (plugins.length === 0) { listEl.innerHTML = '<div class="roche-hub-empty"><div class="roche-hub-empty-icon">\uD83D\uDE80</div>\u6682\u65E0\u5B50\u63D2\u4EF6\u6CE8\u518C<br>\u672A\u6765\u5B89\u88C5\u7684\u63D2\u4EF6\u4F1A\u5728\u6B64\u663E\u793A</div>'; return }
    listEl.innerHTML = plugins.map(function(sp) { return '<div class="roche-hub-shortcut-item"><div class="roche-hub-sc-icon">' + (sp.icon || '\uD83D\uDE80') + '</div><div class="roche-hub-sc-info"><div class="roche-hub-sc-name">' + self._escHtml(sp.name) + '</div><div class="roche-hub-sc-type">ID: ' + sp.id + (sp.version ? ' \u00B7 v' + sp.version : '') + '</div></div></div>' }).join('')
  }

  _p._startHeartbeat = function() {
    this._stopHeartbeat()
    var interval = this.config.heartbeat.intervalMs || 60000
    var self = this
    this._heartbeatTimer = setInterval(async function() { await self._runHeartbeatTick() }, interval)
    console.log('[RocheHub] heartbeat started, interval=' + (interval / 1000) + 's')
  }

  _p._stopHeartbeat = function() { if (this._heartbeatTimer) { clearInterval(this._heartbeatTimer); this._heartbeatTimer = null } }
  _p._restartHeartbeat = function() { if (this.config.heartbeat.enabled) this._startHeartbeat() }

  _p._runHeartbeatTick = async function() {
    var tasks = this._heartbeatTasks.filter(function(t) { return t.enabled !== false })
    if (tasks.length === 0) return
    var now = Date.now()
    var self = this
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i]
      try {
        if (task.lastRun && (now - task.lastRun) < (task.intervalMs || this.config.heartbeat.intervalMs)) continue
        task.lastRun = now
        if (task.type === 'timer' && typeof task.handler === 'function') await task.handler({ roche: self.roche, hub: self, timestamp: now })
      } catch (err) { console.error('[RocheHub] task [' + task.id + '] error:', err) }
    }
  }

  _p.registerSubPlugin = function(options) {
    if (!options || !options.id) { console.error('[RocheHub] registerSubPlugin: missing id'); return false }
    var existing = this.config.subPlugins.findIndex(function(p) { return p.id === options.id })
    var pluginData = { id: options.id, name: options.name || options.id, icon: options.icon || '\uD83D\uDE80', version: options.version || '', action: options.action || null, requireContext: options.requireContext || null }
    if (existing >= 0) this.config.subPlugins[existing] = pluginData
    else this.config.subPlugins.push(pluginData)
    if (options.task) this._registerTask({ pluginId: options.id, ...options.task })
    this._saveConfig()
    this._renderSubPluginList()
    console.log('[RocheHub] sub-plugin registered: ' + pluginData.name + ' (' + pluginData.id + ')')
    return true
  }

  _p.unregisterSubPlugin = function(pluginId) {
    this.config.subPlugins = this.config.subPlugins.filter(function(p) { return p.id !== pluginId })
    this._heartbeatTasks = this._heartbeatTasks.filter(function(t) { return t.pluginId !== pluginId })
    this._saveConfig()
    this._renderSubPluginList()
    console.log('[RocheHub] sub-plugin unregistered: ' + pluginId)
  }

  _p._registerTask = function(task) {
    if (!task.id || !task.pluginId) return
    this._heartbeatTasks = this._heartbeatTasks.filter(function(t) { return t.id !== task.id })
    this._heartbeatTasks.push({ id: task.id, pluginId: task.pluginId, type: task.type || 'timer', handler: task.handler, intervalMs: task.intervalMs || null, enabled: task.enabled !== false, config: task.config || {}, lastRun: 0 })
    console.log('[RocheHub] heartbeat task registered: [' + task.pluginId + '] ' + task.id + ' (' + task.type + ')')
  }

  _p.destroy = function() {
    this._stopHeartbeat()
    if (this.ballEl) { this.ballEl.remove(); this.ballEl = null }
    this.closeMenu()
    if (this.overlayEl) { this.overlayEl.remove(); this.overlayEl = null }
    if (this.styleEl) { this.styleEl.remove(); this.styleEl = null }
    for (var type in this._boundHandlers) { this._boundHandlers[type].forEach(function(h) { h.el.removeEventListener(type, h.fn) }) }
    this._boundHandlers = {}
    if (this._container) { this._container.replaceChildren(); this._container = null }
    this._heartbeatTasks = []
    console.log('[RocheHub] destroyed')
  }

  var _hubInstance = null

  window.RochePlugin.register({
    id: 'roche-hub',
    name: 'Hub \u60AC\u6D6E\u7403',
    version: '1.0.1',
    icon: '\u2606',
    apps: [{
      id: 'roche-hub-home',
      name: 'Hub \u60AC\u6D6E\u7403',
      icon: 'extension',
      iconImage: '',
      mount: async function(container, roche) {
        if (_hubInstance) _hubInstance.destroy()
        _hubInstance = new RocheHub(roche)
        await _hubInstance.init(container)
      },
      unmount: async function(container, roche) {
        if (_hubInstance) { _hubInstance.destroy(); _hubInstance = null }
      },
    }],
  })

  if (!window.RocheHubAPI) {
    window.RocheHubAPI = {
      registerSubPlugin: function(options) { if (_hubInstance) return _hubInstance.registerSubPlugin(options); console.warn('[RocheHubAPI] Hub not ready'); return false },
      unregisterSubPlugin: function(pluginId) { if (_hubInstance) _hubInstance.unregisterSubPlugin(pluginId) },
      getInstance: function() { return _hubInstance },
    }
  }
})()
