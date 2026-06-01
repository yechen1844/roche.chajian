(() => {
  // --- 极速图文抓取引擎 (并发竞速) ---
  async function fetchWebData(url) {
    return new Promise((resolve, reject) => {
      const proxies = [
        `https://api.codetabs.com/v1/proxy?quest=${url}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      ];
      
      let failCount = 0;
      let resolved = false;

      proxies.forEach(async (proxy) => {
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 4500);
          const res = await fetch(proxy, { signal: controller.signal });
          clearTimeout(id);

          if (res.ok && !resolved) {
            const data = await res.text();
            const html = proxy.includes('allorigins') ? JSON.parse(data).contents : data;
            
            if (html && !html.includes('验证码') && html.includes('<title>')) {
              resolved = true;
              
              // 1. 抓标题
              const titleMatch = html.match(/<title>(.*?)<\/title>/i);
              let title = titleMatch ? titleMatch[1].replace(/\s*-\s*小红书.*/i, '').replace(/_哔哩哔哩_bilibili.*/i, '').trim() : '分享网页';
              
              // 2. 抓摘要
              const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                                html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
              let desc = descMatch ? descMatch[1].trim() : '该网页没有提供详细摘要。';

              // 3. ✨ 核心突破：抓取隐藏的官方封面图 (og:image)
              const imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["']/i) ||
                               html.match(/<meta[^>]*name=["']image["'][^>]*content=["'](.*?)["']/i) ||
                               html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["'](.*?)["']/i);
              let imgUrl = imgMatch ? imgMatch[1] : '';

              resolve({ title, desc, imgUrl });
            }
          }
        } catch (e) {}
        
        failCount++;
        if (failCount === proxies.length && !resolved) reject(new Error("抓取失败"));
      });
    });
  }

  function showToast(msg) {
    const api = window.Roche || window.roche;
    if (api && api.ui) api.ui.toast(msg);
  }

  function getPlatformStyle(url) {
    if (url.includes('xiaohongshu') || url.includes('xhslink')) 
      return { name: "小红书", icon: "📕", color: "rgba(255,36,66,0.9)", border: "rgba(255,36,66,0.3)" };
    if (url.includes('zhihu.com') || url.includes('zhibo')) 
      return { name: "知乎", icon: "📘", color: "rgba(0,102,255,0.9)", border: "rgba(0,102,255,0.3)" };
    if (url.includes('weibo.com') || url.includes('weibo.cn')) 
      return { name: "微博", icon: "👁️", color: "rgba(230,22,45,0.9)", border: "rgba(230,22,45,0.3)" };
    if (url.includes('bilibili.com') || url.includes('b23.tv')) 
      return { name: "Bilibili", icon: "📺", color: "rgba(251,114,153,0.9)", border: "rgba(251,114,153,0.3)" };
    return { name: "网页分享", icon: "🔗", color: "rgba(100,100,120,0.9)", border: "rgba(100,100,120,0.3)" };
  }

  document.addEventListener('keydown', async (e) => {
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
            showToast("✨ 极速提取图文内容中...");
            
            let data = { title: "分享链接", desc: "受防爬虫保护，请点击原链接查看内容。", imgUrl: "" };
            try { data = await fetchWebData(url); } catch (err) {}

            const theme = getPlatformStyle(url);
            
            let cleanText = text
              .replace(/把口令拷走，打开【小红书】查看详情~/g, '')
              .replace(/\[新版小红书\]/g, '')
              .replace(/3 亿人的生活经验，都在小红书/g, '')
              .replace(url, '').trim(); 
            
            const userComment = cleanText ? `<div class="xh-u">💬 "${cleanText}"</div>` : '';
            
            // ✨ 视觉魔法：如果抓到了图片，用 CSS background-image 渲染，加上全球图像代理 wsrv.nl 防屏蔽
            let imgBlock = '';
            if (data.imgUrl) {
              const safeImg = `https://wsrv.nl/?url=${encodeURIComponent(data.imgUrl)}&w=400&output=webp`;
              imgBlock = `<div style="width:100%; height:180px; background-image:url('${safeImg}'); background-size:cover; background-position:center; border-bottom:1px solid rgba(255,255,255,0.05);"></div>`;
            }

            // 内联 CSS 卡片
            const css = `<style>.xh-w{display:block!important;width:100%;max-width:320px;min-width:260px;box-sizing:border-box;margin:10px 0;font-family:system-ui,-apple-system,sans-serif}.xh-b{background:rgba(25,25,30,0.8);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid ${theme.border};border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.2)}.xh-h{display:flex;align-items:center;padding:8px 12px;background:linear-gradient(90deg,${theme.color} 0%,rgba(255,255,255,0.05) 100%);color:#fff;font-size:12px;font-weight:bold;letter-spacing:1px}.xh-c{padding:14px}.xh-t{font-size:15px;font-weight:600;color:#f0f0f0;margin-bottom:8px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.xh-d{font-size:13px;color:#aaa;line-height:1.6;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.xh-u{padding:10px 14px;background:rgba(255,255,255,0.05);border-top:1px solid rgba(255,255,255,0.1);font-size:14px;color:#e2e8f0;font-style:italic}</style>`;
            
            // 盲文结界（附带图片链接，如果 AI 有联网能力会自动去看）
            const hiddenAi = `<div style="display:none;">【备注：用户分享了${theme.name}。标题：${data.title}。摘要：${data.desc}。封面图：${data.imgUrl}。请根据这些信息进行回复】</div>`;

            // 组装最终带图 DOM
            const finalMsg = `${css}<div class="xh-w"><div class="xh-b"><div class="xh-h">${theme.icon} ${theme.name} · 分享</div>${imgBlock}<div class="xh-c"><div class="xh-t">${data.title}</div><div class="xh-d">${data.desc}</div></div>${userComment}</div>${hiddenAi}</div>`;

            el.value = finalMsg.replace(/\n/g, '').replace(/\r/g, '');
            el.dispatchEvent(new Event('input', { bubbles: true }));
            
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
    name: "🌍 全网图文引擎",
    version: "17.0.0",
    apps: [] 
  });
})();
