/* Import file V 2.0 */
import moment from 'moment';
import './css/style.css';
import * as basicLightbox from 'basiclightbox';
import '../node_modules/basiclightbox/dist/basicLightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';
import debounce from 'lodash.debounce';
import { refs } from './js/refs';
import { currentTimeOnHomePage } from './js/clock';
import { TodoApi } from './js/todos-API';
import { newItem } from './js/newToDo';
import * as VH from './js/visually-hidden';
import './js/scrollUpBtn';

const todoApi = new TodoApi();

currentTimeOnHomePage();

readTodos();

async function readTodos() {
  Loading.pulse('Loading...');
  VH.loadingOn();
  todoApi.resetPage();
  todoApi.maxShowPages();

  await todoApi.fetchApi().then(r => {
    const itemsList = r.map(newItem).join('');

    refs.todoList.innerHTML = itemsList;

    Loading.remove();
    VH.loadingOff();
    VH.loadMoreOn();
    todoApi.pageIncrement();
  });
}

async function onClickBtnLoadMore() {
  Loading.pulse('Loading...');
  VH.loadingOn();
  VH.loadMoreOff();
  await todoApi.fetchApi().then(r => {
    if (todoApi.page >= todoApi.maxPages) {
      Notify.info('Відображено всі записи!', { width: '205px' });
      Loading.remove();
      VH.loadingOff();
      VH.loadMoreOff();
      const itemsList = r.map(newItem).join('');

      refs.todoList.insertAdjacentHTML('beforeend', itemsList);
      return;
    }

    const itemsList = r.map(newItem).join('');

    refs.todoList.insertAdjacentHTML('beforeend', itemsList);
    Loading.remove();
    VH.loadingOff();
    VH.loadMoreOn();
    todoApi.pageIncrement();
  });
  scrollOnBtnLoadMore();
}

async function addNewItem(e) {
  e.preventDefault();

  if (refs.inputAddItem.value.trim().length === 0) {
    return;
  }

  const newItem = {
    text: refs.inputAddItem.value,
    isDone: false,
    date: Date.now(),
  };
  await todoApi.addTodo(newItem);

  refs.inputAddItem.value = '';
  localStorage.removeItem(LOCAL_STORAGE_TEXT);

  Notify.success('Новий запис створено!!', {
    width: '205px',
  });

  readTodos();
}

const LOCAL_STORAGE_TEXT = 'text-new-todo';

textInputNewAddOfLocalSt();

function textInputNewAddOfLocalSt() {
  const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT);

  if (savedText) {
    refs.inputAddItem.value = savedText;
  }
}

async function clickDeleteToDoList(e) {
  if (e.target.nodeName !== 'BUTTON') {
    return;
  }

  Confirm.show(
    'Видалення запису',
    'Ви впевнені?',
    'Так',
    'Ні',
    async () => {
      const idOfDelete = e.target.closest('li').dataset.id;

      await todoApi.deleteTodo(idOfDelete);

      Notify.failure('Запис видалено!', {
        width: '205px',
      });
      readTodos();
    },
    () => {
      return;
    },
    {}
  );
}

const sortListToDo = () => {
  refs.inputSearch.value = '';

  switch (refs.inputSort.value) {
    case 'az':
      todoApi.sort = 'text&order=asc';
      readTodos();
      return;
    case 'za':
      todoApi.sort = 'text&order=desc';
      readTodos();
      return;
    case 'dateUp':
      todoApi.sort = 'date&order=asc';
      readTodos();
      return;

    default:
      todoApi.sort = 'date&order=desc';
      readTodos();
  }
};

const searchFilter = () => {
  todoApi.searchFiltervalue = refs.inputSearch.value.toLowerCase();
  readTodos();
};

async function onOffChecked(e) {
  if (e.target.nodeName !== 'INPUT') {
    return;
  }
  const todoId = e.target.closest('li').dataset.id;

  todoApi.updateTodo(todoId);
}

function copyToLocalStorage(e) {
  if (refs.inputAddItem.value.length === 0) {
    localStorage.removeItem(LOCAL_STORAGE_TEXT);
  }
  if (refs.inputAddItem.value.trim().length !== 0) {
    localStorage.setItem(LOCAL_STORAGE_TEXT, e.target.value);
  }
}

function onShowModal(e) {
  if (e.target.nodeName !== 'IMG') {
    return;
  }

  const idItemsFind = e.target.closest('li').dataset.id;

  todoApi.getTodo(idItemsFind).then(r => {
    const instance = basicLightbox.create(`
    <div class="todo__modal">
    <h1>${r.text}</h1>
    <p class="todo-modal-text-title">Дата створення:</p>
    <p>${moment(r.date).format('DD-MM-YYYY, HH:mm:ss')}</p>
    </div>
  `);
    instance.show();

    window.addEventListener('keydown', onKey);
    function onKey(e) {
      if (e.key === 'Escape') {
        instance.close();
        window.removeEventListener('keydown', onKey);
      }
    }
  });
}

function onClickInputPageLimit(e) {
  switch (e.target.value) {
    case 'page-10':
      todoApi.limitPage = 10;
      readTodos();
      break;
    case 'page-20':
      todoApi.limitPage = 20;
      readTodos();
      break;
    case 'page-50':
      todoApi.limitPage = 50;
      readTodos();
      break;

    default:
      todoApi.limitPage = 5;
      readTodos();
      break;
  }
}

function scrollOnBtnLoadMore() {
  refs.loadMoreBtn.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

// -------- EventListeners --------
refs.inputSearch.addEventListener('input', debounce(searchFilter, 500));
refs.inputSort.addEventListener('change', sortListToDo);
refs.todoList.addEventListener('click', clickDeleteToDoList);
refs.todoList.addEventListener('click', onOffChecked);
refs.todoList.addEventListener('click', onShowModal);
refs.btnAdd.addEventListener('click', addNewItem);
refs.inputAddItem.addEventListener('input', copyToLocalStorage);
refs.loadMoreBtn.addEventListener('click', onClickBtnLoadMore);
refs.inputPageLimit.addEventListener('change', onClickInputPageLimit);
