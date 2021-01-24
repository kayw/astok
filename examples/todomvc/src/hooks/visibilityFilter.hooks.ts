import { useStore as createStore } from '../../../../packages/astore/src'

export default createStore( {
  visibilityFilter: 'show_all',
  setVisibilityFilter(visFilter: string) {
    this.visibilityFilter = visFilter
  }
})
