import { useState, useEffect, useContext, Dispatch, SetStateAction } from 'react'
import { AStokContext } from './provider'

type StoreState = { [key: string]: any }

const isFunction = (fn: any) => typeof fn === 'function'
//const isUndefined = prop => typeof prop === 'undefined'
const isObject = (o: any) => Object.prototype.toString.call(o) === '[object Object]'
const isPromise = (fn: any) => {
  if (fn instanceof Promise) return true
  return isObject(fn) && isFunction(fn.then)
}
const addProxy = (o: any, handler: ProxyHandler<any>) => {
  if (Array.isArray(o)) {
    o.forEach((item, index) => {
      if (isObject(item)) {
        o[index] = addProxy(item, handler)
      }
    })
  } else if (isObject(o)) {
    Object.keys(o).forEach(key => {
      o[key] = addProxy(o[key], handler)
    })
  } else {
    return o
  }
  // eslint-disable-next-line
  if (o && o.__isProxy__) return o;
  return new Proxy(o, handler)
}

export default function useStore<S = StoreState>(opts: S) {
  const state: { [key in keyof S]: any } = {} as { [key in keyof S]: any }
  const reducers: { [key in keyof S]: any } = {} as { [key in keyof S]: any }
  const setters: Dispatch<SetStateAction<number>>[] = []
  let storeChanged = false
  Object.keys(opts).forEach(key => {
    if (key[0] === '$') {
      throw new Error(`${key}: staring $ is not allowd in store object.`)
    }
    const optKey = key as keyof S // https://stackoverflow.com/questions/59390026/how-to-use-es6-proxy-in-typescript
    if (isFunction(opts[optKey])) {
      reducers[optKey] = opts[optKey]
    } else {
      state[optKey] = opts[optKey]
    }
  })
  const handler: ProxyHandler<any> = {
    set(target, prop: string, newValue) {
      if (prop[0] === '$' || isFunction(newValue)) {
        target[prop] = newValue
        return true
      }
      // can we get origin caller key ?
      if (Object.keys(hook).filter(hkkey => hook[hkkey] && hook[hkkey].updating).length === 0) {
        console.error(
          'Do not modify data within components, call a method of service to update the data.',
          `prop:${prop}, value:${newValue}`,
        )
      }
      if (target[prop] !== newValue) {
        storeChanged = true
      }
      target[prop] = addProxy(newValue, handler)
      return true
    },
    get(target, prop) {
      if (prop === '__isProxy__') return true
      return target[prop]
    },
  }
  const hook = addProxy(state, handler)
  function checkUpdateAndBroadcast() {
    if (storeChanged) {
      storeChanged = false
      setters.forEach(set => set(Date.now()))
    }
  }
  Object.keys(reducers).forEach(key => {
    hook[key] = (...args: any[]) => {
      hook[key].updating += 1
      const promise = reducers[key as keyof S].apply(hook, args)
      if (!isPromise(promise)) {
        hook[key].updating -= 1
        checkUpdateAndBroadcast()
        return promise
      }
      hook[key].loading = true
      storeChanged = true
      checkUpdateAndBroadcast()
      return promise.finally(() => {
        storeChanged = true
        hook[key].loading = false
        hook[key].updating -= 1
        checkUpdateAndBroadcast()
      })
    }
    hook[key].loading = false
    hook[key].updating = 0
  })
  function ReactStoreHook(): S {
    const [, set] = useState(0)
    useEffect(() => {
      let setIndex = setters.indexOf(set)
      if (setIndex === -1) {
        setters.push(set)
      }

      return () => {
        setters.splice(setIndex, 1)
      }
    }, [])
    const context = useContext(AStokContext)
    if (context.inject) {
      Object.keys(context.inject).forEach(injKey => {
        hook[`$${injKey}`] = context.inject[injKey]
      })
    }
    return hook
  }

  return ReactStoreHook
}
