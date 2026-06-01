(() => {
  let isHijacking = true;
  
  // 核心：调用云端无头浏览器进行截图
  async function captureWebSnapshot(url) {
    // 调用 Microlink API：要求抓取 meta 标签，并且强制要求生成 screenshot
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=true`;
    
    // 截图比较慢，给 15 秒的耐心等待时间
    const res = await fetch(apiUrl, { timeout: 15000 });
    if (!res.ok) throw new Error("云端服务器请求失败");

    const json = await res.json();
    if (json.status !== 'success') throw new Error("云端抓取失败");

    const title = json.data.title || '分享网页';
    const desc = json.data.description || '无摘要内容';
    const screenshotUrl = json.data.screenshot?.url;

    if (!screenshotUrl) {
      throw new Error("云端未能生成图片");
    }

    // 将结果组装成带图片的 Markdown 格式
    return `[我分享了一个网页] 标题：《${title}》\n\n![网页快照](${screenshotUrl})\n\n摘要补充：${desc}\n—— 你觉得这个怎么样？`;
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
        
        // 这次我们放宽条件：只要是包含 http 或 https 的链接，全拦截！
        const urlRegex = /https?:\/\/[^\s]+/i;
        const match = text.match(urlRegex);

        if (match && !el.dataset.xhsParsed) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          const url = match[0];
          showToast("【快照外挂】已拦截链接，正在呼叫云端浏览器拍照...");
          
          el.disabled = true;
          // 提示用户耐心等待
          el.value = "📸 正在云端渲染网页并截图，大约需要 5~10 秒，请稍等...";
          el.dispatchEvent(new Event('input', { bubbles: true }));

          try {
            const parsedText = await captureWebSnapshot(url);
            el.value = text.replace(url, parsedText);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dataset.xhsParsed = "true";
            showToast("【快照外挂】咔嚓！拍照完毕，再次按回车发送图文！");
          } catch (err) {
            showToast("云端快照生成失败，可能是对方网站拒绝访问");
            el.value = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          } finally {
            el.disabled = false;
            el.focus();
          }
        } else if (el.dataset.xhsParsed) {
           setTimeout(() => { el.dataset.xhsParsed = ""; }, 500);
        }
      }
    }
  }, true);

  window.RochePlugin.register({
    id: "roche-snapshot-parser",
    name: "📸 网页快照外挂",
    version: "2.0.0",
    apps: [
      {
        id: "roche-snapshot-home",
        name: "快照控制台",
        icon: "extension",
        async mount(container, roche) {
          container.innerHTML = `<div style="padding: 20px; font-family: sans-serif;">
            <h2 style="color: #007bff;">📸 网页快照外挂 v2.0</h2>
            <p>本次升级支持<b>所有网页链接</b>。</p >
            <p style="font-size:13px; color:#666;">去聊天框粘贴任意网址，按回车，插件会自动召唤云端浏览器拍下网页截图并发给角色！</p >
          </div>`;
        },
        async unmount(container, roche) {
          container.replaceChildren();
        }
      }
    ]
  });
})();
