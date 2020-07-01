# Astok

[![npm](https://img.shields.io/npm/v/astok.svg)](https://www.npmjs.com/package/@astok/astore) [![Minzipped size](https://img.shields.io/bundlephobia/minzip/astok.svg)](https://bundlephobia.com/result?p=astok) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

An async global store management hook library for React.

## Features

* 🎉 **Extensible**,
* 📦 **Out of the Box**,

## Getting started

```tsx
import React from 'react'
import { AstokProvider, createStore,useStore } from '@astok/store'

createStore({
  name: 'Counter',
  state:{ counter: 0},
  fetchable: true,
  effects: (getState, setState, { get }) => ({
  })
})

function Counter() {
  const [count, setCount] = useStore('Counter')
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}

function Display() {
  const [count] = useStore('Counter')
  return <p>{count}</p>
}

function App() {
  return (
    <AstokProvider restful={{}} defautStates={}>
      <Counter />
      <Display />
    </AstokProvider>
  )
}
```

## Documents
 intro
 api
 examples

## 🎁 Acknowledgements
  stook
  use-http
  react-hookstore
  icestore

## License

[MIT License](https://github.com/kayw/astok/blob/master/LICENSE)



