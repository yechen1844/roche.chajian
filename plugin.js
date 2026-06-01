(() => {
  let isHijacking = true;

  async function fetchSmartData(url) {
    // 文本榨取函数：提取正文，严格控制 Token 消耗（最高 500 字）
    function extractFromHtml(html) {
      const tMatch = html.match(/<title>(.*?)<\/title>/i);
      let t = tMatch ? tMatch[1].replace(/\s*-\s*小红书.*/i, '').replace(/_哔哩哔哩_bilibili.*/i, '').replace(/ - 知乎/i, '').trim() : '';
      
      const dMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                     html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i);
      let d = dMatch ? dMatch[1].trim() : '';

      const pMatches = html.match(/<p[^>]*>(.*?)<\/p>/gi);
      if (pMatches) {
        const pText = pMatches.map(p => p.replace(/<[^>]+>/g, '').trim()).filter(p => p.length > 5).join('\n');
        if (pText.length > d.length) d = pText; 
      }
      
      // ✨ 严格 500 字 Token 保护锁
      if (d.length > 500) {
        d = d.substring(0, 500) + "...";
      }
      
      return { title: t, desc: d };
    }

    // 轨道 A：云端解析
    if (url.includes('zhihu.com') || url.includes('bilibili.com') || url.includes('b23.tv') || url.includes('weibo.com')) {
      try {
        const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data.title && !json.data.title.includes('安全中心') && !json.data.title.includes('验证码')) {
            let title = json.data.title.replace(/ - 知乎/i, '').replace(/_哔哩哔哩_bilibili.*/i, '').trim();
            let desc = json.data.description || '';
            // ✨ 云端获取的数据也严格截断 500 字
            if (desc.length > 500) desc = desc.substring(0, 500) + "...";
            if (title) return { title, desc };
          }
        }
      } catch (e) {}
    }

    // 轨道 B：底层代理集群
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
            const ext = extractFromHtml(html);
            if (ext.title) return ext;
          }
        }
      } catch (e) {}
    }
    throw new Error("抓取失败");
  }

  function showToast(msg) {
    const api = window.Roche || window.roche;
    if (api && api.ui) api.ui.toast(msg);
  }

  function getPlatformName(url) {
    if (url.includes('xiaohongshu') || url.includes('xhslink')) return "小红书";
    if (url.includes('zhihu.com') || url.includes('zhibo')) return "知乎";
    if (url.includes('weibo.com') || url.includes('weibo.cn')) return "微博";
    if (url.includes('bilibili.com') || url.includes('b23.tv')) return "Bilibili";
    return "网页";
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
            showToast("✨ 纯净数据抓取中 (限额500字)...");
            let data = { title: "", desc: "" };
            const platform = getPlatformName(url);

            try { 
              data = await fetchSmartData(url); 
            } catch (err) {
              console.warn("网络受阻，降级提取");
            }

            let rawText = text
              .replace(url, '')
              .replace(/把口令拷走，打开【小红书】查看详情~/g, '')
              .replace(/\[新版小红书\]/g, '')
              .replace(/3 亿人的生活经验，都在小红书/g, '')
              .trim(); 
            
            if (!data.title) {
              data.title = rawText || `分享了一个${platform}链接`;
              data.desc = "未能读取网页正文。";
              rawText = ""; 
            }

            const xmlOutput = `<web_share>
<platform>${platform}</platform>
<title>${data.title}</title>
<content>${data.desc}</content>
<comment>${rawText}</comment>
</web_share>`;

            el.value = xmlOutput;
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
    name: "🌍 纯数据节流引擎",
    version: "25.0.0",
    apps: [] 
  });
})();
