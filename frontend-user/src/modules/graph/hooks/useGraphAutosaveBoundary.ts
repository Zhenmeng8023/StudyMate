export function shouldAutosaveGraph(dirty: boolean, saving: boolean) {
  return dirty && !saving;
}
