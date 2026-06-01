(() => {
  let isHijacking = true;

  // 💥 真正的全网通杀爬虫：Microlink 云端浏览器 + 3重代理暴力扒取
  async function fetchWebData(url) {
    
    // 轨道 1：调用 Microlink 云端浏览器。它能完美解析知乎、B站、微博的动态代码！
    try {
      const microUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000); // 6秒耐心等云端浏览器渲染
      const res = await fetch(microUrl, { signal: controller.signal });
      clearTimeout(id);
      
      if (res.ok) {
        const json = await res.json();
        // 只要不是抓到了验证码拦截页，就直接返回！
        if (json.status === 'success' && json.data.title && !json.data.title.includes('安全中心') && !json.data.title.includes('验证码')) {
          return {
            title: json.data.title.replace(/\s*-\s*小红书.*/i, '').replace(/_哔哩哔哩_bilibili.*/i, '').replace(/ - 知乎/i, '').trim(),
            desc: json.data.description || '该网页没有提供详细摘要。'
          };
        }
      }
    } catch(e) {
      console.warn("云端浏览器受阻，启动暴力强抓模式...");
    }

    // 轨道 2：如果云端浏览器被小红书拦截，启动 3 重底层代理暴力抓取
    const proxies = [
      `https://api.codetabs.com/v1/proxy?quest=${url}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    ];
    
    for (const proxy of proxies) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(proxy, { signal: controller.signal });
        clearTimeout(id);

        if (res.ok) {
          const data = await res.text();
          const html = proxy.includes('allorigins') ? (JSON.parse(data).contents || '') : data;
          
          if (html && !html.includes('验证码') && !html.includes('安全验证') && html.includes('<title>')) {
            const titleMatch = html.match(/<title>(.*?)<\/title>/i);
            const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                              html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
            if (titleMatch) {
              return {
                title: titleMatch[1].replace(/\s*-\s*小红书.*/i, '').replace(/_哔哩哔哩_bilibili.*/i, '').replace(/ - 知乎/i, '').trim(),
                desc: descMatch ? descMatch[1].trim() : '该网页没有提供详细摘要。'
              };
            }
          }
        }
      } catch (e) {}
    }

    throw new Error("全网抓取失败");
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
            showToast("✨ 全网最强爬虫引擎已启动...");
            
            // 执行顶级爬虫
            let data = { title: "提取失败", desc: "由于该网站权限极高，无法读取摘要。" };
            try { 
              data = await fetchWebData(url); 
            } catch (err) {
              console.warn("所有防线均无法突破", err);
            }

            const theme = getPlatformStyle(url);
            
            // 清理用户复制带进来的冗余口令
            let cleanText = text
              .replace(/把口令拷走，打开【小红书】查看详情~/g, '')
              .replace(/\[新版小红书\]/g, '')
              .replace(/3 亿人的生活经验，都在小红书/g, '')
              .replace(url, '').trim(); 
            
            const userComment = cleanText ? `<div class="xh-u">💬 "${cleanText}"</div>` : '';
            
            // 💥 绝美 UI 重铸：透明玻璃质感，不加图片防止黑块，文本全公开让 AI 爽读！
            const css = `<style>.xh-w{display:block!important;width:100%;max-width:320px;min-width:260px;box-sizing:border-box;margin:10px 0;font-family:system-ui,-apple-system,sans-serif}.xh-b{background:rgba(25,25,30,0.8);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid ${theme.border};border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.2)}.xh-h{display:flex;align-items:center;padding:8px 12px;background:linear-gradient(90deg,${theme.color} 0%,rgba(255,255,255,0.05) 100%);color:#fff;font-size:12px;font-weight:bold;letter-spacing:1px}.xh-c{padding:14px}.xh-t{font-size:15px;font-weight:600;color:#f0f0f0;margin-bottom:8px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.xh-d{font-size:13px;color:#aaa;line-height:1.6;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.xh-u{padding:10px 14px;background:rgba(255,255,255,0.05);border-top:1px solid rgba(255,255,255,0.1);font-size:14px;color:#e2e8f0;font-style:italic}</style>`;
            
            // 彻底去除 display:none，让文字裸露在 HTML 中，完美兼顾人类视觉与 AI 读取！
            const finalMsg = `${css}<div class="xh-w"><div class="xh-b"><div class="xh-h">${theme.icon} ${theme.name} · 分享</div><div class="xh-c"><div class="xh-t">${data.title}</div><div class="xh-d">${data.desc}</div></div>${userComment}</div></div>`;

            // 极限单行注入
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
            showToast("系统级错误，提取失败");
            el.disabled = false;
            el.focus();
          }
        }
      }
    }
  }, true);

  window.RochePlugin.register({
    id: "roche-universal-parser",
    name: "🌍 全网制霸引擎",
    version: "21.0.0",
    apps: [] 
  });
})();
