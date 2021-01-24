import * as React from 'react'
import Footer from './Footer'
import TodoList from './TodoList'
import useTodos from '../hooks/todos.hooks'

const MainSection = () => {
  const { todosCount: todosCountFn, completedCount: ccFn, completeAllTodos, clearCompleted } = useTodos()

const todosCount = todosCountFn()
const completedCount = ccFn()
  return (
    <section className="main">
      <React.Fragment>
        {!!todosCount && (
          <span>
            <input className="toggle-all" type="checkbox" />
            <label onClick={completeAllTodos} />
          </span>
        )}
        <TodoList />
        {!!todosCount && (
          <Footer
            completedCount={completedCount}
            activeCount={todosCount - completedCount}
            onClearCompleted={clearCompleted}
          />
        )}
      </React.Fragment>
    </section>
  )
}

export default MainSection
