(() => {
  let isHijacking = true;

  const defaultConfig = {
    enabled: false,
    endpoint: "https://api.openai.com/v1",
    apiKey: "",
    model: ""
  };

  async function fetchWithTimeout(resource, timeout = 6000) {
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

  async function getSnapshotData(url) {
    const microUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=true`;
    try {
      const res = await fetchWithTimeout(microUrl, 8000);
      const json = await res.json();
      if (json.status === 'success') {
        return {
          title: (json.data.title || '分享了一个网页').replace(/\s*-\s*小红书.*/i, ''),
          desc: json.data.description || '摘要提取中...',
          imgUrl: json.data.screenshot?.url || json.data.image?.url || ''
        };
      }
    } catch (e) {}
    return { title: '网页链接', desc: '由于网站防爬虫限制，无法获取预览。', imgUrl: '' };
  }

  // 兼容获取全局 API
  function getApi() {
    return window.Roche || window.roche;
  }

  function showToast(msg) {
    const api = getApi();
    if (api && api.ui) api.ui.toast(msg);
  }

  function getPlatformStyle(url) {
    if (url.includes('xiaohongshu') || url.includes('xhslink')) 
      return { name: "小红书", icon: "📕", color: "rgba(255,36,66,0.85)", borderColor: "rgba(255,36,66,0.3)" };
    if (url.includes('zhihu.com') || url.includes('zhibo')) 
      return { name: "知乎", icon: "📘", color: "rgba(0,102,255,0.85)", borderColor: "rgba(0,102,255,0.3)" };
    if (url.includes('weibo.com') || url.includes('weibo.cn')) 
      return { name: "微博", icon: "👁️", color: "rgba(230,22,45,0.85)", borderColor: "rgba(230,22,45,0.3)" };
    if (url.includes('bilibili.com') || url.includes('b23.tv')) 
      return { name: "Bilibili", icon: "📺", color: "rgba(251,114,153,0.85)", borderColor: "rgba(251,114,153,0.3)" };
    return { name: "网页分享", icon: "🔗", color: "rgba(100,100,120,0.85)", borderColor: "rgba(100,100,120,0.3)" };
  }

  document.addEventListener('keydown', async (e) => {
    if (!isHijacking) return;
    
    if (e.key === 'Enter' && !e.shiftKey) {
      const el = e.target;
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        
        const text = el.value || '';
        
        // ✨ 新增魔法指令：在聊天框打 /设置 回车，直接弹脸！
        if (text.trim() === '/设置' || text.trim() === '/外挂') {
          e.preventDefault();
          el.value = ''; 
          el.dispatchEvent(new Event('input', { bubbles: true }));
          
          const api = getApi();
          if (api && api.ui) {
            api.ui.openApp("universal-parser-home");
          }
          return;
        }

        if (el.dataset.autoSend === "true") {
          setTimeout(() => { el.dataset.autoSend = ""; }, 100);
          return; 
        }

        const urlRegex = /https?:\/\/[^\s]+/i;
        const match = text.match(urlRegex);

        if (match) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          const url = match[0];
          el.disabled = true;

          try {
            const api = getApi();
            // 只有在具备 storage 权限时才会成功
            const savedConfig = (api && api.storage) ? await api.storage.get("xhs_vision_config") : {};
            const config = { ...defaultConfig, ...savedConfig };
            
            showToast("🌍 正在云端渲染网页快照...");
            const data = await getSnapshotData(url);
            
            let aiVisionText = "";
            let safeImgHtml = "";
            let hiddenAiContext = "";

            if (config.enabled && data.imgUrl && api && api.ai) {
              showToast("🧠 正在呼叫私有副 API 识别画面...");
              safeImgHtml = `<img src="https://wsrv.nl/?url=${encodeURIComponent(data.imgUrl)}&w=500&output=webp" class="xh-i" referrerpolicy="no-referrer">`;
              
              try {
                const aiRes = await api.ai.chat({
                  endpoint: config.endpoint,
                  apiKey: config.apiKey,
                  model: config.model,
                  messages: [{
                    role: "user",
                    content: [
                      { type: "text", text: "这是一张网页截图，请详细描述图片内容和可见文字。直接描述。" },
                      { type: "image_url", image_url: { url: data.imgUrl } }
                    ]
                  }]
                });
                if (aiRes && aiRes.text) aiVisionText = aiRes.text;
              } catch (err) {
                aiVisionText = "自定义视觉 API 调用失败，请检查配置。";
              }
              hiddenAiContext = `<div style="display:none;">【系统备注：用户发了一张网页截图。副API解析的画面内容：${aiVisionText}。请根据此内容对话】</div>`;
            } else {
              hiddenAiContext = `<div style="display:none;">【系统备注：用户发了一个网页。摘要内容：${data.desc}。请根据此内容对话】</div>`;
            }

            const theme = getPlatformStyle(url);
            let cleanText = text.replace(/把口令拷走，打开【小红书】查看详情~/g, '').replace(/\[新版小红书\]/g, '').replace(/3 亿人的生活经验，都在小红书/g, '').replace(url, '').trim(); 
            const userCommentHtml = cleanText ? `<div class="xh-u">💬 "${cleanText}"</div>` : '';
            
            const css = `<style>.xh-w{display:block!important;width:100%;max-width:320px;min-width:260px;box-sizing:border-box;margin:8px 0;font-family:system-ui,-apple-system,sans-serif}.xh-b{background:rgba(30,30,35,0.7);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid ${theme.borderColor};border-radius:12px;overflow:hidden}.xh-h{display:flex;align-items:center;padding:8px 12px;background:linear-gradient(90deg,${theme.color} 0%,rgba(255,255,255,0.05) 100%);color:#fff;font-size:12px;font-weight:bold;letter-spacing:1px}.xh-i{width:100%;height:180px;object-fit:cover;display:block;background:#1a1a1a}.xh-c{padding:14px}.xh-t{font-size:15px;font-weight:600;color:#f0f0f0;margin-bottom:8px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.xh-d{font-size:13px;color:#aaa;line-height:1.6;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.xh-u{padding:10px 14px;background:rgba(255,255,255,0.05);border-top:1px solid rgba(255,255,255,0.1);font-size:14px;color:#e2e8f0;font-style:italic}</style>`;
            
            const finalMsg = `${css}<div class="xh-w"><div class="xh-b"><div class="xh-h">${theme.icon} ${theme.name} · 网页分享</div>${safeImgHtml}<div class="xh-c"><div class="xh-t">${data.title}</div><div class="xh-d">${data.desc}</div></div>${userCommentHtml}</div>${hiddenAiContext}</div>`;

            el.value = finalMsg.replace(/\n/g, '').replace(/\r/g, '');
            el.dispatchEvent(new Event('input', { bubbles: true }));
            
            setTimeout(() => {
              el.dataset.autoSend = "true";
              el.disabled = false;
              el.focus(); 
              const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
              el.dispatchEvent(enterEvent);
              showToast("✨ 发送成功！");
            }, 150);

          } catch (err) {
            showToast("发生错误，请重试");
            el.disabled = false;
            el.focus();
          }
        }
      }
    }
  }, true);

  // 【核心】：这里就是注册到系统主屏幕上的 App
  window.RochePlugin.register({
    id: "roche-universal-parser", // 必须和 manifest.json 的 id 一模一样！
    name: "🌍 全网视觉中枢",
    version: "13.0.0",
    apps: [
      {
        id: "universal-parser-home",
        name: "副 API 设置", // 这就是将会出现在桌面上/插件管理里的图标名字！
        icon: "settings",
        async mount(container, roche) {
          let config = { ...defaultConfig, ...(await roche.storage.get("xhs_vision_config")) };

          container.innerHTML = `
            <div style="padding: 20px; font-family: system-ui; color: var(--roche-text-primary, #333);">
              <h2 style="color: #007bff; margin-bottom: 10px;">🌍 视觉代理中枢设置</h2>
              <p style="font-size:13px; color:#666; margin-bottom: 20px;">此面板已挂载到主屏幕。如果在聊天框输入 <b>/设置</b>，也可以快速呼出此面板！</p>
              
              <div style="background: rgba(120,120,120,0.1); padding: 15px; border-radius: 8px;">
                <label style="display: flex; align-items: center; font-weight: bold; cursor: pointer; margin-bottom: 15px;">
                  <input type="checkbox" id="cfg-enable" ${config.enabled ? 'checked' : ''} style="margin-right: 10px; transform: scale(1.2);">
                  启用独立视觉副 API
                </label>
                
                <div id="api-settings" style="display: ${config.enabled ? 'block' : 'none'};">
                  <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; margin-bottom: 4px;">Endpoint (兼容 OpenAI 格式)</div>
                    <input type="text" id="cfg-ep" value="${config.endpoint}" placeholder="https://api.openai.com/v1" style="width: 100%; padding: 8px; border: 1px solid rgba(100,100,100,0.3); border-radius: 4px; box-sizing: border-box; background: transparent; color: inherit;">
                  </div>
                  
                  <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; margin-bottom: 4px;">API Key</div>
                    <input type="password" id="cfg-key" value="${config.apiKey}" placeholder="sk-..." style="width: 100%; padding: 8px; border: 1px solid rgba(100,100,100,0.3); border-radius: 4px; box-sizing: border-box; background: transparent; color: inherit;">
                  </div>
                  
                  <div style="margin-bottom: 12px; display: flex; gap: 10px;">
                    <div style="flex: 1;">
                      <div style="font-size: 12px; margin-bottom: 4px;">选择视觉模型</div>
                      <select id="cfg-model" style="width: 100%; padding: 8px; border: 1px solid rgba(100,100,100,0.3); border-radius: 4px; background: transparent; color: inherit;">
                        <option value="${config.model}">${config.model || '点击右侧获取模型'}</option>
                      </select>
                    </div>
                    <button id="btn-fetch" style="margin-top: 18px; padding: 0 15px; background: #007bff; color: #fff; border: none; border-radius: 4px; cursor: pointer;">获取模型</button>
                  </div>
                </div>
                
                <button id="btn-save" style="width: 100%; padding: 10px; margin-top: 10px; background: #28a745; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
                  💾 保存配置
                </button>
              </div>
            </div>
          `;

          const checkEnable = container.querySelector('#cfg-enable');
          const settingsDiv = container.querySelector('#api-settings');
          const epInput = container.querySelector('#cfg-ep');
          const keyInput = container.querySelector('#cfg-key');
          const modelSelect = container.querySelector('#cfg-model');
          const fetchBtn = container.querySelector('#btn-fetch');
          const saveBtn = container.querySelector('#btn-save');

          checkEnable.addEventListener('change', (e) => {
            settingsDiv.style.display = e.target.checked ? 'block' : 'none';
          });

          fetchBtn.addEventListener('click', async () => {
            let ep = epInput.value.trim().replace(/\/v1\/?$/, '').replace(/\/$/, '');
            let key = keyInput.value.trim();
            if(!ep || !key) return roche.ui.toast("请先填写 Endpoint 和 API Key");
            
            fetchBtn.innerText = "获取中...";
            try {
              const res = await fetch(`${ep}/v1/models`, { headers: { 'Authorization': `Bearer ${key}` } });
              const data = await res.json();
              if(data.data) {
                // 生成模型列表，过滤一下看起来可能包含视觉的模型（或者不过滤全展示）
                modelSelect.innerHTML = data.data.map(m => `<option value="${m.id}" ${m.id === config.model ? 'selected' : ''}>${m.id}</option>`).join('');
                roche.ui.toast("获取模型成功！");
              } else { throw new Error("格式错误"); }
            } catch (err) {
              roche.ui.toast("获取失败，请检查连通性");
            }
            fetchBtn.innerText = "获取模型";
          });

          saveBtn.addEventListener('click', async () => {
            config = {
              enabled: checkEnable.checked,
              endpoint: epInput.value.trim(),
              apiKey: keyInput.value.trim(),
              model: modelSelect.value || epInput.value.trim()
            };
            await roche.storage.set("xhs_vision_config", config);
            roche.ui.toast("设置已保存！可以去发链接试试了。");
          });
        },
        async unmount(container, roche) {
          container.replaceChildren();
        }
      }
    ]
  });
})();
