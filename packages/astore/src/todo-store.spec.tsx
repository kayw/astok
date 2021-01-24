import React, { useRef } from 'react'
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react'
import createStore from './store-hook'

const sleep = async (t: number) => new Promise(resolve => setTimeout(resolve, t))

const todoState = {
  id: 0,
  // test async function
  incId: 0,
  testNull: null,
  todos: [
    {
      id: 0,
      content: 'first',
      status: 'DOING',
    },
  ],
  addTodo(content) {
    this.id++
    const todo = {
      id: this.id,
      content,
      status: 'DOING',
    }
    this.todos.push(todo)
  },
  updateNull() {
    this.testNull = { name: 'testname' }
  },
  getTodoById(id) {
    return this.todos.filter(item => item.id === id)[0]
  },
  updateTodo(id, status) {
    const todo = this.getTodoById(id)
    if (!todo) return
    todo.status = status
  },
  async delayIncId() {
    await sleep(100 * 3)
    this.incId++
  },
}
type TodoHook = typeof todoState
const useTodo = createStore<TodoHook>(todoState)

function Todo() {
  const todoStore = useTodo()
  const inputEl = useRef(null)
  const handleClick = item => {
    if (item.status === 'DOING') {
      todoStore.updateTodo(item.id, 'COMPLETED')
    } else if (item.status === 'COMPLETED') {
      todoStore.updateTodo(item.id, 'DOING')
    }
  }
  const handleAddTodo = () => {
    console.warn('set data within component, should be got console.error : ')
    todoStore.todos[0].id = 1000
    const text = inputEl.current?.value
    if (text) {
      todoStore.addTodo(text)
    }
  }
  return (
    <div>
      <div data-testid="incid">{todoStore.incId}</div>
      <div data-testid="testNull">{todoStore.testNull?.name ?? ''}</div>
      {!todoStore.delayIncId.loading ? <div data-testid="incidfinish" /> : ''}

      <div data-testid="incidloading">{todoStore.delayIncId.loading ? 'loading' : 'completed'}</div>
      <div data-testid="todocount">{todoStore.todos.length}</div>
      <ul data-testid="todolist">
        {todoStore.todos.map(item => {
          return (
            <li key={item.id} onClick={() => handleClick(item)}>
              {item.content}
              <span>{item.status}</span>
            </li>
          )
        })}
      </ul>
      <input ref={inputEl} data-testid="todoinput" type="text" />
      <button type="button" data-testid="todobtn" onClick={handleAddTodo}>
        add todo
      </button>

      <button type="button" data-testid="incbtn" onClick={todoStore.delayIncId}>
        delay inc id
      </button>

      <button type="button" data-testid="nullbtn" onClick={todoStore.updateNull}>
        update null
      </button>
    </div>
  )
}

describe('todo store', () => {
  afterEach((): void => {
    cleanup()
  })

  test('#todo, click, add todo', async () => {
    const { rerender, getByTestId } = render(<Todo />)
    // first
    const todocount = getByTestId('todocount')
    expect(Number(todocount.textContent)).toEqual(1)
    console.log('todos count', todocount.textContent)

    let todolist = getByTestId('todolist')
    expect(todolist.innerHTML).toEqual('<li>first<span>DOING</span></li>')
    console.log('todolist html', todolist.innerHTML)

    // click
    console.log('====== click first todo start.')
    fireEvent.click(todolist.children[0])
    //expect(todolist.innerHTML).toEqual('<li>first<span>COMPLETED</span></li>')
    // console.log('todolist html', todolist.innerHTML)
    fireEvent.click(todolist.children[0])
    expect(todolist.innerHTML).toEqual('<li>first<span>DOING</span></li>')
    console.log('====== click first todo end.')

    // add todo

    const todoinput = getByTestId('todoinput')
    todoinput.value = 'second'
    fireEvent.click(todoinput)
    const todobtn = getByTestId('todobtn')
    fireEvent.click(todobtn)
    //rerender(<Todo />)
    console.log('click add toto button.')
    //todolist = getByTestId('todolist')
    console.log('todos count', todocount.textContent)
    console.log('todolist html', todolist.innerHTML)
    expect(todolist.innerHTML).toEqual(
      '<li>first<span>DOING</span></li><li>second<span>DOING</span></li>',
    )
  })

  test('#rerenertodo, store changed.', async () => {
    const { getByTestId } = render(<Todo />)

    // first
    const todocount = getByTestId('todocount')
    expect(Number(todocount.textContent)).toEqual(2)
    console.log('todos count', todocount.textContent)

    // const todolist = await waitForElement(() => getByTestId('todolist'));
    const todolist = getByTestId('todolist')
    expect(todolist.innerHTML).toEqual(
      '<li>first<span>DOING</span></li><li>second<span>DOING</span></li>',
    )
    console.log('todolist html', todolist.innerHTML)
  })

  test('#async inc id, test loading', async () => {
    const { rerender, getByTestId } = render(<Todo />)

    let loading = getByTestId('incidloading')
    // async incid
    expect(Number(getByTestId('incid').textContent)).toEqual(0)
    expect(loading.innerHTML).toEqual('completed')
    fireEvent.click(getByTestId('incbtn'))
    //rerender(<Todo />)
    //loading = getByTestId('incidloading')
    expect(loading.innerHTML).toEqual('loading')
    await waitFor(() => getByTestId('incidfinish'))
    expect(loading.innerHTML).toEqual('completed')
    expect(Number(getByTestId('incid').textContent)).toEqual(1)
    console.log('loading', loading.innerHTML)
    console.log('incid', getByTestId('incid').textContent)
  })

  test('#update null', async () => {
    const { rerender, getByTestId } = render(<Todo />)
    const nullbtn = getByTestId('nullbtn')
    fireEvent.click(nullbtn)
    //rerender(<Todo />)
    expect(getByTestId('testNull').innerHTML).toEqual('testname')
  })
})
