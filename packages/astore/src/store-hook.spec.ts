import { renderHook, act, cleanup } from '@testing-library/react-hooks'
import { createStore, useStore, getStore, Storage } from './store-hook'

describe('useStore', () => {
  interface UserState {
    name: string
    key: string
  }
  afterEach((): void => {
    cleanup()
    Storage.stores = {}
  })
  it('plain state value', () => {
    createStore({ name: 'COUNTER', state: 0 })
    const { result } = renderHook(() => useStore('COUNTER'))
    const [state, setState] = result.current

    expect(state).toBe(0)

    act(() => {
      setState(1)
    })
    expect(result.current[0]).toBe(1)
    act(() => {
      setState(() => 2)
    })
    expect(result.current[0]).toBe(2)
  })

  it('js object value', () => {
    createStore<UserState>({ name: 'USER', state: { name: 'bar', key: 'bar2' } })
    const { result } = renderHook(() => useStore<UserState>('USER'))

    const [state, setState] = result.current
    expect(state.name).toBe('bar')

    act(() => {
      setState({ ...state, name: 'foo' })
    })
    expect(result.current[0].name).toBe('foo')
    expect(result.current[0].key).toBe('bar2')

    //// function
    //act(() => {
    //  setState(state => ({ ...state, name: 'fooo' }))
    //})
    //expect(result.current[0].name).toBe('fooo')

    // immer
    act(() => {
      setState(state => {
        state.name = 'foooo'
      })
    })
    expect(result.current[0].name).toBe('foooo')
  })

  it('use store with effects', () => {
    createStore({
      name: 'USER2',
      state: { name: 'foo', key: 'foo1' },
      effects: (getState, setState) => ({
        changeName(name: string) {
          setState({ ...getState(), name })
        },
      }),
    })
    const { result } = renderHook(() => useStore('USER2'))

    expect(result.current[0].name).toBe('foo')
    act(() => {
      result.current[2].changeName('bar')
    })
    expect(result.current[0].name).toBe('bar')
  })
  it('use store multiple effects no stale state', () => {
    createStore({
      name: 'USER2',
      state: { name: 'foo', key: 'foo1' },
      effects: (getState, setState: any) => ({
        changeName(name: string) {
          setState({ name })
        },
        resetName() {
          const prevState = getState()
          if (prevState.name === 'bar') {
            setState((state: any) => {
              state.name = 'foo'
            })
          }
        },
      }),
    })
    const { result } = renderHook(() => useStore('USER2'))

    const { changeName, resetName } = result.current[2]

    expect(result.current[0].name).toBe('foo')
    act(() => {
      changeName('bar')
    })
    expect(result.current[0].name).toBe('bar')
    act(() => {
      resetName()
    })
    expect(result.current[0].name).toBe('foo')
  })
})

describe('multiple store', () => {
  afterEach((): void => {
    cleanup()
    Storage.stores = {}
  })
  it('getStore in other store effect', () => {
    createStore({
      name: 'USER',
      state: { name: 'foo', key: 'foo1' },
      effects: () => ({
        changeName(name: string) {
          const { setState: setUser2State } = getStore('USER1')
          setUser2State((state: any) => {
            state.name = name
          })
        },
      }),
    })
    createStore({
      name: 'USER1',
      state: { name: 'bar', key: 'bar1' },
    })
    const { result: res1 } = renderHook(() => useStore('USER'))
    const { result: res2 } = renderHook(() => useStore('USER1'))

    expect(res1.current[0].name).toBe('foo')
    act(() => {
      res1.current[2].changeName('bar2')
    })
    expect(res2.current[0].name).toBe('bar2')
  })
})
