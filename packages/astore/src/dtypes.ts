import { ReactNode } from 'react'
import { Draft } from 'immer'

export interface AStokContextType {
  inject?: any
}

export interface AStokProviderProps {
  inject?: any
  children: ReactNode
}

export type Action<S> = S | ((prevState: S) => S) | ((prevState: S) => void)

export type EffectReducer = (...payload: any[]) => any | Promise<any>
export type ReducerDraft<S> = (draft: Draft<S>, ...payload: any[]) => any
export type EffectDraft<S> = (draft: Draft<S>, ...payload: any) => Promise<any>

export type Reducers<S> = {
  [key: string]: ReducerDraft<S>
}
export type Effects<S> = {
  [key: string]: EffectDraft<S>
}
