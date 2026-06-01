(() => {
  let isHijacking = true;

  // 💥 恢复：最原始、最稳定、100%能用的第一版爬虫！没有任何乱七八糟的超时和并发！
  async function fetchWebData(url) {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("网络请求失败");
    
    const data = await res.json();
    const html = data.contents || ''; 
    
    // 如果碰到了防爬验证码
    if (html.includes('验证码') || html.includes('403 Forbidden')) {
      return { title: '分享了一个网页', desc: '该网页有隐私限制，建议直接打开原链接查看。' };
    }

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/\s*-\s*小红书.*/i, '').replace(/_哔哩哔哩_bilibili.*/i, '').trim() : '分享网页';
    
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                      html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
    let desc = descMatch ? descMatch[1].trim() : '该网页没有提供详细摘要。';

    return { title, desc };
  }

  function showToast(msg) {
    const api = window.Roche || window.roche;
    if (api && api.ui) api.ui.toast(msg);
  }

  function getPlatformStyle(url) {
    if (url.includes('xiaohongshu') || url.includes('xhslink')) 
      return { name: "小红书", icon: "📕", color: "rgba(255,36,66,0.85)", border: "rgba(255,36,66,0.3)" };
    if (url.includes('zhihu.com') || url.includes('zhibo')) 
      return { name: "知乎", icon: "📘", color: "rgba(0,102,255,0.85)", border: "rgba(0,102,255,0.3)" };
    if (url.includes('weibo.com') || url.includes('weibo.cn')) 
      return { name: "微博", icon: "👁️", color: "rgba(230,22,45,0.85)", border: "rgba(230,22,45,0.3)" };
    if (url.includes('bilibili.com') || url.includes('b23.tv')) 
      return { name: "Bilibili", icon: "📺", color: "rgba(251,114,153,0.85)", border: "rgba(251,114,153,0.3)" };
    return { name: "网页分享", icon: "🔗", color: "rgba(100,100,120,0.85)", border: "rgba(100,100,120,0.3)" };
  }

  document.addEventListener('keydown', async (e) => {
    if (!isHijacking) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      const el = e.target;
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        
        if (el.dataset.autoSend === "true") {
          setTimeout(() => { el.dataset.autoSend = ""; }, 100);
          return; 
        }

        const text = el.value || '';
        const match = text.match(/https?:\/\/[^\s]+/i);

        if (match) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          const url = match[0];
          el.disabled = true;

          try {
            showToast("✨ 正在使用最强引擎提取内容...");
            
            // 💥 恢复：最简单粗暴的调用
            let data = { title: "提取失败", desc: "网络异常" };
            try { 
              data = await fetchWebData(url); 
            } catch (err) {
              console.error(err);
            }

            const theme = getPlatformStyle(url);
            
            let cleanText = text
              .replace(/把口令拷走，打开【小红书】查看详情~/g, '')
              .replace(/\[新版小红书\]/g, '')
              .replace(/3 亿人的生活经验，都在小红书/g, '')
              .replace(url, '').trim(); 
            
            const userComment = cleanText ? `<div class="xh-u">💬 "${cleanText}"</div>` : '';
            
            // 💥 恢复：纯净高颜值 CSS 卡片，且标题摘要直接暴露在 HTML 里供 AI 读取！
            const css = `<style>.xh-w{display:block!important;width:100%;max-width:320px;min-width:260px;box-sizing:border-box;margin:10px 0;font-family:system-ui,-apple-system,sans-serif}.xh-b{background:rgba(25,25,30,0.8);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid ${theme.border};border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.2)}.xh-h{display:flex;align-items:center;padding:8px 12px;background:linear-gradient(90deg,${theme.color} 0%,rgba(255,255,255,0.05) 100%);color:#fff;font-size:12px;font-weight:bold;letter-spacing:1px}.xh-c{padding:14px}.xh-t{font-size:15px;font-weight:600;color:#f0f0f0;margin-bottom:8px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.xh-d{font-size:13px;color:#aaa;line-height:1.6;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.xh-u{padding:10px 14px;background:rgba(255,255,255,0.05);border-top:1px solid rgba(255,255,255,0.1);font-size:14px;color:#e2e8f0;font-style:italic}</style>`;
            
            // 没有 display:none！AI 能直接读到 xh-t 和 xh-d 里面的真实文字！
            const finalMsg = `${css}<div class="xh-w"><div class="xh-b"><div class="xh-h">${theme.icon} ${theme.name} · 笔记分享</div><div class="xh-c"><div class="xh-t">${data.title}</div><div class="xh-d">${data.desc}</div></div>${userComment}</div></div>`;

            // 抹杀换行，完美渲染
            el.value = finalMsg.replace(/\n/g, '').replace(/\r/g, '');
            el.dispatchEvent(new Event('input', { bubbles: true }));
            
            // 自动回车发送
            setTimeout(() => {
              el.dataset.autoSend = "true";
              el.disabled = false;
              el.focus(); 
              el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            }, 150);

          } catch (err) {
            showToast("系统错误，提取失败");
            el.disabled = false;
            el.focus();
          }
        }
      }
    }
  }, true);

  window.RochePlugin.register({
    id: "roche-universal-parser",
    name: "🌍 初心图文引擎",
    version: "20.0.0",
    apps: [] 
  });
})();
