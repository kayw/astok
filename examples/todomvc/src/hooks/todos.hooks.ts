import { useStore as createStore } from '@astok/store/src'

export interface Todo {
  text: string
  completed: boolean
  id: number
}

const todoState = {
  todos: [
    {
      text: 'Use Stook',
      completed: false,
      id: 0,
    },
  ],

  todosCount() {
    return this.todos.length
  },
  completedCount() {
    return this.todos.filter(todo => todo.completed).length
  },

  addTodo(text: string) {
    this.todos.push({
      id: this.todos.reduce((maxId, todo) => Math.max(todo.id, maxId), -1) + 1,
      completed: false,
      text,
    })
  },

  deleteTodo(id: number) {
    this.todos = this.todos.filter(todo => todo.id !== id)
  },

  editTodo({ id, text }: Todo) {
    this.todos = this.todos.map(todo => (todo.id === id ? { ...todo, text } : todo))
  },

  completeTodo(id: number) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    )
  },

  completeAllTodos() {
    const areAllMarked = this.todos.every(todo => todo.completed)
    this.todos = this.todos.map(todo => ({
      ...todo,
      completed: !areAllMarked,
    }))
  },

  clearCompleted() {
    this.todos = this.todos.filter(todo => todo.completed === false)
  },
}

type TodoType = typeof todoState
export default createStore<TodoType>(todoState)
