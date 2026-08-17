const hot = import.meta.hot;
const hooks = hot?.data?.hooks ?? [];

let hookIndex = 0;
let render = () => {};

if (hot) {
  hot.dispose((data) => {
    data.hooks = hooks;
  });
}

export function setRender(fn) {
  render = fn;
}

export function resetHooks() {
  hookIndex = 0;
}

export function useState(initialValue) {
  const index = hookIndex;

  if (hooks[index] === undefined) {
    hooks[index] =
      typeof initialValue === "function" ? initialValue() : initialValue;
  }

  const setState = (newValue) => {
    const nextValue =
      typeof newValue === "function" ? newValue(hooks[index]) : newValue;

    if (Object.is(hooks[index], nextValue)) return;

    hooks[index] = nextValue;
    render();
  };

  const value = hooks[index];
  hookIndex++;

  return [value, setState];
}
