import React, { createContext, ReactElement } from 'react'
import { AStokContextType, AStokProviderProps } from './dtypes'

export const AStokContext = createContext<AStokContextType>({})
// https://stackoverflow.com/questions/58123398/when-to-use-jsx-element-vs-reactnode-vs-reactelement
export const AstokProvider = ({ inject, children }: AStokProviderProps): ReactElement => {
  return <AStokContext.Provider value={{ inject }}>{children}</AStokContext.Provider>
}
