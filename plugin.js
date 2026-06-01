(() => {
  let isHijacking = true;

  // 强行超时打断器，防止卡死
  async function fetchWithTimeout(resource, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  // 任务 A：抓取快照 (独立运行，不干扰文本)
  async function getSnapshot(url) {
    const microUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=true`;
    const res = await fetchWithTimeout(microUrl, 6000);
    const json = await res.json();
    if (json.status === 'success') {
      return {
        title: json.data.title || '',
        desc: json.data.description || '',
        imgUrl: json.data.screenshot?.url || json.data.image?.url || ''
      };
    }
    throw new Error("快照失败");
  }

  // 任务 B：抓取纯文本 (3个代理同时竞速，谁先成功用谁！)
  async function getTextFast(url) {
    return new Promise((resolve, reject) => {
      const proxies = [
        `https://api.codetabs.com/v1/proxy?quest=${url}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      ];
      
      let failCount = 0;
      proxies.forEach(async (proxy) => {
        try {
          const res = await fetchWithTimeout(proxy, 4000);
          if (res.ok) {
            const data = await res.text();
            const html = proxy.includes('allorigins') ? JSON.parse(data).contents : data;
            if (html && !html.includes('验证码') && html.includes('<title>')) {
              // 成功拿到了！立刻解析并返回！
              const titleMatch = html.match(/<title>(.*?)<\/title>/i);
              const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) || 
                                html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
              resolve({
                title: titleMatch ? titleMatch[1].replace(/\s*-\s*小红书.*/i, '') : '',
                desc: descMatch ? descMatch[1] : ''
              });
              return;
            }
          }
        } catch (e) {}
        // 如果失败了，失败计数+1
        failCount++;
        if (failCount === proxies.length) reject(new Error("所有文本代理全部失败"));
      });
    });
  }

  // 并行调度中心
  async function parseXhsParallel(url, showToast) {
    showToast("⚡ 正在并行抓取快照与文本...");

    // 【核心】Promise.allSettled 让快照和文本同时跑，互不影响！
    const [snapResult, textResult] = await Promise.allSettled([
      getSnapshot(url),
      getTextFast(url)
    ]);

    // 默认兜底数据
    let finalTitle = '分享了一篇笔记';
    let finalDesc = '该笔记有隐私限制，建议直接打开小红书 App 查看。';
    let finalImg = '';

    // 优先采用文本轨道的数据（因为代理拿到的源网页文本最纯净）
    if (textResult.status === 'fulfilled' && textResult.value.title) {
      finalTitle = textResult.value.title;
      finalDesc = textResult.value.desc || finalDesc;
    } 
    // 如果文本全挂了，尝试用快照里附带的标题
    else if (snapResult.status === 'fulfilled' && snapResult.value.title) {
      finalTitle = snapResult.value.title.replace(/\s*-\s*小红书.*/i, '');
      finalDesc = snapResult.value.desc || finalDesc;
    }

    // 提取图片（只有快照轨道能产出图片）
    if (snapResult.status === 'fulfilled') {
      finalImg = snapResult.value.imgUrl;
    }

    return { title: finalTitle, desc: finalDesc, imgUrl: finalImg };
  }

  function showToast(msg) {
    if (window.Roche && window.Roche.ui) window.Roche.ui.toast(msg);
    else if (window.roche && window.roche.ui) window.roche.ui.toast(msg);
  }

  function simulateEnter(el) {
    el.dataset.autoSend = "true";
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true
    });
    el.dispatchEvent(enterEvent);
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
              // 执行并行抓取
              const data = await parseXhsParallel(url, showToast);
              
              // 清洗原文本里的垃圾口令
              let cleanText = text
                .replace(/把口令拷走，打开【小红书】查看详情~/g, '')
                .replace(/\[新版小红书\]/g, '')
                .replace(/3 亿人的生活经验，都在小红书/g, '')
                .replace(url, '').trim(); 
              
              // ==========================================
              // 第一发：喂给大模型看（触发视觉识别）
              // ==========================================
              let msg1 = cleanText;
              if (data.imgUrl) {
                msg1 += `\n\n[网页快照]:\n![image](${data.imgUrl})`;
              } else {
                msg1 += `\n\n[笔记信息]:\n标题: ${data.title}\n摘要: ${data.desc}`;
              }
              
              el.value = msg1;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.disabled = false;
              el.focus();
              simulateEnter(el); 

              // ==========================================
              // 第二发：喂给肉眼看（极纯净 HTML 卡片）
              // ==========================================
              setTimeout(() => {
                const bgStyle = data.imgUrl ? `background-image:url(${data.imgUrl});background-size:cover;background-position:center;height:160px;` : `display:none;`;
                
                // 彻底无换行的 HTML 结界代码
                const msg2 = `<style>.xh-w{display:block!important;width:100%;max-width:320px;min-width:260px;box-sizing:border-box;margin:8px 0;font-family:system-ui,-apple-system,sans-serif}.xh-b{background:rgba(30,30,35,0.6);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid rgba(255,36,66,0.25);border-radius:12px;overflow:hidden}.xh-h{display:flex;align-items:center;padding:8px 12px;background:linear-gradient(90deg,rgba(255,36,66,0.85) 0%,rgba(255,36,66,0.1) 100%);color:#fff;font-size:12px;font-weight:bold;letter-spacing:1px}.xh-i{width:100%;position:relative;${bgStyle}}.xh-c{padding:12px}.xh-t{font-size:14px;font-weight:600;color:#f0f0f0;margin-bottom:6px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.xh-d{font-size:12px;color:#999;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}</style><div class="xh-w"><div class="xh-b"><div class="xh-h">📕 小红书 · 笔记分享</div><div class="xh-i"></div><div class="xh-c"><div class="xh-t">${data.title}</div><div class="xh-d">${data.desc}</div></div></div></div>`;
                
                el.value = msg2;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                simulateEnter(el); 
                
                showToast("✨ 发送完毕！AI 开始看图啦！");
              }, 600); // 间隔0.6秒连发

            } catch (err) {
              showToast("严重错误，请检查网络");
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
    name: "📸 并行双发外挂",
    version: "8.0.0",
    apps: [
      {
        id: "roche-xhs-parser-home",
        name: "控制台",
        icon: "extension",
        async mount(container, roche) {
          container.innerHTML = `<div style="padding: 20px;">
            <h2 style="color: #ff2442;">🚀 并行加速极光版 v8.0</h2>
            <p>1. 四线程并行抓取 (快照 + 3代理竞速)<br>2. 影分身双发确保渲染成功</p>
          </div>`;
        },
        async unmount(container, roche) {
          container.replaceChildren();
        }
      }
    ]
  });
})();
