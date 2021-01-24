# The astok project

[![npm](https://img.shields.io/npm/v/astok.svg)](https://www.npmjs.com/package/@astok) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

An Selective Toolset of react hoOK library

## Features

* 🎉 **Global ASync Storage Management with es6 proxy**,
* 📦 **Stale While Revalidate Restful Request Abort/Suspend...**,

## Getting started

```bash
  npm install --save @astok/store

```

  or

```bash
  yarn add @astok/store

```

```tsx
import React from 'react'
import { AstokProvider, useStore } from '@astok/store'

const counterState = {
  counter: 0,
  setCounter(count) {
    this.counter = count
  }
}
type CounterStore = typeof counterState
const useCounter = useStore<CounterStore>(todoState)

function Counter() {
  const {counter, setCounter} = useCounter()
  return (
    <div>
      <p>You clicked {counter} times</p>
      <button onClick={() => setCounter(count + 1)}>Click me</button>
    </div>
  )
}

function Display() {
  const {count} = useCounter()
  return <p>{count}</p>
}

function App() {
  return (
    <AstokProvider>
      <Counter />
      <Display />
    </AstokProvider>
  )
}
```

### run the examples

```sh
  npm run example
```

Important Safety Tip: When adding/altering packages in the playground, use `alias` object in package.json. This will tell Parcel to resolve them to the filesystem instead of trying to install the package from NPM. It also fixes duplicate React errors you may run into.


## API

### `useStore<S>(intialState: S): () => ProxyHandler<S>`

Create a react hook function which return Astok `store` given initial state and functions. The `store` hook function should be use inside of React.

```tsx
// TodoStore.js
import { useStore } from '@astok/store';
const useTodo = useStore({
  todos: [],
  getTodoCount() {
    return this.todos.length;
  },
  ...rest, // 其余自定义的数据和方法
});

const Todo = () => {
  const { getNs } = useTodo();
  const ns = getNs();
  return <div>{ns}</div>;
};
```

The `store` object has the following properties.

  🚫 `store` object key should not begin "$" which is used for internal Provider injects

#### `store`

| **Property**                                          | **Description**                                                                                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `plain object/array/number/string... state`           | simple property access from the returned use hook                                                                                               |
| `plain function`                                      | Set state by this.object or get state from this.object call                                                                                     |
| `async function or function return promise`           | `function`.loading will be added. useful for loading state change in view

```tsx
const useTodo = createStore({
  id: 0,
  async inc() {
    await sleep(1000 * 5);
    this.id++;
  },
});

const Todo = () => {
  const { inc } = useTodo();
  const handleClick = () => inc();
  return (
    <button loading={inc.loading} onClick={handleClick}>
      submit
    </button>
  );
};
```

### `<AstokProvider />`

Astok context provider. Pass your inject as `store` prop begin with "$". For example:

```tsx
import React from 'react';
import axios from 'axios';
import { AstokProvider } from '@astok/store';

function App() {
  return (
    <Provider inject={{ request: axios }}>
      <div>{/* ... stuff */}</div>
    </Provider>
  );
}

const useTodo = createStore({
  id: 0,
  async getTodo() {
    await this.$request.get(...);
  },
});
```

## 🎁 Acknowledgements

### @astok/store

- [iostore](https://github.com/yisbug/iostore): main code implementation and idea inspiration
- [icestore](https://github.com:ice-lab/icestore) / [stook](https://github.com/forsigner/stook):  examples & test & tsdx tooling

## License

MIT License
