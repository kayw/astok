import { useStore as createStore } from '@astok/store'

export default createStore( {
  visibilityFilter: 'show_all',
  setVisibilityFilter(visFilter: string) {
    this.visibilityFilter = visFilter
  }
})
