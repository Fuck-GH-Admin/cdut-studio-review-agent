const descriptor = Object.getOwnPropertyDescriptor(window.reviewAPI, 'stageD4Intake')
if (!descriptor || descriptor.writable === false) throw new Error('stageD4Intake is not replaceable for observation')
if (!window.__p1cStageObserverInstalled) {
  const original = window.reviewAPI.stageD4Intake.bind(window.reviewAPI)
  window.reviewAPI.stageD4Intake = async (...args) => {
    const result = await original(...args)
    window.__p1cStageResponse = result
    return result
  }
  window.__p1cStageObserverInstalled = true
}
return {observerInstalled: window.__p1cStageObserverInstalled, writable: descriptor.writable}
