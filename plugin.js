(() => {
  let isHijacking = true;

  // 黑魔法 1：真正的强行超时打断器，彻底解决“卡死”问题
  async function fetchWithTimeout(resource, timeout = 6000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error; // 时间一到，直接斩断，抛出异常
    }
  }
  
  // 核心解析：双轨切换机制
  async function parseXhs(url, showToast) {
    let title = '分享了一篇笔记';
    let desc = '正在获取内容...';
    let imgUrl = '';
    let usedSnapshot = false;

    // 轨道 A：尝试云端快照 (严苛限时 6 秒)
    try {
      showToast("⏳ [1/2] 尝试获取高清快照 (限时6秒)...");
      const microUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=true`;
      const res = await fetchWithTimeout(microUrl, 6000);
      
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          title = json.data.title || title;
          desc = json.data.description || desc;
          // 抓取截图，没有截图抓原帖封面
          imgUrl = json.data.screenshot?.url || json.data.image?.url || '';
          if (imgUrl) usedSnapshot = true;
        }
      }
    } catch (e) {
      console.log("快照防线太厚，已被斩断");
    }

    // 轨道 B：降级方案 - 极速文本提取 (单节点限时 3 秒)
    if (!usedSnapshot) {
      showToast("⚠️ 快照受阻，已无缝降级为极速文本提取...");
      const proxies = [
        `https://api.codetabs.com/v1/proxy?quest=${url}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      ];
      
      let html = "";
      for (const proxy of proxies) {
        try {
          const res = await fetchWithTimeout(proxy, 3000);
          if (res.ok) {
            const data = await res.text();
            html = proxy.includes('allorigins') ? JSON.parse(data).contents : data;
            if (html && html.includes('<title>')) break; 
          }
        } catch (e) {} // 失败直接跳下一个代理，绝不卡顿
      }

      if (html && !html.includes('验证码') && !html.includes('403 Forbidden')) {
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        if(titleMatch) title = titleMatch[1];
        
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                          html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
        if(descMatch) desc = descMatch[1];
      } else {
        desc = "由于权限设置，这篇笔记只能在小红书 App 中查看。";
      }
    }

    // 净化标题中的小红书后缀
    title = title.replace(/\s*-\s*小红书.*/i, '');

    // 黑魔法 2：严格遵循白皮书，采用 .xh- 命名空间与内发光深色极光拟态
    const css = `<style>.xh-wrap{display:block!important;width:100%!important;max-width:320px;min-width:260px;box-sizing:border-box;margin:10px 0;font-family:system-ui,-apple-system,sans-serif}.xh-box{position:relative;width:100%;background:rgba(30,30,35,0.7);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid rgba(255,36,66,0.3);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.3),inset 0 0 0 1px rgba(255,255,255,0.05);overflow:hidden}.xh-hd{display:flex;align-items:center;padding:8px 12px;background:linear-gradient(90deg,rgba(255,36,66,0.85) 0%,rgba(255,36,66,0.1) 100%);color:#fff;font-size:12px;font-weight:bold;letter-spacing:1px}.xh-img-box{width:100%;max-height:220px;overflow:hidden;background:#000;position:relative}.xh-img{width:100%;height:100%;object-fit:cover;display:block}.xh-bd{padding:12px 14px}.xh-tit{font-size:14px;font-weight:600;color:#f0f0f0;margin-bottom:6px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.xh-desc{font-size:12px;color:#aaa;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}</style>`;
    
    // 防盗链 referrerpolicy 属性，确保图片渲染
    const imgHtml = imgUrl ? `<div class="xh-img-box">< img src="${imgUrl}" class="xh-img" referrerpolicy="no-referrer"></div>` : ``;
    
    // 极限单行拼接
    const card = `${css}<div class="xh-wrap"><div class="xh-box"><div class="xh-hd">📕 小红书 · 笔记分享</div>${imgHtml}<div class="xh-bd"><div class="xh-tit">${title}</div><div class="xh-desc">${desc}</div></div></div></div>`;
    
    return card.replace(/\n/g, '').replace(/\r/g, '');
  }

  function showToast(msg) {
    if (window.Roche && window.Roche.ui) window.Roche.ui.toast(msg);
    else if (window.roche && window.roche.ui) window.roche.ui.toast(msg);
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
        
        if (text.length > 5 && (text.includes('xiaohongshu') || text.includes('xhslink'))) {
          const xhsRegex = /https?:\/\/(?:www\.)?xiaohongshu\.com\/[^\s]+|https?:\/\/xhslink\.com\/[^\s]+/i;
          const match = text.match(xhsRegex);

          if (match) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const url = match[0];
            el.disabled = true;

            try {
              // 开启双轨捕获
              const parsedHtml = await parseXhs(url, showToast);
              
              // 黑魔法 3：Markdown 渲染结界
              // 自动清洗垃圾口令，留下核心对话
              let cleanText = text
                .replace(/把口令拷走，打开【小红书】查看详情~/g, '')
                .replace(/\[新版小红书\]/g, '')
                .replace(/3 亿人的生活经验，都在小红书/g, '')
                .replace(url, ''); 
              
              let finalInput = cleanText.trim();
              
              // 【核心修复】：在输入文本和 HTML 代码之间强制加上 \n\n，激活 Markdown 块级引擎！
              el.value = finalInput ? (finalInput + "\n\n" + parsedHtml) : parsedHtml;
              
              el.dispatchEvent(new Event('input', { bubbles: true }));
              
              setTimeout(() => {
                el.dataset.autoSend = "true";
                el.disabled = false;
                el.focus(); 
                const enterEvent = new KeyboardEvent('keydown', {
                  key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true
                });
                el.dispatchEvent(enterEvent);
                showToast("✨ 发送完毕！");
              }, 150);

            } catch (err) {
              showToast("解析发生严重错误，请检查网络");
              el.disabled = false;
              el.focus();
            }
          }
        }
      }
    }
  }, true);

  window.RochePlugin.register({
    id: "roche-xhs-parser",
    name: "📸 小红书完美渲染版",
    version: "6.0.0",
    apps: [
      {
        id: "roche-xhs-parser-home",
        name: "控制台",
        icon: "extension",
        async mount(container, roche) {
          container.innerHTML = `<div style="padding: 20px;">
            <h2 style="color: #ff2442;">📸 双轨防冻结版 v6.0</h2>
            <p>已应用 Markdown 换行结界与 6 秒强制中断防卡死机制。</p >
          </div>`;
        },
        async unmount(container, roche) {
          container.replaceChildren();
        }
      }
    ]
  });
})();
