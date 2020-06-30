import { useState, useEffect, useRef, useContext, Dispatch, SetStateAction } from 'react'
import { produce, Draft } from 'immer'
import { Effects, EffectFn, Action } from './dtypes'
import { AStokContext } from './provider'

class Store<S = any> {
  state: S
  effects?: Effects<S>
  fetchable?: boolean
  setters: Dispatch<SetStateAction<S>>[] = []
  constructor(value: S, effects?: Effects<S>, fetchable?: boolean) {
    this.state = value
    this.effects = effects
    this.fetchable = fetchable
  }
  getState = (): S => this.state
  setState = (value: Action<S>): void => {
    if (typeof value !== 'function') {
      // not function
      this.state = value as S
    } else if (typeof this.state !== 'object') {
      // can not use immer
      this.state = (value as Function)(this.state)
    } else {
      const immerState = produce(this.state, (draft: Draft<S>): void => {
        ;(value as Function)(draft)
      })
      this.state = immerState
    }

    this.setters.forEach(set => set(this.state)) // selector
  }
  injectState = (state: S): void => {
    this.state = state
  }
}

interface Stores {
  [key: string]: Store
}

export class Storage {
  static stores: Stores = {}
  static set(key: string, value: Store) {
    const store = Storage.stores[key]
    if (!store) {
      Storage.stores[key] = value
    }
  }

  static get<S = any>(key: string): Store<S> {
    return Storage.stores[key]
  }
}

export function createStore<S = any>({
  name,
  state,
  effects,
  fetchable,
}: {
  name: string
  state: S
  effects?: Effects<S>
  fetchable?: boolean
}) {
  const storageStore = Storage.get(name)
  if (storageStore) {
    throw new Error(`Store with name ${name} already exists`)
  }
  Storage.set(name, new Store<S>(state, effects, fetchable))
}

export function useStore<S = any>(
  key: string,
): [S, Dispatch<Action<S>>, { [key: string]: EffectFn }] {
  const storageStore = Storage.get(key)
  if (!storageStore) {
    throw new Error(`Store with name ${key} not exists`)
  }
  const initalValue = storageStore.state
  const { current: initialState } = useRef(initalValue)

  const newStore = Storage.get(key)
  const [state, set] = useState(initialState)
  const { setters } = newStore

  useEffect(() => {
    let setIndex = setters.indexOf(set)
    if (setIndex === -1) {
      setters.push(set)
      setIndex = setters.length - 1
    }

    return () => {
      setters.splice(setIndex, 1)
    }
  }, [])
  const context = useContext(AStokContext)
  let es: { [key: string]: EffectFn } = {}
  if (newStore.effects) {
    let fetcher = {}
    if (newStore.fetchable && context.makeFetch) {
      const doFetch = context.makeFetch!()[
        ('get', 'post', 'delete', 'patch', 'put', 'head')
      ].forEach(method => {
        fetcher[method] = (
          url: string,
          options?: any,
          onLoading: (loading: boolean) => any,
          onError: (error) => any,
        ) => {
          let fetchEnp
          if (options && options.endpoint) {
            fetchEnp = context.fetchEndpoints!.find(fep => fep.key === options.endpoint)
          } else if (context.fetchEndpoints!.length === 1) {
            fetchEnp = context.fetchEndpoints![0]
          }
          let fetchUrl = url
          let fetchOption = { ...options }
          if (fetchEnp) {
            fetchUrl = `${fetchEnp.base_url}${fetchUrl}`
            delete fetchOption.endpoint
            fetchOption.headers = { ...fetchOption.headers, ...fetchEnp.headers }
          }
          doFetch.onLoading(onLoading)
          doFetch.onError(onError)
          return doFetch[method](fetchUrl, fetchOption)
        }
      })
    }
    es = newStore.effects(newStore.getState, newStore.setState, fetcher)
    /*
    Object.keys(es).forEach(esfunc => {
      es[esfunc] = es[esfunc].bind(newStore)
    })
   */
  }

  return [state, newStore.setState, es]
}

export function getStore(name: string) {
  const storageStore = Storage.get(name)
  return {
    state: storageStore.state,
    setState: storageStore.setState.bind(storageStore),
  }
}
