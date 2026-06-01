(() => {
  let isHijacking = true;
  async function parseXhs(url) {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("网络请求失败");
    const data = await res.json();
    const html = data.contents || ''; 
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/\s*-\s*小红书.*/i, '') : '分享了一篇笔记';
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                      html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
    let desc = descMatch ? descMatch[1] : '没有获取到具体内容，可能是一张图片。';
    return `[分享小红书] 标题：《${title}》。内容摘要：${desc} —— 你觉得怎么样？`;
  }

  document.addEventListener('keydown', async (e) => {
    if (!isHijacking) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      const el = e.target;
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        const text = el.value || '';
        if (text.length > 10 && (text.includes('xiaohongshu') || text.includes('xhslink'))) {
          const xhsRegex = /https?:\/\/(?:www\.)?xiaohongshu\.com\/[^\s]+|https?:\/\/xhslink\.com\/[^\s]+/i;
          const match = text.match(xhsRegex);
          if (match && !el.dataset.xhsParsed) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const url = match[0];
            window.roche.ui.toast("【小红书外挂】拦截成功！正在解析...");
            el.disabled = true;
            try {
              const parsedText = await parseXhs(url);
              el.value = text.replace(url, parsedText);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dataset.xhsParsed = "true";
              window.roche.ui.toast("【小红书外挂】解析完毕！再次按回车发送");
            } catch (err) {
              window.roche.ui.toast("解析失败，可能链接失效或被反爬拦截");
            } finally {
              el.disabled = false;
              el.focus();
            }
          } else if (el.dataset.xhsParsed) {
             setTimeout(() => { el.dataset.xhsParsed = ""; }, 500);
          }
        }
      }
    }
  }, true);

  window.RochePlugin.register({
    id: "roche-xhs-parser",
    name: "📕 小红书外挂",
    version: "1.0.1",
    apps: [
      {
        id: "roche-xhs-parser-home",
        name: "外挂控制台",
        icon: "extension",
        async mount(container, roche) {
          container.innerHTML = `
            <div style="padding: 20px; font-family: sans-serif; color: var(--roche-text-primary, #333);">
              <h2 style="color: #ff2442;">📕 小红书全局外挂</h2>
              <p style="font-size: 13px; color: #666;">安全声明：本插件0存储占用，纯本地解析，不读取聊天记录。</p >
              <ul style="line-height: 1.8; margin-top: 15px;">
                <li>在官方主聊天框粘贴小红书链接。</li>
                <li>按下 <strong>回车</strong>，插件会自动将链接替换为文字摘要。</li>
                <li>再次按下回车，即可发送给角色！</li>
              </ul>
            </div>
          `;
        },
        async unmount(container, roche) {
          container.replaceChildren();
        }
      }
    ]
  });
})();
