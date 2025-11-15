class State {
  constructor(initState) {
    this.state = initState;
  }
  set(newState, render) {
    this.state = newState;
    render?.();
  }
  get() {
    return this.state;
  }
}

export default State;
