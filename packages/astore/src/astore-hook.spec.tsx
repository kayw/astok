import React, { ReactNode, ReactElement } from 'react'
import { renderHook, act, cleanup } from '@testing-library/react-hooks'
import useStore from './store-hook'
import { AstokProvider } from './provider'

describe('useStore', () => {
  interface UserState {
    name: string
    key: string
    changeName?: (name: string) => void
    resetName?: () => void
    updateKey?: (newKey: string) => void
    fetchNewName?: (name: string) => Promise<string>
  }
  afterEach((): void => {
    cleanup()
  })
  it('plain state value', async () => {
    const useCounter = useStore({
      state: 0,
      setCounter(counter: number) {
        this.state = counter
      },
    })
    const { result } = renderHook(() => useCounter())
    const { state, setCounter } = result.current

    expect(state).toBe(0)

    act(() => {
      setCounter(1)
    })
    expect(result.current.state).toBe(1)
  })

  it('js object value', () => {
    const useUser = useStore({
      name: 'bar',
      key: 'bar2',
      id: 1,
      nullObj: null,
      updates: [],
      setName(name: string) {
        this.name = name
        this.id++
        this.nullObj = { name: 'not null' }
        this.updates.push(name)
      },
    })
    const { result } = renderHook(() => useUser())

    const { name, setName } = result.current
    expect(name).toBe('bar')

    act(() => {
      setName('foo')
    })
    expect(result.current.name).toBe('foo')
    expect(result.current.key).toBe('bar2')
    expect(result.current.id).toBe(2)
    expect(result.current.nullObj?.name).toBe('not null')
    expect(result.current.updates.length).toBe(1)
    expect(result.current.updates[0]).toBe('foo')
  })

  it('use store multiple effects no stale state', () => {
    const useUser = useStore<UserState>({
      name: 'foo',
      key: 'foo1',
      changeName(name: string) {
        this.name = name
      },
      resetName() {
        if (this.name === 'bar') {
          this.name = 'foo'
        }
      },
    })
    const { result } = renderHook(() => useUser())

    const { changeName, resetName } = result.current

    expect(result.current.name).toBe('foo')
    act(() => {
      changeName('bar')
    })
    expect(result.current.name).toBe('bar')
    act(() => {
      resetName()
    })
    expect(result.current.name).toBe('foo')
  })
  it('store async effect with return result', async () => {
    const useUser = useStore<UserState>({
      name: 'foo',
      key: '1',
      updateKey(newKey) {
        this.key = newKey
      },
      async fetchNewName(name: string): Promise<string> {
        const changes: string = await new Promise(resolve => {
          setTimeout(() => {
            resolve(`foo => ${name}`)
          }, 10)
        })
        this.name = name
        return changes
      },
    })
    const { result } = renderHook(() => useUser())
    const { updateKey, fetchNewName } = result.current
    let fetchRes: string
    await act(async () => {
      fetchRes = await fetchNewName('bar')
    })
    expect(fetchRes).toBe('foo => bar')
    expect(result.current.name).toBe('bar')
    act(() => {
      updateKey('7')
    })
    expect(result.current.key).toBe('7')
  })
  it('concurrent async effect data set all reducers with updating flag', async () => {
    const useUser = useStore<UserState>({
      name: 'foobar',
      key: 'fb',
      async updateKey(newKey) {
        await new Promise(resolve => {
          setTimeout(() => {
            this.key = newKey
            resolve()
          }, 11)
        })
      },
      async fetchNewName(name: string): Promise<string> {
        const changes: string = await new Promise(resolve => {
          setTimeout(() => {
            resolve(`foo => ${name}`)
          }, 10)
        })
        this.name = name
        return changes
      },
    })
    const { result } = renderHook(() => useUser())
    const { updateKey, fetchNewName } = result.current
    let fetchRes: string
    await act(async () => {
      const res = await Promise.all([fetchNewName('bar'), updateKey('bf')])
      fetchRes = res[0]
    })
    expect(fetchRes).toBe('foo => bar')
    expect(result.current.name).toBe('bar')
    expect(result.current.key).toBe('bf')
  })
  it('reducer reentrant async effect updating flag need count', async () => {
    const useUser = useStore<UserState>({
      name: 'foobar',
      key: 'fb',
      async updateKey(newKey) {
        await new Promise(resolve => {
          setTimeout(() => {
            this.key = newKey
            resolve()
          }, 11)
        })
      },
    })
    const { result } = renderHook(() => useUser())
    const { updateKey } = result.current
    await act(async () => {
      await Promise.all([updateKey('bf'), updateKey('cf')])
    })
    expect(result.current.key).toBe('cf')
  })
  it('provider wrapper inject $method', async () => {
    const useUser = useStore<UserState>({
      name: 'foobar',
      key: 'fb',
      updateKey(newKey) {
        this.key = this.$method1() + ' ' + newKey
      },
    })
    const wrapper = ({ children }: { children?: ReactNode }): ReactElement => (
      <AstokProvider inject={{ method1: () => 'method1 result' }}>{children}</AstokProvider>
    )
    const { result } = renderHook(() => useUser(), { wrapper })
    const { updateKey } = result.current
    act(() => {
      updateKey('bf')
    })
    expect(result.current.key).toBe('method1 result bf')
  })
})
