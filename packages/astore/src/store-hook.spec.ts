import { renderHook, act, cleanup } from '@testing-library/react-hooks'
import useStore from './store-hook'
import { EffectReducer } from './dtypes'

describe('useStore', () => {
  interface UserState {
    name: string
    key: string
  }
  afterEach((): void => {
    cleanup()
  })
  it('plain state value', async () => {
    const useCounter = useStore({
      namespace: 'COUNTER',
      state: 0,
      reducers: {
        setCounter(_, counter: number) {
          return counter
        },
      },
    })
    const { result } = renderHook(() => useCounter())
    const [state, dispatch] = result.current

    expect(state).toBe(0)

    act(() => {
      dispatch.setCounter(1)
    })
    expect(result.current[0]).toBe(1)
  })

  it('js object value', () => {
    const useUser = useStore({
      namespace: 'USER',
      state: { name: 'bar', key: 'bar2', id: 1, nullObj: null },
      reducers: {
        setName(draft, name: string) {
          draft.name = name
          draft.id++
          draft.nullObj = { name: 'not null' }
        },
      },
    })
    const { result } = renderHook(() => useUser())

    const [state, dispatch] = result.current
    expect(state.name).toBe('bar')

    act(() => {
      dispatch.setName('foo')
    })
    expect(result.current[0].name).toBe('foo')
    expect(result.current[0].key).toBe('bar2')
    expect(result.current[0].id).toBe(2)
    expect(result.current[0].nullObj?.name).toBe('not null')
  })

  it('use store multiple effects no stale state', () => {
    const useUser = useStore<UserState>({
      state: { name: 'foo', key: 'foo1' },
      reducers: {
        changeName(draft, name: string) {
          draft.name = name
        },
        resetName(draft) {
          if (draft.name === 'bar') {
            draft.name = 'foo'
          }
        },
      },
    })
    const { result } = renderHook(() => useUser())

    const { changeName, resetName } = result.current[1] as { [key: string]: EffectReducer }

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
  it('store async effect with return result', async () => {
    const useUser = useStore<UserState>({
      state: { name: 'foo', key: '1' },
      reducers: {
        updateKey(draft, newKey) {
          draft.key = newKey
        },
      },
      effects: () => ({
        async fetchNewName(draft, name: string) {
          const changes = await new Promise(resolve => {
            setTimeout(() => {
              resolve(`foo => ${name}`)
            }, 10)
          })
          draft.name = name
          return changes
        },
      }),
    })
    const { result } = renderHook(() => useUser())
    const { updateKey, fetchNewName } = result.current[1] as { [key: string]: EffectReducer }
    let fetchRes: string
    await act(async () => {
      fetchRes = await fetchNewName('bar')
    })
    expect(fetchRes).toBe('foo => bar')
    expect(result.current[0].name).toBe('bar')
    act(() => {
      updateKey('7')
    })
    expect(result.current[0].key).toBe('7')
  })
})
