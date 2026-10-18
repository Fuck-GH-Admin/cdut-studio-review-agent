const button = Array.from(document.querySelectorAll('button')).find((element) => element.textContent.trim().startsWith('创建'))
if (!button) throw new Error('create button missing')
const rect = button.getBoundingClientRect()
window.__d4SubmitEvents = []
const record = (event, type) => {
  const target = event.target
  const targetButton = target?.closest?.('button')
  const inButtonBox = Number.isFinite(event.clientX) && event.clientX >= rect.left - 8 && event.clientX <= rect.right + 8 && event.clientY >= rect.top - 8 && event.clientY <= rect.bottom + 8
  if (type === 'submit' || (type === 'keydown' && event.key === 'Enter') || targetButton === button || inButtonBox) {
    window.__d4SubmitEvents.push({type, trusted:event.isTrusted, detail:event.detail, key:event.key, targetTag:target?.tagName, targetText:(target?.innerText||target?.textContent||'').trim().slice(0,80), targetButtonText:(targetButton?.innerText||targetButton?.textContent||'').trim(), targetButtonDisabled:targetButton?.disabled, x:event.clientX, y:event.clientY, at:performance.now()})
  }
}
for (const type of ['pointerdown','pointerup','mousedown','mouseup','click']) window.addEventListener(type, event => record(event,type), true)
window.addEventListener('keydown', event => record(event,'keydown'), true)
window.addEventListener('submit', event => record(event,'submit'), true)
return {installed:true,buttonDisabled:button.disabled,buttonRect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},active:{tag:document.activeElement?.tagName,type:document.activeElement?.type,placeholder:document.activeElement?.getAttribute('placeholder'),text:(document.activeElement?.innerText||document.activeElement?.textContent||'').trim()}}
