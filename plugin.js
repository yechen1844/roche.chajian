/**
 * Roche Hub 悬浮球 v1.0.5 — 白金极光版
 * 全局悬浮球中心 — 统一入口、快捷跳转、子插件托管、全局心跳引擎
 *
 * v1.0.5 更新：
 *   - 修复返回按钮：使用 roche.ui.closeApp() 替代 openApp('')
 *   - 去掉吸附效果：悬浮球可自由拖拽定位
 *   - 修复App列表获取：改用 roche.conversation.list() 获取会话列表
 *   - 修复心跳开关：改进 track 元素查找方式
 *   - 快捷方式类型改为"角色聊天/会话跳转/自定义动作"
 */
;(function () {
  'use strict'

  /* ════════════════════════════════════════════════════════════
     CSS — 白金极光与神圣典雅美学 (Pearl & Sacred Elegance)
     ════════════════════════════════════════════════════════════ */

  var CSS = [
    '',
    '/* ── 悬浮球本体：冰晶玻璃球体 ── */',
    '.roche-hub-ball {',
    '  position: fixed;',
    '  z-index: 2147483646;',
    '  width: 52px; height: 52px;',
    '  border-radius: 50%;',
    '  cursor: grab;',
    '  user-select: none; -webkit-user-select: none;',
    '  touch-action: none;',
    '  display: flex; align-items: center; justify-content: center;',
    '  background: linear-gradient(135deg,',
    '    rgba(255,245,240,0.95) 0%,',
    '    rgba(250,235,245,0.92) 30%,',
    '    rgba(235,245,255,0.92) 70%,',
    '    rgba(245,248,255,0.95) 100%);',
    '  box-shadow:',
    '    0 2px 16px rgba(180,160,200,0.25),',
    '    0 0 32px rgba(220,190,230,0.12),',
    '    inset 0 1px 2px rgba(255,255,255,0.9),',
    '    inset 0 -2px 6px rgba(200,180,210,0.15);',
    '  border: 1px solid rgba(255,255,255,0.7);',
    '  transition: transform .35s cubic-bezier(.34,1.56,.64,1),',
    '              box-shadow .4s ease;',
    '  will-change: transform, left, top;',
    '}',
    '.roche-hub-ball:active { cursor: grabbing; }',
    '.roche-hub-ball:hover {',
    '  box-shadow:',
    '    0 4px 24px rgba(180,160,200,0.35),',
    '    0 0 48px rgba(220,190,230,0.18),',
    '    inset 0 1px 2px rgba(255,255,255,0.95);',
    '}',

    '/* 球内图标 */',
    '.roche-hub-ball-inner {',
    '  width: 100%; height: 100%;',
    '  border-radius: 50%;',
    '  display: flex; align-items: center; justify-content: center;',
    '  overflow: hidden;',
    '  background-size: cover; background-position: center;',
    '  background-repeat: no-repeat;',
    '}',
    '.roche-hub-ball-icon {',
    '  font-size: 20px; line-height: 1;',
    '  color: #8B7AA0;',
    '  filter: drop-shadow(0 1px 2px rgba(140,120,160,0.3));',
    '  pointer-events: none;',
    '}',

    '/* 呼吸光环（待机脉冲） */',
    '@keyframes rocheHubBreath {',
    '  0%   { box-shadow: 0 0 0 0 rgba(200,170,210,0.35),',
    '                   0 0 20px rgba(220,195,230,0.08); }',
    '  40%  { box-shadow: 0 0 0 14px rgba(200,170,210,0.10),',
    '                   0 0 36px rgba(220,195,230,0.04); }',
    '  100% { box-shadow: 0 0 0 0 rgba(200,170,210,0.35),',
    '                   0 0 20px rgba(220,195,230,0.08); }',
    '}',
    '.roche-hub-ball.idle-pulse { animation: rocheHubBreath 3s ease-in-out infinite; }',
    '.roche-hub-ball.idle-pulse:hover,',
    '.roche-hub-ball.idle-pulse:active { animation: none; }',

    '/* ── 遮罩层：柔焦散景 ── */',
    '.roche-hub-overlay {',
    '  position: fixed; inset: 0;',
    '  z-index: 2147483645;',
    '  background: radial-gradient(circle at center,',
    '    rgba(255,250,250,0.15) 0%,',
    '    rgba(240,232,245,0.45) 60%,',
    '    rgba(220,208,230,0.55) 100%);',
    '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
    '  opacity: 0; pointer-events: none;',
    '  transition: opacity .4s cubic-bezier(.4,0,.2,1);',
    '}',
    '.roche-hub-overlay.visible { opacity: 1; pointer-events: auto; }',

    '/* ── 放射菜单容器 ── */',
    '.roche-hub-menu { position: fixed; z-index: 2147483647; pointer-events: none; }',
    '.roche-hub-menu-item {',
    '  position: absolute;',
    '  display: flex; flex-direction: column; align-items: center; gap: 5px;',
    '  pointer-events: auto; cursor: pointer;',
    '  opacity: 0; transform: scale(.25) translateY(8px);',
    '  transition: opacity .4s ease, transform .5s cubic-bezier(.34,1.56,.64,1);',
    '}',
    '.roche-hub-menu-item.show { opacity: 1; transform: scale(1) translateY(0); }',

    '/* 菜单按钮：冰晶玻璃 */',
    '.roche-hub-menu-btn {',
    '  width: 46px; height: 46px; border-radius: 50%;',
    '  background: linear-gradient(145deg,',
    '    rgba(255,255,255,0.85) 0%,',
    '    rgba(250,245,252,0.80) 50%,',
    '    rgba(242,238,248,0.82) 100%);',
    '  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);',
    '  border: 1px solid rgba(255,255,255,0.65);',
    '  box-shadow:',
    '    0 3px 12px rgba(180,165,200,0.18),',
    '    inset 0 1px 2px rgba(255,255,255,0.9),',
    '    inset 0 -1px 3px rgba(200,185,215,0.12);',
    '  display: flex; align-items: center; justify-content: center;',
    '  color: #7A6890; font-size: 17px;',
    '  transition: transform .35s cubic-bezier(.34,1.56,.64,1),',
    '              box-shadow .3s ease, background .3s ease;',
    '}',
    '.roche-hub-menu-btn:hover {',
    '  transform: scale(1.12) translateY(-2px);',
    '  background: linear-gradient(145deg,',
    '    rgba(255,252,250,0.95) 0%,',
    '    rgba(252,246,252,0.90) 100%);',
    '  box-shadow:',
    '    0 6px 22px rgba(180,165,200,0.28),',
    '    0 0 18px rgba(220,195,230,0.15),',
    '    inset 0 1px 2px rgba(255,255,255,1);',
    '  color: #6A5878;',
    '}',
    '.roche-hub-menu-btn:active { transform: scale(.94); }',
    '.roche-hub-menu-label {',
    '  font-size: 11px; color: #8B7A9E;',
    '  text-shadow: 0 1px 4px rgba(255,255,255,0.8);',
    '  white-space: nowrap; pointer-events: none;',
    '  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;',
    '  letter-spacing:.03em; font-weight:500;',
    '}',

    '/* ── App 视图：白金极光面板 ── */',
    '.rh-app {',
    '  --pearl-bg: rgba(252,248,252,0.96);',
    '  --pearl-surface: rgba(255,255,255,0.78);',
    '  --pearl-surface2: rgba(248,244,250,0.88);',
    '  --pearl-border: rgba(220,205,225,0.35);',
    '  --pearl-text: #4A3F54;',
    '  --pearl-text2: #8B7A9E;',
    '  --pearl-accent: #B89AC8;',
    '  --pearl-accent2: #8EB4D8;',
    '  --pearl-rose: #D4A0AD;',
    '  --pearl-gold: #C8B89A;',
    '  --pearl-r: 18px;',
    '',
    '  height: 100%; overflow-y: auto; overflow-x: hidden;',
    '  background:',
    '    radial-gradient(ellipse 80% 50% at 20% 0%, rgba(212,160,173,0.07) 0%, transparent 60%),',
    '    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(142,180,216,0.06) 0%, transparent 55%),',
    '    linear-gradient(175deg, #FAF6FB 0%, #F5F0F7 40%, #FDF8FA 100%);',
    '  color: var(--pearl-text);',
    '  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;',
    '  -webkit-overflow-scrolling: touch;',
    '}',
    '.rh-app::-webkit-scrollbar { width: 3px; }',
    '.rh-app::-webkit-scrollbar-thumb {',
    '  background: rgba(184,154,200,0.3); border-radius: 3px;',
    '}',

    '/* 头部：仪式感区域 */',
    '.rh-header {',
    '  padding: 32px 24px 26px; text-align: center;',
    '  position: relative; overflow: hidden;',
    '  background: linear-gradient(180deg,',
    '    rgba(212,160,173,0.06) 0%, transparent 70%);',
    '}',
    '.rh-header::before {',
    '  content: ""; position: absolute;',
    '  top: -30px; left: 50%; transform: translateX(-50%);',
    '  width: 180px; height: 180px;',
    '  background: radial-gradient(circle, rgba(212,160,173,0.12) 0%, transparent 75%);',
    '  filter: blur(40px); animation: rhHeaderGlow 8s ease-in-out infinite alternate;',
    '  pointer-events: none;',
    '}',
    '@keyframes rhHeaderGlow {',
    '  0% { opacity: .5; transform: translateX(-50%) scale(1); }',
    '  100% { opacity: 1; transform: translateX(-50%) scale(1.15); }',
    '}',
    '.rh-header-inner { position: relative; z-index: 1; }',
    '.rh-logo {',
    '  width: 60px; height: 60px; border-radius: 22px;',
    '  background: linear-gradient(145deg,',
    '    rgba(255,250,252,0.95) 0%,',
    '    rgba(248,240,250,0.90) 50%,',
    '    rgba(235,245,255,0.88) 100%);',
    '  display: flex; align-items: center; justify-content: center;',
    '  margin: 0 auto 16px; font-size: 26px;',
    '  box-shadow:',
    '    0 4px 20px rgba(184,154,200,0.2),',
    '    0 0 40px rgba(212,160,173,0.08),',
    '    inset 0 1px 2px rgba(255,255,255,0.95),',
    '    inset 0 -2px 6px rgba(200,185,215,0.10);',
    '  border: 1px solid rgba(255,255,255,0.6);',
    '  color: #8B7AA0;',
    '}',
    '.rh-title {',
    '  font-size: 21px; font-weight: 700;',
    '  margin: 0 0 5px; letter-spacing:-.02em;',
    '  color: var(--pearl-text);',
    '}',
    '.rh-subtitle {',
    '  font-size: 13px; color: var(--pearl-text2);',
    '  margin: 0; letter-spacing:.03em; font-weight:400;',
    '}',

    '/* 返回按钮 */',
    '.rh-back-btn {',
    '  display: inline-flex; align-items: center; gap: 6px;',
    '  padding: 8px 18px; border-radius: 12px;',
    '  border: 1px solid var(--pearl-border);',
    '  background: var(--pearl-surface);',
    '  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);',
    '  color: var(--pearl-text2); font-size: 13px; font-weight: 600;',
    '  cursor: pointer; transition: all .3s cubic-bezier(.4,0,.2,1);',
    '  font-family: inherit; margin-top: 16px;',
    '  box-shadow: 0 2px 8px rgba(180,165,200,0.08),',
    '              inset 0 1px 1px rgba(255,255,255,0.7);',
    '}',
    '.rh-back-btn:hover {',
    '  background: rgba(255,255,255,0.92);',
    '  border-color: rgba(200,185,215,0.45);',
    '  box-shadow: 0 4px 14px rgba(180,165,200,0.14),',
    '              inset 0 1px 1px rgba(255,255,255,0.9);',
    '  color: var(--pearl-text);',
    '}',
    '.rh-back-btn:active { transform: scale(.96); }',

    '/* 分区卡片 */',
    '.rh-section {',
    '  margin: 20px 16px 0;',
    '  background: linear-gradient(160deg,',
    '    rgba(255,255,255,0.72) 0%,',
    '    rgba(252,248,252,0.68) 100%);',
    '  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);',
    '  border-radius: var(--pearl-r);',
    '  border: 1px solid var(--pearl-border);',
    '  box-shadow:',
    '    0 2px 16px rgba(180,165,200,0.06),',
    '    inset 0 1px 1px rgba(255,255,255,0.6);',
    '  overflow: hidden;',
    '  position: relative;',
    '}',
    '.rh-section::before {',
    '  content:""; position:absolute; bottom:0; right:0;',
    '  width:80px; height:80px;',
    '  background:radial-gradient(circle,rgba(142,180,216,0.05) 0%,transparent 70%);',
    '  filter:blur(20px); pointer-events:none;',
    '}',
    '.rh-section-title {',
    '  font-size: 11px; font-weight: 700;',
    '  color: var(--pearl-text2);',
    '  text-transform: uppercase; letter-spacing:.1em;',
    '  padding: 16px 20px 10px;',
    '  display: flex; align-items: center; gap: 8px;',
    '}',
    '.rh-section-title .rh-icon { font-size: 14px; }',
    '.rh-section-title::after {',
    '  content:""; flex:1; height:1px;',
    '  background: linear-gradient(90deg, var(--pearl-border), transparent);',
    '  margin-left: 10px;',
    '}',

    '/* 设置行 */',
    '.rh-row {',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  padding: 14px 20px;',
    '  border-bottom: 1px solid rgba(220,205,225,0.25);',
    '  transition: background .3s ease;',
    '}',
    '.rh-row:last-child { border-bottom: none; }',
    '.rh-row:hover { background: rgba(255,255,255,0.35); }',
    '.rh-row-label { font-size: 14px; font-weight: 600; color: var(--pearl-text); flex:1; }',
    '.rh-row-desc {',
    '  font-size: 11px; color: var(--pearl-text2);',
    '  margin-top: 3px; line-height: 1.5;',
    '}',
    '.rh-row-val { font-size: 13px; color: var(--pearl-accent2); font-weight: 600; }',

    '/* 滑块 */',
    '.rh-slider-wrap { flex:1; max-width: 130px; margin-left: 14px; }',
    '.rh-slider {',
    '  -webkit-appearance:none; appearance:none; width:100%;',
    '  height: 3px; border-radius: 2px;',
    '  background: linear-gradient(90deg,',
    '    rgba(184,154,200,0.15) 0%,',
    '    rgba(142,180,216,0.20) 100%);',
    '  outline:none;',
    '}',
    '.rh-slider::-webkit-slider-thumb {',
    '  -webkit-appearance:none; appearance:none;',
    '  width: 18px; height: 18px; border-radius: 50%;',
    '  background: linear-gradient(145deg, #FFF 0%, #F5F0F7 100%);',
    '  cursor:pointer; border: 2px solid rgba(184,154,200,0.35);',
    '  box-shadow: 0 2px 8px rgba(180,165,200,0.2),',
    '              inset 0 1px 1px rgba(255,255,255,0.9);',
    '  transition: transform .2s cubic-bezier(.34,1.56,.64,1),',
    '              box-shadow .2s ease;',
    '}',
    '.rh-slider::-webkit-slider-thumb:hover {',
    '  transform: scale(1.18);',
    '  box-shadow: 0 3px 12px rgba(180,165,200,0.3),',
    '              inset 0 1px 1px rgba(255,255,255,1);',
    '}',

    '/* 按钮 */',
    '.rh-btn {',
    '  display:inline-flex; align-items:center; gap:6px;',
    '  padding: 9px 18px; border-radius: 11px;',
    '  border: 1px solid var(--pearl-border);',
    '  background: linear-gradient(160deg,',
    '    rgba(255,255,255,0.8) 0%,',
    '    rgba(252,248,252,0.75) 100%);',
    '  color: var(--pearl-text); font-size:13px; font-weight:600;',
    '  cursor:pointer; transition: all .35s cubic-bezier(.4,0,.2,1);',
    '  font-family:inherit;',
    '  box-shadow: 0 2px 8px rgba(180,165,200,0.08),',
    '              inset 0 1px 1px rgba(255,255,255,0.7);',
    '}',
    '.rh-btn:hover {',
    '  background: linear-gradient(160deg,',
    '    rgba(255,255,255,0.95) 0%,',
    '    rgba(252,248,252,0.90) 100%);',
    '  border-color: rgba(200,185,215,0.45);',
    '  box-shadow: 0 4px 14px rgba(180,165,200,0.14),',
    '              inset 0 1px 1px rgba(255,255,255,0.9);',
    '}',
    '.rh-btn:active { transform: scale(.96); }',
    '.rh-btn-primary {',
    '  background: linear-gradient(145deg,',
    '    rgba(184,154,200,0.75) 0%,',
    '    rgba(162,138,182,0.70) 100%);',
    '  border-color: rgba(184,154,200,0.3);',
    '  color: #fff; text-shadow: 0 1px 2px rgba(100,70,120,0.2);',
    '  box-shadow: 0 3px 12px rgba(184,154,200,0.2),',
    '              inset 0 1px 1px rgba(255,255,255,0.25);',
    '}',
    '.rh-btn-primary:hover {',
    '  background: linear-gradient(145deg,',
    '    rgba(184,154,200,0.88) 0%,',
    '    rgba(162,138,182,0.82) 100%);',
    '  box-shadow: 0 5px 18px rgba(184,154,200,0.3),',
    '              inset 0 1px 1px rgba(255,255,255,0.35);',
    '}',
    '.rh-btn-danger {',
    '  color: #C08090; border-color: rgba(212,128,144,0.25);',
    '}',
    '.rh-btn-danger:hover {',
    '  background: rgba(212,128,144,0.06);',
    '  border-color: rgba(212,128,144,0.38);',
    '}',
    '.rh-btn-sm { padding: 6px 14px; font-size: 12px; border-radius: 9px; }',

    '/* 快捷项列表 */',
    '.rh-sc-item {',
    '  display:flex; align-items:center; gap:12px;',
    '  padding: 12px 20px;',
    '  border-bottom: 1px solid rgba(220,205,225,0.20);',
    '  transition: background .3s ease;',
    '}',
    '.rh-sc-item:last-child { border-bottom: none; }',
    '.rh-sc-item:hover { background: rgba(255,255,255,0.3); }',
    '.rh-sc-icon-wrap {',
    '  width:38px; height:38px; border-radius:12px;',
    '  background: linear-gradient(160deg,',
    '    rgba(255,255,255,0.7) 0%,',
    '    rgba(248,244,250,0.6) 100%);',
    '  display:flex; align-items:center; justify-content:center;',
    '  font-size:16px; flex-shrink:0;',
    '  border: 1px solid rgba(220,205,225,0.25);',
    '  box-shadow: 0 2px 6px rgba(180,165,200,0.05),',
    '              inset 0 1px 1px rgba(255,255,255,0.5);',
    '  color: var(--pearl-accent);',
    '}',
    '.rh-sc-info { flex:1; min-width:0; }',
    '.rh-sc-name {',
    '  font-size:14px; font-weight:600; color:var(--pearl-text);',
    '  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;',
    '}',
    '.rh-sc-type {',
    '  font-size:11px; color:var(--pearl-text2); margin-top:2px;',
    '}',
    '.rh-sc-actions { display:flex; gap:5px; flex-shrink:0; }',
    '.rh-sc-act-btn {',
    '  width:30px; height:30px; border-radius:9px;',
    '  border:1px solid var(--pearl-border);',
    '  background:rgba(255,255,255,0.5);',
    '  color:var(--pearl-text2); font-size:13px; cursor:pointer;',
    '  display:flex; align-items:center; justify-content:center;',
    '  transition:all .25s cubic-bezier(.4,0,.2,1);',
    '  box-shadow: inset 0 1px 1px rgba(255,255,255,0.4);',
    '}',
    '.rh-sc-act-btn:hover {',
    '  background:rgba(255,255,255,0.85);',
    '  color:var(--pearl-text);',
    '  box-shadow: 0 2px 6px rgba(180,165,200,0.1);',
    '}',
    '.rh-sc-act-btn.danger:hover {',
    '  background:rgba(212,128,144,0.06);',
    '  color:#C08090; border-color:rgba(212,128,144,0.3);',
    '}',

    '/* 模态框 */',
    '.rh-modal-mask {',
    '  position:fixed; inset:0;',
    '  z-index:2147483647;',
    '  background: radial-gradient(circle at center,',
    '    rgba(250,245,248,0.4) 0%,',
    '    rgba(230,218,235,0.6) 100%);',
    '  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);',
    '  display:flex; align-items:center; justify-content:center;',
    '  opacity:0; pointer-events:none;',
    '  transition:opacity .4s cubic-bezier(.4,0,.2,1); padding:24px;',
    '}',
    '.rh-modal-mask.show { opacity:1; pointer-events:auto; }',
    '.rh-modal {',
    '  width:100%; max-width:390px; max-height:82vh;',
    '  background: linear-gradient(175deg,',
    '    rgba(255,252,252,0.97) 0%,',
    '    rgba(250,246,252,0.95) 100%);',
    '  border-radius: 20px;',
    '  border: 1px solid rgba(220,205,225,0.3);',
    '  box-shadow:',
    '    0 8px 40px rgba(180,165,200,0.15),',
    '    0 0 80px rgba(212,160,173,0.06),',
    '    inset 0 1px 1px rgba(255,255,255,0.8);',
    '  overflow:hidden;',
    '  transform:translateY(20px) scale(.96);',
    '  transition:transform .5s cubic-bezier(.34,1.56,.64,1);',
    '  display:flex; flex-direction:column;',
    '}',
    '.rh-modal-mask.show .rh-modal { transform:translateY(0) scale(1); }',
    '.rh-modal-head {',
    '  padding:20px 22px 14px;',
    '  border-bottom: 1px solid rgba(220,205,225,0.25);',
    '  display:flex; align-items:center; justify-content:space-between;',
    '}',
    '.rh-modal-title { font-size:16px; font-weight:700; margin:0; color:var(--pearl-text); }',
    '.rh-modal-close {',
    '  width:32px; height:32px; border-radius:10px;',
    '  border:1px solid var(--pearl-border);',
    '  background:transparent; color:var(--pearl-text2);',
    '  font-size:17px; cursor:pointer;',
    '  display:flex; align-items:center; justify-content:center;',
    '  transition:all .25s ease;',
    '}',
    '.rh-modal-close:hover {',
    '  background:rgba(255,255,255,0.7); color:var(--pearl-text);',
    '}',
    '.rh-modal-body { padding:18px 22px; overflow-y:auto; flex:1; }',
    '.rh-modal-foot {',
    '  padding:14px 22px;',
    '  border-top:1px solid rgba(220,205,225,0.25);',
    '  display:flex; justify-content:flex-end; gap:8px;',
    '}',

    '/* 表单 */',
    '.rh-input, .rh-select, .rh-textarea {',
    '  width:100%; padding:11px 15px; border-radius:11px;',
    '  border:1px solid var(--pearl-border);',
    '  background: rgba(255,255,255,0.6);',
    '  color:var(--pearl-text); font-size:14px; font-family:inherit;',
    '  outline:none; transition:border-color .3s ease, box-shadow .3s ease;',
    '  box-sizing:border-box;',
    '  box-shadow: inset 0 1px 2px rgba(220,205,225,0.1);',
    '}',
    '.rh-input:focus, .rh-select:focus, .rh-textarea:focus {',
    '  border-color: rgba(184,154,200,0.5);',
    '  box-shadow: 0 0 0 3px rgba(184,154,200,0.1),',
    '              inset 0 1px 2px rgba(220,205,225,0.08);',
    '}',
    '.rh-select {',
    '  cursor:pointer; -webkit-appearance:none;',
    '  background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%238B7A9E\' stroke-width=\'2.5\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E");',
    '  background-repeat:no-repeat; background-position:right 13px center;',
    '  padding-right:34px;',
    '}',
    '.rh-textarea { resize:vertical; min-height:72px; line-height:1.6; }',
    '.rh-fg { margin-bottom:16px; }',
    '.rh-fg-label {',
    '  display:block; font-size:11px; font-weight:700;',
    '  color:var(--pearl-text2); margin-bottom:7px;',
    '  text-transform:uppercase; letter-spacing:.06em;',
    '}',

    '/* 开关 */',
    '.rh-switch { position:relative; width:46px; height:26px; flex-shrink:0; }',
    '.rh-switch input { display:none; }',
    '.rh-sw-track {',
    '  position:absolute; inset:0;',
    '  background:linear-gradient(160deg,',
    '    rgba(220,210,228,0.6) 0%,',
    '    rgba(210,200,222,0.5) 100%);',
    '  border-radius:13px; cursor:pointer;',
    '  transition:background .35s ease;',
    '  border:1px solid rgba(200,188,215,0.3);',
    '  box-shadow: inset 0 1px 2px rgba(180,165,200,0.1);',
    '}',
    '.rh-sw-knob {',
    '  position:absolute; top:2.5px; left:2.5px;',
    '  width:21px; height:21px; border-radius:50%;',
    '  background:linear-gradient(145deg,#FFF 0%,#F8F4FA 100%);',
    '  box-shadow: 0 2px 6px rgba(180,165,200,0.2),',
    '              inset 0 1px 1px rgba(255,255,255,0.9);',
    '  transition:transform .35s cubic-bezier(.34,1.56,.64,1);',
    '}',
    '.rh-sw-track.on {',
    '  background:linear-gradient(160deg,',
    '    rgba(184,154,200,0.7) 0%,',
    '    rgba(162,138,182,0.65) 100%);',
    '  border-color:rgba(184,154,200,0.35);',
    '}',
    '.rh-sw-track.on .rh-sw-knob { transform:translateX(20px); }',

    '/* 空状态 */',
    '.rh-empty {',
    '  padding:36px 22px; text-align:center;',
    '  color:var(--pearl-text2); font-size:13px;',
    '  line-height:1.7;',
    '}',
    '.rh-empty-icon {',
    '  font-size:38px; margin-bottom:12px;',
    '  opacity:.35; display:inline-block;',
    '}',
    '.rh-safe-bottom { height:env(safe-area-inset-bottom,28px); }',
    '.rh-hint {',
    '  font-size:11px; color:var(--pearl-text2);',
    '  padding:10px 20px 14px; line-height:1.6; opacity:.75;',
    '}',
    '.rh-preview-img {',
    '  width:62px; height:62px; border-radius:16px;',
    '  object-fit:cover; border:2px solid var(--pearl-border);',
    '  box-shadow: 0 2px 8px rgba(180,165,200,0.1);',
    '}',

    '@keyframes rhSpin { to { transform: rotate(360deg); } }',
    '.rh-loading {',
    '  display:inline-block; width:16px; height:16px;',
    '  border:2px solid rgba(184,154,200,0.2);',
    '  border-top-color:rgba(184,154,200,0.6);',
    '  border-radius:50%; animation:rhSpin .7s linear infinite;',
    '  vertical-align:middle; margin-right:6px;',
    '}',
  ].join('\n')

  var DEFAULTS = {
    ball: { size: 52, opacity: 1, customImage: '', shape: 'circle' },
    menu: { radius: 110, itemSize: 46 },
    heartbeat: { enabled: false, intervalMs: 60000 },
    shortcuts: [],
    subPlugins: [],
  }

  function uid() { return 'hub-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
  function deepMerge(target, source) {
    var out = {}
    for (var k in target) { out[k] = target[k] }
    for (var k in source) {
      if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
        out[k] = deepMerge(target[k] || {}, source[k])
      } else { out[k] = source[k] }
    }
    return out
  }
  function escHtml(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML }
  function radialPosition(index, total, radius, ballSize) {
    var startAngle, angleStep
    if (total <= 4) { startAngle = -Math.PI * 5 / 6; angleStep = Math.PI * 4 / 6 / (total - 1 || 1) }
    else if (total <= 8) { startAngle = -Math.PI * 17 / 18; angleStep = Math.PI * 16 / 18 / (total - 1 || 1) }
    else { startAngle = -Math.PI * 3 / 4; angleStep = (Math.PI * 270 / 180) / (total - 1 || 1) }
    var angle = startAngle + angleStep * index
    var r = radius + ballSize / 2 + 12
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r }
  }

  function svgIcon(type) {
    var icons = {
      settings: '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="3"/><path d="M10 2a1.5 1.5 0 010 3 1.5 1.5 0 000-3zm0 13a1.5 1.5 0 010 3 1.5 1.5 0 000-3zM3.2 5.8a1.5 1.5 0 01-.6 2 1.5 1.5 0 01-2-.6 1.5 1.5 0 01.6-2 1.5 1.5 0 012 .6zm13.6 8.4a1.5 1.5 0 01.6 2 1.5 1.5 0 01-2 .6 1.5 1.5 0 01-.6-2 1.5 1.5 0 012 0zM2 10a1.5 1.5 0 010 3H1.5a1.5 1.5 0 010-3H2zm16.5 0a1.5 1.5 0 010 3h-.5a1.5 1.5 0 010-3h.5zM3.2 14.2a1.5 1.5 0 01-2-.6 1.5 1.5 0 01.6-2 1.5 1.5 0 012 .6 1.5 1.5 0 01-.6 2zm13.6-8.4a1.5 1.5 0 012-.6 1.5 1.5 0 01-.6 2 1.5 1.5 0 01-2-.6 1.5 1.5 0 01.6-2z"/></svg>',
      plus: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 4v12M4 10h12"/></svg>',
      link: '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 12a4 4 0 01-1-5.5L9 4.5a4 4 0 015.5 5.5L13 12m-2 2a4 4 0 001 5.5L11 15.5a4 4 0 01-5.5-5.5L7 8"/></svg>',
      heart: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 17s-7-4.4-7-9a4 4 0 017-2.5A4 4 0 0117 8c0 4.6-7 9-7 9z"/></svg>',
      rocket: '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 16c0-2 1-4 3-6L12 5c3-2 5-3 5-3s-1 2-3 5l-5 5c-2 2-4 3-6 3z"/><circle cx="13" cy="7" r="1.5"/><path d="M4 16l-1 2 2-1m11-8l2-1-1 2"/></svg>',
      user: '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="7" r="3.5"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>',
      app: '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/></svg>',
      code: '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M7 5l-4 5 4 5m6-10l4 5-4 5"/></svg>',
      star: '\u2606',
      edit: '&#9998;',
      close: '&times;',
      back: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6l-6 6m0-6l6 6"/></svg>',
    }
    return icons[type] || ''
  }

  function RocheHub(roche) {
    this.roche = roche
    this.config = null; this.ballEl = null; this.overlayEl = null; this.menuEl = null
    this.menuItems = []; this.styleEl = null; this.isOpen = false; this.isDragging = false
    this.ballPos = { x: 0, y: 0 }; this._heartbeatTimer = null; this._heartbeatTasks = []
    this._boundHandlers = {}; this._container = null; this._charList = []; this._appList = []
  }

  var p = RocheHub.prototype

  p.init = async function(container) {
    this._container = container
    await this._loadConfig()
    this._injectStyles()
    this._createBall()
    this._bindEvents()
    await this._loadLists()
    if (this.config.heartbeat.enabled) this._startHeartbeat()
    this._renderAppView()
  }

  p._loadConfig = async function() {
    try { var s = await this.roche.storage.get('config'); this.config = deepMerge(DEFAULTS, s || {}) }
    catch (e) { console.warn('[RocheHub] load config failed', e); this.config = JSON.parse(JSON.stringify(DEFAULTS)) }
  }
  p._saveConfig = async function() {
    try { await this.roche.storage.set('config', this.config) }
    catch (e) { console.warn('[RocheHub] save config failed', e) }
  }

  p._loadLists = async function() {
    try {
      if (this.roche.character && typeof this.roche.character.list === 'function') {
        this._charList = await this.roche.character.list() || []
      }
    } catch(e) { console.warn('[RocheHub] load char list failed', e) }
    try {
      if (this.roche.conversation && typeof this.roche.conversation.list === 'function') {
        this._appList = await this.roche.conversation.list() || []
      }
    } catch(e) { console.warn('[RocheHub] load conversation list failed', e) }
  }

  p._injectStyles = function() {
    this.styleEl = document.createElement('style')
    this.styleEl.textContent = CSS
    document.head.appendChild(this.styleEl)
  }

  p._createBall = function() {
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
      icon.innerHTML = svgIcon('star')
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

  p._applyBallStyle = function(ball) {
    var b = this.config.ball; var s = b.size
    ball.style.width = s + 'px'; ball.style.height = s + 'px'; ball.style.opacity = b.opacity
    if (!b.customImage) ball.style.background = 'linear-gradient(135deg, rgba(255,245,240,0.95) 0%, rgba(250,235,245,0.92) 30%, rgba(235,245,255,0.92) 70%, rgba(245,248,255,0.95) 100%)'
    else ball.style.background = 'transparent'
    switch (b.shape) {
      case 'rounded': ball.style.borderRadius = '35%'; break
      case 'square': ball.style.borderRadius = '14px'; break
      default: ball.style.borderRadius = '50%'
    }
  }

  p._bindEvents = function() {
    var self = this; var ball = this.ballEl
    if (!ball) return
    this._on(ball, 'pointerdown', function(e) { self._onDragStart.call(self, e) })
    this._on(document, 'pointermove', function(e) { self._onDragMove.call(self, e) })
    this._on(document, 'pointerup', function(e) { self._onDragEnd.call(self, e) })
    this._on(window, 'resize', function() { self._constrainBall.call(self) })
  }

  p._on = function(el, type, fn) {
    el.addEventListener(type, fn)
    this._boundHandlers[type] = this._boundHandlers[type] || []
    this._boundHandlers[type].push({ el: el, fn: fn })
  }

  p._onDragStart = function(e) {
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

  p._onDragMove = function(e) {
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

  p._onDragEnd = function(e) {
    if (this._dragPointerId == null) return
    var ball = this.ballEl
    ball.releasePointerCapture(this._dragPointerId)
    this._dragPointerId = null
    ball.style.transition = ''
    if (this.isDragging) { this.isDragging = false }
    else { this.toggleMenu() }
    ball.classList.add('idle-pulse')
  }

  p._constrainBall = function() {
    var size = this.config.ball.size; var m = 8
    this.ballPos.x = clamp(this.ballPos.x, m, window.innerWidth - size - m)
    this.ballPos.y = clamp(this.ballPos.y, m, window.innerHeight - size - m)
    if (this.ballEl) { this.ballEl.style.left = this.ballPos.x + 'px'; this.ballEl.style.top = this.ballPos.y + 'px' }
    if (this.isOpen) this._positionMenu()
  }

  p.toggleMenu = function() { this.isOpen ? this.closeMenu() : this.openMenu() }

  p.openMenu = function() {
    if (this.isOpen) return
    this.isOpen = true; var self = this
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

  p.closeMenu = function() {
    if (!this.isOpen) return; this.isOpen = false; var self = this
    this.menuItems.forEach(function(item) { item.el.classList.remove('show') })
    setTimeout(function() {
      if (self.overlayEl) { self.overlayEl.remove(); self.overlayEl = null }
      if (self.menuEl) { self.menuEl.remove(); self.menuEl = null }
      self.menuItems = []
    }, 350)
    if (this.overlayEl) this.overlayEl.classList.remove('visible')
  }

  p._positionMenu = function() {
    if (!this.menuEl || !this.ballEl) return
    var rect = this.ballEl.getBoundingClientRect(); var size = this.config.ball.size
    this.menuEl.style.left = (rect.left + size / 2) + 'px'
    this.menuEl.style.top = (rect.top + size / 2) + 'px'
  }

  p._buildMenuItems = function() {
    var items = this._getMenuItems(); var total = items.length
    var radius = this.config.menu.radius; var ballSize = this.config.ball.size; var self = this
    items.forEach(function(item, i) {
      var pos = radialPosition(i, total, radius, ballSize)
      var el = self._createMenuItem(item)
      el.style.transform = 'translate(' + pos.x + 'px, ' + pos.y + 'px) scale(0.25)'
      el.style.opacity = '0'
      self.menuEl.appendChild(el)
      self.menuItems.push({ el: el, item: item })
      setTimeout(function() { el.classList.add('show') }, 60 + i * 55)
    })
  }

  p._getMenuItems = function() {
    var items = []; var self = this
    ;(this.config.shortcuts || []).forEach(function(sc) {
      var ic = sc.icon || svgIcon('link')
      items.push({ id: sc.id, name: sc.name, icon: ic, type: sc.type, action: function() { self.closeMenu(); self._executeShortcut(sc) } })
    })
    ;(this.config.subPlugins || []).forEach(function(sp) {
      items.push({ id: sp.id, name: sp.name, icon: sp.icon || svgIcon('rocket'), type: 'subplugin', action: function() { self.closeMenu(); if (typeof sp.action === 'function') sp.action(self.roche); else self.roche.ui.toast('\u6253\u5F00 ' + sp.name) } })
    })
    items.push({ id: '__settings__', name: '\u8BBE\u7F6E', icon: svgIcon('settings'), type: 'builtin', action: function() { self.closeMenu(); self.roche.ui.openApp('roche-hub-home') } })
    return items
  }

  p._createMenuItem = function(item) {
    var wrap = document.createElement('div'); wrap.className = 'roche-hub-menu-item'
    var btn = document.createElement('div'); btn.className = 'roche-hub-menu-btn'
    btn.innerHTML = typeof item.icon === 'string' && item.icon.indexOf('<svg') >= 0 ? item.icon : item.icon
    var label = document.createElement('span'); label.className = 'roche-hub-menu-label'; label.textContent = item.name
    wrap.appendChild(btn); wrap.appendChild(label)
    wrap.addEventListener('click', function(e) { e.stopPropagation(); item.action() })
    return wrap
  }

  p._executeShortcut = async function(sc) {
    try {
      switch (sc.type) {
        case 'character':
          if (sc.targetId) {
            var charData = null
            for (var ci = 0; ci < this._charList.length; ci++) {
              if (this._charList[ci].id === sc.targetId || this._charList[ci].name === sc.targetId) { charData = this._charList[ci]; break }
            }
            if (charData && charData.conversationId) this.roche.ui.openApp('chat-' + charData.conversationId)
            else this.roche.ui.openApp('chat')
            this.roche.ui.toast('\u6B63\u5728\u524D\u5F80 ' + sc.name + ' \u7684\u5BF9\u8BDD...')
          } else { this.roche.ui.toast('\u672A\u9009\u62E9\u89D2\u8272') }
          break
        case 'app':
          if (sc.targetId) this.roche.ui.openApp(sc.targetId)
          else this.roche.ui.toast('\u672A\u9009\u62E9\u76EE\u6807\u4F1A\u8BDD')
          break
        case 'custom':
          if (sc.customAction) new Function('roche', 'hub', sc.customAction)(this.roche, this)
          else this.roche.ui.toast('\u672A\u914D\u7F6E\u52A8\u4F5C')
          break
        default: this.roche.ui.toast('\u672A\u77E5\u7C7B\u578B')
      }
    } catch (err) { console.error('[RocheHub] shortcut error:', err); this.roche.ui.toast('\u6267\u884C\u5931\u8D25: ' + err.message) }
  }

  p._renderAppView = function() {
    var c = this._container; c.innerHTML = ''
    var app = document.createElement('div'); app.className = 'rh-app'; var cfg = this.config
    app.innerHTML = ''
      + '<div class="rh-header"><div class="rh-header-inner">'
      + '  <div class="rh-logo">' + svgIcon('star') + '</div>'
      + '  <h1 class="rh-title">Hub \u60AC\u6D6E\u7403</h1>'
      + '  <p class="rh-subtitle">\u5168\u5C40\u63A7\u5236\u4E2D\u5FC3 \u00B7 \u767D\u91D1\u6781\u5149</p>'
      + '  <button class="rh-back-btn" id="rh-back-btn">' + svgIcon('back') + ' \u8FD4\u56DE\u4E3B\u754C</button>'
      + '</div></div>'
      + '<div class="rh-section"><div class="rh-section-title"><span class="rh-icon">\uD83C\uDFA8</span> \u5916\u89C2</div>'
      + '  <div class="rh-row"><div><div class="rh-row-label">\u60AC\u6D6E\u7403\u5927\u5C0F</div><div class="rh-row-desc" id="rh-size-val">' + cfg.ball.size + 'px</div></div><div class="rh-slider-wrap"><input type="range" class="rh-slider" id="rh-size" min="36" max="80" value="' + cfg.ball.size + '"></div></div>'
      + '  <div class="rh-row"><div><div class="rh-row-label">\u900F\u660E\u5EA6</div><div class="rh-row-desc" id="rh-opacity-val">' + Math.round(cfg.ball.opacity * 100) + '%</div></div><div class="rh-slider-wrap"><input type="range" class="rh-slider" id="rh-opacity" min="30" max="100" value="' + Math.round(cfg.ball.opacity * 100) + '"></div></div>'
      + '  <div class="rh-row"><div><div class="rh-row-label">\u5F62\u72B6</div></div><select class="rh-select" id="rh-shape" style="width:auto;min-width:90px;"><option value="circle"' + (cfg.ball.shape === 'circle' ? ' selected' : '') + '>\u5706\u5F62</option><option value="rounded"' + (cfg.ball.shape === 'rounded' ? ' selected' : '') + '>\u5706\u89D2</option><option value="square"' + (cfg.ball.shape === 'square' ? ' selected' : '') + '>\u65B9\u5F62</option></select></div>'
      + '  <div class="rh-row"><div><div class="rh-row-label">\u81EA\u5B9A\u4E49\u56FE\u7247</div><div class="rh-row-desc" id="rh-img-status">' + (cfg.ball.customImage ? '\u5DF2\u8BBE\u7F6E' : '\u672A\u8BBE\u7F6E') + '</div></div><label class="rh-btn rh-btn-sm">' + (cfg.ball.customImage ? '\u66F4\u6362' : '\u4E0A\u4F20') + '<input type="file" accept="image/png,image/jpeg,image/webp" id="rh-img-upload" style="display:none"></label></div>'
      + (cfg.ball.customImage ? '<div class="rh-row" style="justify-content:center;padding:14px;"><img class="rh-preview-img" id="rh-img-preview" src="' + cfg.ball.customImage + '"><button class="rh-btn rh-btn-sm rh-btn-danger" id="rh-img-clear" style="margin-left:10px;">\u6E05\u9664</button></div>' : '')
      + '</div>'
      + '<div class="rh-section"><div class="rh-section-title"><span class="rh-icon">' + svgIcon('link') + '</span> \u5FEB\u6377\u65B9\u5F0F<button class="rh-btn rh-btn-sm" id="rh-add-sc" style="margin-left:auto;">' + svgIcon('plus') + ' \u6DFB\u52A0</button></div><div id="rh-sc-list"></div></div>'
      + '<div class="rh-section"><div class="rh-section-title"><span class="rh-icon">' + svgIcon('heart') + '</span> \u540E\u53F0\u5F15\u64CE</div>'
      + '  <div class="rh-row"><div><div class="rh-row-label">\u542F\u7528\u5168\u5C40\u5FC3\u8DF3</div><div class="rh-row-desc">\u9ED8\u8BA4\u5173\u95ED\uFF0C\u5B50\u63D2\u4EF6\u53EF\u6CE8\u518C\u540E\u53F0\u4EFB\u52A1</div></div><label class="rh-switch"><input type="checkbox" id="rh-hb-toggle"' + (cfg.heartbeat.enabled ? ' checked' : '') + '><div class="rh-sw-track' + (cfg.heartbeat.enabled ? ' on' : '') + '"><div class="rh-sw-knob"></div></div></label></div>'
      + '  <div class="rh-row" id="rh-hb-row" style="' + (cfg.heartbeat.enabled ? '' : 'opacity:.4;pointer-events:none') + '"><div><div class="rh-row-label">\u5FC3\u8DF3\u95F4\u9694</div><div class="rh-row-desc" id="rh-hb-val">' + (cfg.heartbeat.intervalMs / 1000).toFixed(0) + '\u79D2</div></div><div class="rh-slider-wrap"><input type="range" class="rh-slider" id="rh-hb-interval" min="10" max="3600" value="' + (cfg.heartbeat.intervalMs / 1000) + '" step="10"></div></div>'
      + '</div>'
      + '<div class="rh-section"><div class="rh-section-title"><span class="rh-icon">' + svgIcon('rocket') + '</span> \u5DF2\u6CE8\u518C\u5B50\u63D2\u4EF6</div><div id="rh-sp-list"></div></div>'
      + '<div class="rh-safe-bottom"></div>'
    c.appendChild(app)
    this._bindAppEvents(app)
    this._renderShortcutList()
    this._renderSubPluginList()
  }

  p._bindAppEvents = function(app) {
    var self = this
    app.querySelector('#rh-back-btn').addEventListener('click', function() { self.roche.ui.closeApp() })
    var szSlider = app.querySelector('#rh-size'); var szVal = app.querySelector('#rh-size-val')
    szSlider.addEventListener('input', async function() { var v = parseInt(szSlider.value); self.config.ball.size = v; szVal.textContent = v + 'px'; self._applyBallStyle(self.ballEl); await self._saveConfig() })
    var opSlider = app.querySelector('#rh-opacity'); var opVal = app.querySelector('#rh-opacity-val')
    opSlider.addEventListener('input', async function() { var v = parseInt(opSlider.value) / 100; self.config.ball.opacity = v; opVal.textContent = Math.round(v * 100) + '%'; self._applyBallStyle(self.ballEl); await self._saveConfig() })
    var shapeSel = app.querySelector('#rh-shape')
    shapeSel.addEventListener('change', async function() { self.config.ball.shape = shapeSel.value; self._applyBallStyle(self.ballEl); await self._saveConfig() })
    var imgUpload = app.querySelector('#rh-img-upload')
    imgUpload.addEventListener('change', async function(e) {
      var file = e.target.files[0]; if (!file) return
      var reader = new FileReader()
      reader.onload = async function(ev) { self.config.ball.customImage = ev.target.result; await self._saveConfig(); self._applyBallStyle(self.ballEl); var inner = self.ballEl.querySelector('.roche-hub-ball-inner'); if (inner) { inner.style.backgroundImage = 'url(' + ev.target.result + ')'; inner.innerHTML = '' }; self._renderAppView() }
      reader.readAsDataURL(file)
    })
    var clearBtn = app.querySelector('#rh-img-clear')
    if (clearBtn) clearBtn.addEventListener('click', async function() { self.config.ball.customImage = ''; await self._saveConfig(); self._applyBallStyle(self.ballEl); var inner = self.ballEl.querySelector('.roche-hub-ball-inner'); if (inner) { inner.style.backgroundImage = ''; inner.innerHTML = '<span class="roche-hub-ball-icon">' + svgIcon('star') + '</span>' }; self._renderAppView() })
    app.querySelector('#rh-add-sc').addEventListener('click', function() { self._showShortcutModal() })
    var hbToggle = app.querySelector('#rh-hb-toggle'); var hbRow = app.querySelector('#rh-hb-row')
    var hbTrack = app.querySelector('#rh-hb-toggle').parentElement.querySelector('.rh-sw-track')
    hbToggle.addEventListener('change', async function() {
      self.config.heartbeat.enabled = hbToggle.checked
      hbRow.style.opacity = hbToggle.checked ? '' : '.4'; hbRow.style.pointerEvents = hbToggle.checked ? '' : 'none'
      if (hbToggle.checked) hbTrack.classList.add('on'); else hbTrack.classList.remove('on')
      await self._saveConfig()
      if (hbToggle.checked) self._startHeartbeat(); else self._stopHeartbeat()
    })
    var hbInterval = app.querySelector('#rh-hb-interval'); var hbVal = app.querySelector('#rh-hb-val')
    hbInterval.addEventListener('input', async function() { var sec = parseInt(hbInterval.value); self.config.heartbeat.intervalMs = sec * 1000; hbVal.textContent = sec + '\u79D2'; await self._saveConfig(); if (self.config.heartbeat.enabled) self._restartHeartbeat() })
  }

  p._renderShortcutList = function() {
    var listEl = document.querySelector('#rh-sc-list'); if (!listEl) return
    var shorts = this.config.shortcuts || []; var self = this
    if (shorts.length === 0) { listEl.innerHTML = '<div class="rh-empty"><div class="rh-empty-icon">' + svgIcon('link') + '</div>\u8FD8\u6CA1\u6709\u5FEB\u6377\u65B9\u5F0F<br>\u70B9\u51FB\u201C+\u6DFB\u52A0\u201D\u521B\u5EFA</div>'; return }
    var labels = { character: '\u89D2\u8272\u804A\u5929', app: '\u4F1A\u8BDD\u8DF3\u8F6C', custom: '\u81EA\u5B9A\u4E49\u52A8\u4F5C' }
    var icMap = { character: svgIcon('user'), app: svgIcon('app'), custom: svgIcon('code') }
    listEl.innerHTML = shorts.map(function(sc, idx) {
      var ic = icMap[sc.type] || svgIcon('link'); var tl = labels[sc.type] || sc.type; var targetName = sc.targetName || sc.targetId || ''
      return '<div class="rh-sc-item" data-idx="' + idx + '"><div class="rh-sc-icon-wrap">' + ic + '</div><div class="rh-sc-info"><div class="rh-sc-name">' + escHtml(sc.name) + '</div><div class="rh-sc-type">' + tl + (targetName ? ' \u00B7 ' + escHtml(targetName) : '') + '</div></div><div class="rh-sc-actions"><button class="rh-sc-act-btn edit-btn" title="\u7F16\u8F91">' + svgIcon('edit') + '</button><button class="rh-sc-act-btn danger del-btn" title="\u5220\u9664">' + svgIcon('close') + '</button></div></div>'
    }).join('')
    listEl.querySelectorAll('.edit-btn').forEach(function(btn, i) { btn.addEventListener('click', function() { self._showShortcutModal(i) }) })
    listEl.querySelectorAll('.del-btn').forEach(function(btn, i) { btn.addEventListener('click', function() { self._deleteShortcut(i) }) })
  }

  p._showShortcutModal = function(editIdx) {
    var isEdit = typeof editIdx === 'number'
    var sc = isEdit ? this.config.shortcuts[editIdx] : { id: uid(), name: '', type: 'character', targetId: '', targetName: '', icon: '', customAction: '' }
    var self = this; var mask = document.createElement('div'); mask.className = 'rh-modal-mask'
    var charOptions = '<option value="">-- \u8BF7\u9009\u62E9\u89D2\u8272 --</option>'
    ;(this._charList || []).forEach(function(ch) { var cid = ch.id || ch.uuid || ch.name || ''; var cname = ch.handle || ch.name || ch.displayName || cid; var sel = (sc.targetId === cid) ? ' selected' : ''; charOptions += '<option value="' + escHtml(cid) + '"' + sel + '>' + escHtml(cname) + '</option>' })
    if (this._charList.length === 0) charOptions = '<option value="" disabled>\u672A\u83B7\u53D6\u5230\u89D2\u8272\u5217\u8868</option>'
    var appOptions = '<option value="">-- \u8BF7\u9009\u62E9\u4F1A\u8BDD --</option>'
    ;(this._appList || []).forEach(function(ap) { var aid = ap.conversationId || ap.id || ''; var aname = ap.handle || ap.name || ap.title || aid; if (ap.isGroup) aname = '\uD83D\uDCAC ' + aname; var sel = (sc.targetId === aid) ? ' selected' : ''; appOptions += '<option value="' + escHtml(aid) + '"' + sel + '>' + escHtml(aname) + '</option>' })
    if (this._appList.length === 0) appOptions = '<option value="" disabled>\u672A\u83B7\u53D6\u5230\u4F1A\u8BDD\u5217\u8868</option>'
    mask.innerHTML = '<div class="rh-modal"><div class="rh-modal-head"><h3 class="rh-modal-title">' + (isEdit ? '\u7F16\u8F91\u5FEB\u6377\u65B9\u5F0F' : '\u6DFB\u52A0\u5FEB\u6377\u65B9\u5F0F') + '</h3><button class="rh-modal-close rh-mclose">&times;</button></div><div class="rh-modal-body">'
      + '<div class="rh-fg"><label class="rh-fg-label">\u540D\u79F0 *</label><input class="rh-input" id="ms-name" value="' + escHtml(sc.name) + '" placeholder="\u4F8B\u5982\uFF1A\u548C\u6C88\u785A\u804A\u5929"></div>'
      + '<div class="rh-fg"><label class="rh-fg-label">\u7C7B\u578B</label><select class="rh-select" id="ms-type"><option value="character"' + (sc.type === 'character' ? ' selected' : '') + '>\uD83D\uDC64 \u89D2\u8272\u804A\u5929</option><option value="app"' + (sc.type === 'app' ? ' selected' : '') + '>\uD83D\uDCAC \u4F1A\u8BDD\u8DF3\u8F6C</option><option value="custom"' + (sc.type === 'custom' ? ' selected' : '') + '>\u2728 \u81EA\u5B9A\u4E49\u52A8\u4F5C</option></select></div>'
      + '<div class="rh-fg" id="ms-char-group"><label class="rh-fg-label">\u9009\u62E9\u89D2\u8272</label><select class="rh-select" id="ms-target">' + charOptions + '</select><div class="rh-hint">\u4ECE\u5DF2\u5B89\u88C5\u7684\u89D2\u8272\u5217\u8868\u4E2D\u9009\u62E9\u3002</div></div>'
      + '<div class="rh-fg" id="ms-app-group" style="display:none"><label class="rh-fg-label">\u9009\u62E9\u4F1A\u8BDD</label><select class="rh-select" id="ms-target-app">' + appOptions + '</select><div class="rh-hint">\u4ECE\u5DF2\u6709\u7684\u4F1A\u8BDD\u5217\u8868\u4E2D\u9009\u62E9\uFF0C\u5305\u542B\u5355\u804A\u548C\u7FA4\u804A\u3002</div></div>'
      + '<div class="rh-fg" id="ms-custom-group" style="' + (sc.type === 'custom' ? '' : 'display:none') + '"><label class="rh-fg-label">\u81EA\u5B9A\u4E49\u811A\u672C</label><textarea class="rh-textarea" id="ms-custom" placeholder="function(roche, hub) { ... }">' + escHtml(sc.customAction || '') + '</textarea><div class="rh-hint">\u53EF\u7528\u53C2\u6570\uFF1Aroche\uFF08API\uFF09\u3001hub\uFF08Hub\u5B9E\u4F8B\uFF09</div></div>'
      + '<div class="rh-fg"><label class="rh-fg-label">\u56FE\u6807\uFF08\u53EF\u9009\uFF09</label><input class="rh-input" id="ms-icon" value="' + escHtml(sc.icon || '') + '" placeholder="emoji \u6216\u5B57\u7B26"></div>'
      + '</div><div class="rh-modal-foot"><button class="rh-btn ms-cancel">\u53D6\u6D88</button><button class="rh-btn rh-btn-primary ms-save">' + (isEdit ? '\u4FDD\u5B58' : '\u6DFB\u52A0') + '</button></div></div>'
    document.body.appendChild(mask)
    requestAnimationFrame(function() { mask.classList.add('show') })
    var typeSel = mask.querySelector('#ms-type'); var charGroup = mask.querySelector('#ms-char-group'); var appGroup = mask.querySelector('#ms-app-group'); var custGroup = mask.querySelector('#ms-custom-group')
    typeSel.addEventListener('change', function() { charGroup.style.display = typeSel.value === 'character' ? '' : 'none'; appGroup.style.display = typeSel.value === 'app' ? '' : 'none'; custGroup.style.display = typeSel.value === 'custom' ? '' : 'none' })
    mask.querySelector('.rh-mclose').addEventListener('click', function() { self._closeModal(mask) })
    mask.querySelector('.ms-cancel').addEventListener('click', function() { self._closeModal(mask) })
    mask.querySelector('.ms-save').addEventListener('click', async function() {
      var name = mask.querySelector('#ms-name').value.trim()
      if (!name) { self.roche.ui.toast('\u8BF7\u8F93\u5165\u540D\u79F0'); return }
      var targetType = typeSel.value; var targetId = ''; var targetName = ''
      if (targetType === 'character') { targetId = mask.querySelector('#ms-target').value; var selOpt = mask.querySelector('#ms-target option:checked'); targetName = selOpt ? selOpt.text : targetId }
      else if (targetType === 'app') { targetId = mask.querySelector('#ms-target-app').value; var selAppOpt = mask.querySelector('#ms-target-app option:checked'); targetName = selAppOpt ? selAppOpt.text : targetId }
      var data = { id: sc.id, name: name, type: targetType, targetId: targetId, targetName: targetName, icon: mask.querySelector('#ms-icon').value.trim(), customAction: mask.querySelector('#ms-custom').value.trim() }
      if (isEdit) self.config.shortcuts[editIdx] = data; else self.config.shortcuts.push(data)
      await self._saveConfig(); self._closeModal(mask); self._renderShortcutList()
      self.roche.ui.toast(isEdit ? '\u5DF2\u4FDD\u5B58' : '\u5DF2\u6DFB\u52A0')
    })
  }

  p._deleteShortcut = function(idx) {
    var self = this
    this.roche.ui.confirm({ title: '\u5220\u9664\u786E\u8BA4', message: '\u786E\u5B9A\u8981\u5220\u9664\u300C' + this.config.shortcuts[idx].name + '\u300D\u5417\uFF1F' }).then(function(ok) {
      if (ok) { self.config.shortcuts.splice(idx, 1); self._saveConfig().then(function() { self._renderShortcutList(); self.roche.ui.toast('\u5DF2\u5220\u9664') }) }
    }).catch(function() {})
  }

  p._closeModal = function(mask) { mask.classList.remove('show'); setTimeout(function() { mask.remove() }, 380) }

  p._renderSubPluginList = function() {
    var listEl = document.querySelector('#rh-sp-list'); if (!listEl) return
    var plugins = this.config.subPlugins || []
    if (plugins.length === 0) { listEl.innerHTML = '<div class="rh-empty"><div class="rh-empty-icon">' + svgIcon('rocket') + '</div>\u6682\u65E0\u5B50\u63D2\u4EF6<br>\u672A\u6765\u5B89\u88C5\u7684\u63D2\u4EF6\u4F1A\u5728\u6B64\u663E\u793A</div>'; return }
    listEl.innerHTML = plugins.map(function(sp) { return '<div class="rh-sc-item"><div class="rh-sc-icon-wrap">' + (sp.icon || svgIcon('rocket')) + '</div><div class="rh-sc-info"><div class="rh-sc-name">' + escHtml(sp.name) + '</div><div class="rh-sc-type">ID: ' + sp.id + (sp.version ? ' \u00B7 v' + sp.version : '') + '</div></div></div>' }).join('')
  }

  p._startHeartbeat = function() { this._stopHeartbeat(); var interval = this.config.heartbeat.intervalMs || 60000; var self = this; this._heartbeatTimer = setInterval(async function() { await self._runHeartbeatTick() }, interval); console.log('[RocheHub] heartbeat started, interval=' + (interval / 1000) + 's') }
  p._stopHeartbeat = function() { if (this._heartbeatTimer) { clearInterval(this._heartbeatTimer); this._heartbeatTimer = null } }
  p._restartHeartbeat = function() { if (this.config.heartbeat.enabled) this._startHeartbeat() }

  p._runHeartbeatTick = async function() {
    var tasks = this._heartbeatTasks.filter(function(t) { return t.enabled !== false })
    if (tasks.length === 0) return; var now = Date.now(); var self = this
    for (var i = 0; i < tasks.length; i++) { var task = tasks[i]; try { if (task.lastRun && (now - task.lastRun) < (task.intervalMs || this.config.heartbeat.intervalMs)) continue; task.lastRun = now; if (task.type === 'timer' && typeof task.handler === 'function') await task.handler({ roche: self.roche, hub: self, timestamp: now }) } catch (err) { console.error('[RocheHub] task [' + task.id + '] error:', err) } }
  }

  p.registerSubPlugin = function(options) {
    if (!options || !options.id) { console.error('[RocheHub] registerSubPlugin: missing id'); return false }
    var existing = -1
    for (var ei = 0; ei < this.config.subPlugins.length; ei++) { if (this.config.subPlugins[ei].id === options.id) { existing = ei; break } }
    var pluginData = { id: options.id, name: options.name || options.id, icon: options.icon || svgIcon('rocket'), version: options.version || '', action: options.action || null, requireContext: options.requireContext || null }
    if (existing >= 0) this.config.subPlugins[existing] = pluginData; else this.config.subPlugins.push(pluginData)
    if (options.task) { var taskData = { pluginId: options.id }; for (var tk in options.task) { taskData[tk] = options.task[tk] }; this._registerTask(taskData) }
    this._saveConfig(); this._renderSubPluginList()
    console.log('[RocheHub] sub-plugin registered: ' + pluginData.name + ' (' + pluginData.id + ')')
    return true
  }

  p.unregisterSubPlugin = function(pluginId) {
    this.config.subPlugins = this.config.subPlugins.filter(function(p) { return p.id !== pluginId })
    this._heartbeatTasks = this._heartbeatTasks.filter(function(t) { return t.pluginId !== pluginId })
    this._saveConfig(); this._renderSubPluginList()
  }

  p._registerTask = function(task) {
    if (!task.id || !task.pluginId) return
    this._heartbeatTasks = this._heartbeatTasks.filter(function(t) { return t.id !== task.id })
    this._heartbeatTasks.push({ id: task.id, pluginId: task.pluginId, type: task.type || 'timer', handler: task.handler, intervalMs: task.intervalMs || null, enabled: task.enabled !== false, config: task.config || {}, lastRun: 0 })
  }

  p.destroy = function() {
    this._stopHeartbeat()
    if (this.ballEl) { this.ballEl.remove(); this.ballEl = null }
    this.closeMenu()
    if (this.overlayEl) { this.overlayEl.remove(); this.overlayEl = null }
    if (this.styleEl) { this.styleEl.remove(); this.styleEl = null }
    for (var type in this._boundHandlers) { this._boundHandlers[type].forEach(function(h) { h.el.removeEventListener(type, h.fn) }) }
    this._boundHandlers = {}
    if (this._container) { this._container.replaceChildren(); this._container = null }
    this._heartbeatTasks = []
  }

  var _hubInstance = null

  window.RochePlugin.register({
    id: 'roche-hub',
    name: 'Hub \u60AC\u6D6E\u7403',
    version: '1.0.5',
    icon: '\u2606',
    apps: [{
      id: 'roche-hub-home',
      name: 'Hub \u60AC\u6D6E\u7403',
      icon: 'extension',
      iconImage: '',
      mount: async function(container, roche) { if (_hubInstance) _hubInstance.destroy(); _hubInstance = new RocheHub(roche); await _hubInstance.init(container) },
      unmount: async function(container, roche) { if (_hubInstance) { _hubInstance.destroy(); _hubInstance = null } },
    }],
  })

  if (!window.RocheHubAPI) {
    window.RocheHubAPI = {
      registerSubPlugin: function(options) { if (_hubInstance) return _hubInstance.registerSubPlugin(options); console.warn('[RocheHubAPI] not ready'); return false },
      unregisterSubPlugin: function(pluginId) { if (_hubInstance) _hubInstance.unregisterSubPlugin(pluginId) },
      getInstance: function() { return _hubInstance },
    }
  }
})()