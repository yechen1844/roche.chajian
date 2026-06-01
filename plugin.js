(() => {
  let isHijacking = true;

  // ✨ 核心大脑：智能动态路由抓取引擎
  async function fetchSmartData(url) {
    let title = "";
    let desc = "";

    // ==========================================
    // 轨道 A：【动态网页克星】专抓知乎、B站、微博
    // ==========================================
    if (url.includes('zhihu.com') || url.includes('bilibili.com') || url.includes('b23.tv') || url.includes('weibo.com')) {
      try {
        const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data.title && !json.data.title.includes('安全中心') && !json.data.title.includes('验证码')) {
            title = json.data.title.replace(/ - 知乎/i, '').replace(/_哔哩哔哩_bilibili.*/i, '').trim();
            desc = json.data.description || '（该网页未提供详细摘要）';
            return { title, desc };
          }
        }
      } catch (e) {
        console.warn("云端浏览器解析失败");
      }
    }

    // ==========================================
    // 轨道 B：【小红书克星】底层代理集群强抓静态源码
    // ==========================================
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://api.codetabs.com/v1/proxy?quest=${url}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`
    ];

    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy);
        if (res.ok) {
          const data = await res.text();
          const html = proxy.includes('allorigins') ? (JSON.parse(data).contents || '') : data;

          if (html && !html.includes('验证码') && !html.includes('安全防护') && !html.includes('403 Forbidden')) {
            const titleMatch = html.match(/<title>(.*?)<\/title>/i);
            const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                              html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
            if (titleMatch) {
              title = titleMatch[1].replace(/\s*-\s*小红书.*/i, '').replace(/ - 知乎/i, '').trim();
              desc = descMatch ? descMatch[1].trim() : '（该网页未提供详细摘要）';
              return { title, desc };
            }
          }
        }
      } catch (e) {
        // 默默尝试下一个代理
      }
    }

    throw new Error("所有爬虫轨道均被拦截");
  }

  function showToast(msg) {
    const api = window.Roche || window.roche;
    if (api && api.ui) api.ui.toast(msg);
  }

  function getPlatformStyle(url) {
    if (url.includes('xiaohongshu') || url.includes('xhslink')) return { name: "小红书", icon: "📕", color: "rgba(255,36,66,0.85)", border: "rgba(255,36,66,0.3)" };
    if (url.includes('zhihu.com') || url.includes('zhibo')) return { name: "知乎", icon: "📘", color: "rgba(0,102,255,0.85)", border: "rgba(0,102,255,0.3)" };
    if (url.includes('weibo.com') || url.includes('weibo.cn')) return { name: "微博", icon: "👁️", color: "rgba(230,22,45,0.85)", border: "rgba(230,22,45,0.3)" };
    if (url.includes('bilibili.com') || url.includes('b23.tv')) return { name: "Bilibili", icon: "📺", color: "rgba(251,114,153,0.85)", border: "rgba(251,114,153,0.3)" };
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
            showToast("✨ 智能路由分配中，极速抓取...");
            
            let data = { title: "", desc: "" };

            try { 
              data = await fetchSmartData(url); 
            } catch (err) {
              console.warn("网络抓取受阻，启动文本降级！");
            }

            const theme = getPlatformStyle(url);
            
            // 无论抓取成功与否，都要清洗用户的原文
            let rawText = text
              .replace(url, '')
              .replace(/把口令拷走，打开【小红书】查看详情~/g, '')
              .replace(/\[新版小红书\]/g, '')
              .replace(/3 亿人的生活经验，都在小红书/g, '')
              .trim(); 
            
            // 终极兜底：如果没抓到，用原贴分享文案做标题
            if (!data.title) {
              data.title = rawText || `分享了一个${theme.name}链接`;
              data.desc = "（因网站安全策略限制，未能读取更多详情，请直接打开原链接查看。）";
              rawText = ""; 
            }

            const userComment = rawText ? `<div class="xh-u">💬 "${rawText}"</div>` : '';
            
            // 绝美纯文字 UI，AI 直接穿透读取 HTML 标签内的文字
            const css = `<style>.xh-w{display:block!important;width:100%;max-width:320px;min-width:260px;box-sizing:border-box;margin:10px 0;font-family:system-ui,-apple-system,sans-serif}.xh-b{background:rgba(25,25,30,0.8);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid ${theme.border};border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.2)}.xh-h{display:flex;align-items:center;padding:8px 12px;background:linear-gradient(90deg,${theme.color} 0%,rgba(255,255,255,0.05) 100%);color:#fff;font-size:12px;font-weight:bold;letter-spacing:1px}.xh-c{padding:14px}.xh-t{font-size:15px;font-weight:600;color:#f0f0f0;margin-bottom:8px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.xh-d{font-size:13px;color:#aaa;line-height:1.6;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.xh-u{padding:10px 14px;background:rgba(255,255,255,0.05);border-top:1px solid rgba(255,255,255,0.1);font-size:14px;color:#e2e8f0;font-style:italic}</style>`;
            
            const finalMsg = `${css}<div class="xh-w"><div class="xh-b"><div class="xh-h">${theme.icon} ${theme.name} · 分享</div><div class="xh-c"><div class="xh-t">${data.title}</div><div class="xh-d">${data.desc}</div></div>${userComment}</div></div>`;

            el.value = finalMsg.replace(/\n/g, '').replace(/\r/g, '');
            el.dispatchEvent(new Event('input', { bubbles: true }));
            
            setTimeout(() => {
              el.dataset.autoSend = "true";
              el.disabled = false;
              el.focus(); 
              el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            }, 150);

          } catch (err) {
            showToast("系统致命错误");
            el.disabled = false;
            el.focus();
          }
        }
      }
    }
  }, true);

  window.RochePlugin.register({
    id: "roche-universal-parser",
    name: "🌍 智能路由通杀版",
    version: "23.0.0",
    apps: [] 
  });
})();
