import axios from 'axios';
import newItem from '../js/newToDo';
// import { item } from '../js/data';
import { refs } from '../index';
const todoNewItem = newItem;

axios.defaults.baseURL = 'https://630b95ba83986f74a7b3a073.mockapi.io/api/v1';
const item = axios.get('/items');

const readTodos = () =>
  item.then(r => {
    
    const items = r.data.sort((a, b) => a.isDone  - b.isDone).map(todoNewItem).join('');

    refs.todoList.innerHTML = items;

    refs.loading.classList.add('novisible');
  });

export default readTodos;
