import newItem from '../js/newToDo';
import { item } from '../js/data';
import { refs } from '../index';
const todoNewItem = newItem;

const readTodos = () =>
  item.then(r => {
    const items = r.data.map(todoNewItem).join('');

      refs.todoList.innerHTML = items;
      
      refs.loading.classList.add('novisible');
  });

export default readTodos;
