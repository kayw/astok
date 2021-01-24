import React, { createContext, ReactElement, ReactNode } from 'react'
import { AStokContextType } from './dtypes'

interface AStokProviderProps {
  inject?: any
  children: ReactNode
}
export const AStokContext = createContext<AStokContextType>({})
// https://stackoverflow.com/questions/58123398/when-to-use-jsx-element-vs-reactnode-vs-reactelement
export const AstokProvider = ({ inject, children }: AStokProviderProps): ReactElement => {
  return <AStokContext.Provider value={{ inject }}>{children}</AStokContext.Provider>
}
