import React, { useRef } from 'react'
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react'
import createStore from './store-hook'

const sleep = async (t: number) => new Promise(resolve => setTimeout(resolve, t))

const useTodo = createStore({
  state: {
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
  },
  reducers: {
    addTodo(draft, content) {
      draft.id++
      const todo = {
        id: draft.id,
        content,
        status: 'DOING',
      }
      draft.todos.push(todo)
    },
    updateNull(draft) {
      draft.testNull = { name: 'testname' }
    },
    getTodoById(draft, id) {
      return draft.todos.filter(item => item.id === id)[0]
    },
    updateTodo(draft, id, status) {
      const todo = draft.todos.filter(item => item.id === id)[0] //this.getTodoById(id);
      if (!todo) return
      todo.status = status
    },
  },
  effects: () => ({
    async delayIncId(draft) {
      await sleep(100 * 3)
      draft.incId++
      console.log('delayIncId awake')
    },
  }),
})

function Todo() {
  const [state, dispatch] = useTodo()
  const inputEl = useRef(null)
  const handleClick = item => {
    if (item.status === 'DOING') {
      dispatch.updateTodo(item.id, 'COMPLETED')
    } else if (item.status === 'COMPLETED') {
      dispatch.updateTodo(item.id, 'DOING')
    }
  }
  const handleAddTodo = () => {
    console.warn('set data within component, should be got console.error : ')
    //state.todos[0].id = 1000
    const text = inputEl.current?.value
    if (text) {
      dispatch.addTodo(text)
    }
  }
  console.log(state)
  return (
    <div>
      <div data-testid="incid">{state.incId}</div>
      <div data-testid="testNull">{state.testNull?.name ?? ''}</div>
      {!dispatch.delayIncId.loading ? <div data-testid="incidfinish" /> : ''}

      <div data-testid="incidloading">{dispatch.delayIncId.loading ? 'loading' : 'completed'}</div>
      <div data-testid="todocount">{state.todos.length}</div>
      <ul data-testid="todolist">
        {state.todos.map(item => {
          return (
            <li key={item.id} onClick={() => handleClick(item)}>
              {item.content}
              <span>{item.status}</span>
            </li>
          )
        })}
      </ul>
      <input ref={inputEl} data-testid="todoinput" type="text" />
      <button type="button" data-testid="todobtn" onClick={() => handleAddTodo()}>
        add todo
      </button>

      <button
        type="button"
        data-testid="incbtn"
        onClick={async () => {
          console.log('async inc btn')
          await dispatch.delayIncId()
          console.log('async inc btn waited')
        }}
      >
        delay inc id
      </button>

      <button type="button" data-testid="nullbtn" onClick={dispatch.updateNull}>
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
    // expect(todolist.innerHTML).toEqual('<li>first<span>COMPLETED</span></li>');
    console.log('todolist html', todolist.innerHTML)
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
