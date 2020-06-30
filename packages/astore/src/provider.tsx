import React, { useEffect, useMemo, createContext, ReactElement } from 'react'
import { Storage } from './store-hook'
import { AStokContextType, AStokProviderProps, MakeFetchFn, FetchEndpoint } from './dtypes'

const AStokContext = createContext<AStokContextType>({})

export { AStokContext }
export const AstokProvider = ({
  restful,
  defaultStates,
  storePath,
  pinnedStores = [],
  children,
}: AStokProviderProps): ReactElement => {
  useEffect(() => {
    if (storePath) {
      ;(async () => {
        const pinnedStorePromises = pinnedStores.map(pnstore =>
          import(`${storePath}/${pnstore}.ts`),
        )
        await Promise.all(pinnedStorePromises)
      })()
    }
  }, [storePath, pinnedStores])
  let restendpoints: FetchEndpoint[] = []
  let fetchHook: MakeFetchFn | null = null
  if (restful) {
    fetchHook = restful.hook.makeFetch
    if (restful.endpoints) {
      restendpoints = restful.endpoints
    } else if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      restendpoints.push({
        key: 'defaut',
        base_url: window.location.origin,
      })
    }
  }
  if (defaultStates) {
    Object.keys(defaultStates).forEach(storeKey => {
      const store = Storage.get(storeKey)
      if (store) {
        store.injectState(defaultStates[storeKey])
      }
    })
  }
  const contextValues = useMemo(
    (): AStokContextType => ({
      makeFetch: fetchHook!,
      fetchEndpoints: restendpoints,
    }),
    [restendpoints, fetchHook],
  )
  return <AStokContext.Provider value={contextValues}>{children}</AStokContext.Provider>
}
