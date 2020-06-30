import { ReactNode, Dispatch } from 'react'

export interface FetchEndpoint {
  key: string
  base_url: string
  headers?: {}
}
export type MakeFetchFn = (url: string, options: any) => { get: any; onLoading: any; onError: any }
export interface AStokContextType {
  makeFetch?: MakeFetchFn
  fetchEndpoints?: FetchEndpoint[]
}

export interface AStokProviderProps {
  restful?: { hook: { makeFetch: MakeFetchFn }; endpoints: FetchEndpoint[] }
  defaultStates?: { [key: string]: any }
  storePath?: string
  pinnedStores?: string[]
  children: ReactNode
}

export type Action<S> = S | ((prevState: S) => S) | ((prevState: S) => void)

export type EffectFn = (...payload: any[]) => any

export type Effects<S> = (
  getState: () => S,
  setState: Dispatch<Action<S>>,
  fetcher?: any,
) => {
  [key: string]: EffectFn
}
