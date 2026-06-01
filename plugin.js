(() => {
  let isHijacking = true;
  
  // 核心解析函数升级：多重代理 + 优雅降级兜底
  async function parseXhs(url) {
    // 准备 3 个不同的免费代理服务器轮番上阵
    const proxies = [
      `https://api.codetabs.com/v1/proxy?quest=${url}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    ];

    let html = "";
    
    // 挨个尝试代理，只要有一个成功就立刻停止
    for (const proxy of proxies) {
      try {
        const res = await fetch(proxy, { timeout: 5000 });
        if (res.ok) {
          const data = await res.text();
          // allorigins 返回的是 JSON，其他返回的是纯 HTML
          html = proxy.includes('allorigins') ? JSON.parse(data).contents : data;
          
          // 如果拿到的网页里有 title 标签，说明抓取成功了
          if (html && html.includes('<title>')) {
            break; 
          }
        }
      } catch (e) {
        console.log("代理请求失败，尝试下一个...", proxy);
      }
    }

    // 【兜底方案】如果三个代理全军覆没（被小红书彻底拦截）
    if (!html || html.includes('验证码') || html.includes('403 Forbidden')) {
       return `[分享小红书] 链接：${url} （注：这篇笔记被小红书加密了，我没能抓到详细摘要。你可以直接点开看看哦，然后告诉我你的想法~）`;
    }
    
    // 提取标题
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/\s*-\s*小红书.*/i, '') : '一篇有趣的笔记';
    
    // 提取描述
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                      html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
    let desc = descMatch ? descMatch[1] : '这可能是一组好看的图集或视频~';
    
    return `[分享小红书] 标题：《${title}》。内容摘要：${desc} —— 你觉得怎么样？`;
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
        const text = el.value || '';
        // 匹配小红书链接
        if (text.length > 5 && (text.includes('xiaohongshu') || text.includes('xhslink'))) {
          const xhsRegex = /https?:\/\/(?:www\.)?xiaohongshu\.com\/[^\s]+|https?:\/\/xhslink\.com\/[^\s]+/i;
          const match = text.match(xhsRegex);

          if (match && !el.dataset.xhsParsed) {
            // 成功拦截回车
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const url = match[0];
            showToast("【小红书外挂】拦截成功！正在尝试穿透防爬虫...");
            
            el.disabled = true;
            el.value = "⏳ 正在突破小红书限制提取内容，请稍等1~5秒...";
            el.dispatchEvent(new Event('input', { bubbles: true }));

            try {
              const parsedText = await parseXhs(url);
              el.value = text.replace(url, parsedText);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dataset.xhsParsed = "true";
              showToast("【小红书外挂】转换完毕！再次按回车发送~");
            } catch (err) {
              // 极小概率发生严重错误，把原链接还给用户
              showToast("严重错误，请直接发送原链接");
              el.value = text;
              el.dispatchEvent(new Event('input', { bubbles: true }));
            } finally {
              el.disabled = false;
              el.focus();
            }
          } else if (el.dataset.xhsParsed) {
             // 允许发送，清理标记
             setTimeout(() => { el.dataset.xhsParsed = ""; }, 500);
          }
        }
      }
    }
  }, true);

  window.RochePlugin.register({
    id: "roche-xhs-parser",
    name: "📕 小红书外挂",
    version: "1.0.4",
    apps: [
      {
        id: "roche-xhs-parser-home",
        name: "外挂控制台",
        icon: "extension",
        async mount(container, roche) {
          container.innerHTML = `<div style="padding: 20px; font-family: sans-serif;">
            <h2 style="color: #ff2442;">📕 小红书外挂 v1.0.4</h2>
            <p>已加入多重防反爬虫穿透机制。</p >
            <p style="font-size:12px; color:#666;">去主聊天框粘贴链接，按回车即可自动解析。</p >
          </div>`;
        },
        async unmount(container, roche) {
          container.replaceChildren();
        }
      }
    ]
  });
})();
