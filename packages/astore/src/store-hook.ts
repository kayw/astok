import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import { produce, Draft } from 'immer'
import { Effects, Reducers, EffectReducer } from './dtypes'
import { AStokContext } from './provider'

type StoreState = { [key: string]: any }

const setLoading = (
  reducers: { [key: string]: EffectReducer },
  key: string,
  loading: boolean,
  setters: Dispatch<SetStateAction<number>>[],
) => {
  Object.assign(reducers[key], { loading })
  setters.forEach(setState => {
    setState(Math.random())
  })
}

export default function useStore<S = StoreState>(opts: {
  namespace?: string
  state: S
  reducers?: Reducers<S>
  effects?: (inject?: any) => Effects<S>
}) {
  let optState: S = opts.state
  const setters: Dispatch<SetStateAction<S>>[] = []
  const loadingSetters: Dispatch<SetStateAction<number>>[] = []
  const reducerTypeCheckRes = opts.reducers ?? {}
  type ReducerType = typeof reducerTypeCheckRes
  const effectTypeCheckRes = opts.effects ? opts.effects() : {}
  type EffectType = typeof effectTypeCheckRes
  let dispatch: { [key in keyof (ReducerType | EffectType)]: EffectReducer }
  function notifyNewState(newState: S) {
    optState = newState
    setters.forEach(update => {
      update(newState)
    })
  }
  function useStoreHook(): [S, { [key in keyof (ReducerType | EffectType)]: EffectReducer }] {
    const [state, set] = useState(optState)
    const [, setLoadingState] = useState(0)
    useEffect(() => {
      let setIndex = setters.indexOf(set)
      let loadingSetIndex = loadingSetters.indexOf(setLoadingState)
      if (setIndex === -1) {
        setters.push(set)
        setIndex = setters.length - 1
      }
      if (loadingSetIndex === -1) {
        loadingSetters.push(setLoadingState)
        loadingSetIndex = loadingSetters.length - 1
      }

      return () => {
        setters.splice(setIndex, 1)
        loadingSetters.splice(loadingSetIndex, 1)
      }
    }, [])
    const context = useContext(AStokContext)
    if (!dispatch) {
      dispatch = {} as { [key in keyof (ReducerType | EffectType)]: EffectReducer }
      if (opts.reducers) {
        Object.entries(opts.reducers).forEach(([reducerKey, reducerFn]) => {
          dispatch[reducerKey] = (...args: any) => {
            const newState = produce(state, (draft: Draft<S>) => {
              const res = reducerFn(draft, ...args)
              if (res && state === draft) {
                // to support primitive type immer draft direct return modify
                return res
              }
            })
            notifyNewState(newState)
          }
        })
        /*
      const reducerKeys = Object.keys(opts.reducers)
      for (let i = 0; i < reducerKeys.length; i += 1) {
        const reducerKey = reducerKeys[i] as keyof R
        const reducerFn = opts.reducers[reducerKey] as ReducerDraft<S>
        reducers[reducerKey as keyof (E | R)] = (...args: any) => {
          const newState = produce(state, (draft: Draft<S>) => {
            reducerFn(draft, ...args)
          })
          notifyNewState(newState)
        }
      }
     */
      }
      if (opts.effects) {
        const effectRes = opts.effects(context.inject)
        Object.entries(effectRes).forEach(([effectKey, effectFn]) => {
          console.log(effectKey, effectFn, effectFn.constructor)
          dispatch[effectKey] = async (...args: any) => {
            let res: any
            const newState = await produce(state, async (draft: Draft<S>) => {
              setLoading(dispatch, effectKey, true, loadingSetters)
              console.log('effect fn', effectKey)
              res = await effectFn(draft, ...args)
              setLoading(dispatch, effectKey, false, loadingSetters)
              if (draft === state) {
                // primitive type
                return res
              }
            })
            console.log('notify ', newState)
            notifyNewState(newState)
            return res
          }
        })
      }
    }
    return [state, dispatch]
  }

  return useStoreHook
}
