const apiDescriptor = Object.getOwnPropertyDescriptor(window, 'reviewAPI')
const stageDescriptor = Object.getOwnPropertyDescriptor(window.reviewAPI, 'stageD4Intake')
return {
  apiType: typeof window.reviewAPI,
  apiProperty: apiDescriptor ? { configurable: apiDescriptor.configurable, writable: apiDescriptor.writable } : null,
  frozen: Object.isFrozen(window.reviewAPI),
  stageProperty: stageDescriptor ? { configurable: stageDescriptor.configurable, writable: stageDescriptor.writable, getter: typeof stageDescriptor.get } : null,
}
