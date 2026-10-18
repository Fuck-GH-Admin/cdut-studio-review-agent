const createButton = Array.from(document.querySelectorAll('button')).find((element) => element.textContent.trim() === '创建项目')
if (!createButton) throw new Error('create button missing')
window.__d4SubmitEvents = []
window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') window.__d4SubmitEvents.push({type:'keydown', key:event.key, trusted:event.isTrusted, target:event.target?.tagName, targetText:(event.target?.innerText||event.target?.textContent||'').trim(), activeText:(document.activeElement?.innerText||document.activeElement?.textContent||'').trim(), at:performance.now()})
}, true)
window.addEventListener('click', (event) => {
  const button = event.target?.closest?.('button')
  if (button?.textContent.trim() === '创建项目') window.__d4SubmitEvents.push({type:'click', detail:event.detail, trusted:event.isTrusted, target:button.textContent.trim(), at:performance.now()})
}, true)
window.addEventListener('submit', (event) => {
  const button = document.activeElement
  window.__d4SubmitEvents.push({type:'submit', trusted:event.isTrusted, activeText:(button?.innerText||button?.textContent||'').trim(), at:performance.now()})
}, true)
return {installed:true, title:document.querySelector('input[placeholder="如：2026 年秋季学期综合素质测评"]')?.value, activeText:(document.activeElement?.innerText||document.activeElement?.textContent||'').trim(), activeType:document.activeElement?.type, createDisabled:createButton.disabled}
