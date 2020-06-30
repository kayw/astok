import React from 'react'
import { AstokProvider } from './provider'
import * as tlr from '@testing-library/react'
import { createStore, getStore } from './store-hook'

describe('Provider', (): void => {
  it('should be defined/exist when imported', (): void => {
    expect(typeof AstokProvider).toBe('function')
  })
  describe('Provider inject defaultStates', (): void => {
    createStore({ name: 'COUNTER', state: 0 })
    createStore({ name: 'USER', state: { name: 'bar', key: 'bar2' } })
    it('the counter store state should equal to the initialStates ', () => {
      const initialStates = { COUNTER: 5 }
      tlr.render(
        <AstokProvider defaultStates={initialStates}>
          <div />
          <div />
        </AstokProvider>,
      )
      expect(getStore('COUNTER').state).toBe(5)
    })
  })
})
