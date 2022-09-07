/* Import file V 2.0 */
import './css/style.css';
import * as basicLightbox from 'basiclightbox';
import '../node_modules/basiclightbox/dist/basicLightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { currentTimeOnHomePage } from './js/clock';
import { TodoApi } from './js/todos-API';
import { newItem } from './js/newToDo';
import * as VH from './js/visually-hidden';

const todoApi = new TodoApi();
/* Import file V 2.0 */

// import '../node_modules/basiclightbox/src/styles/main.scss';
import axios from 'axios';
import shortid from 'shortid';
import moment from 'moment';

// import readTodos from './js/todos-API';

// const todoNewItem = newItem;

axios.defaults.baseURL = 'https://630b95ba83986f74a7b3a073.mockapi.io/api/v1';
const item = axios.get('/items');

export const refs = {
  todoList: document.querySelector('.todo-list'),
  btnAdd: document.querySelector('.todo-add__button'),
  inputAddItem: document.querySelector('.todo-add__input'),
  inputSearch: document.querySelector('.todo-filter__input.search'),
  inputSort: document.querySelector('.todo-filter__input.sort'),
  clock: document.querySelector('.clock'),
  loading: document.querySelector('.loading'),
  loadMoreBtn: document.querySelector('.load-more'),
};

currentTimeOnHomePage();

readTodos();

async function readTodos() {
  VH.loadingOn();
  todoApi.resetPage();
  todoApi.maxShowPages();

  await todoApi.fetchApi().then(r => {
    const itemsList = r.map(newItem).join('');

    refs.todoList.innerHTML = itemsList;

    VH.loadingOff();
    VH.loadMoreOn();
    todoApi.pageIncrement();
  });
}

async function onClickBtnLoadMore() {
  VH.loadingOn();
  VH.loadMoreOff();
  await todoApi.fetchApi().then(r => {
    if (todoApi.page >= todoApi.maxPages) {
      Notify.info('Відображено всі записи!');
      VH.loadingOff();
      VH.loadMoreOff();
      const itemsList = r.map(newItem).join('');

      refs.todoList.insertAdjacentHTML('beforeend', itemsList);
      return;
    }
    const itemsList = r.map(newItem).join('');

    refs.todoList.insertAdjacentHTML('beforeend', itemsList);
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

let items = [];
item.then(({ data }) => {
  items = data;
});

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

  const idOfDelete = e.target.closest('li').dataset.id;

  await todoApi.deleteTodo(idOfDelete);

  Notify.failure('Запис видалено!', {
    width: '205px',
  });
  readTodos();
}

const sortListToDo = () => {
  const sorted = array => {
    refs.inputSearch.value = '';
    const sortArr = array.map(todoNewItem).join('');

    refs.todoList.innerHTML = sortArr;
  };

  switch (refs.inputSort.value) {
    case 'az':
      return sorted([...items].sort((a, b) => a.text.localeCompare(b.text)));
    case 'za':
      return sorted([...items].sort((a, b) => b.text.localeCompare(a.text)));
    default:
      return sorted([...items]);
  }
};

const searchFilter = () => {
  const searchFilterList = items.filter(x =>
    x.text.toLocaleLowerCase().includes(refs.inputSearch.value.toLowerCase())
  );

  refs.todoList.innerHTML = searchFilterList.map(todoNewItem).join('');
};

function onOffChecked(e) {
  if (e.target.nodeName !== 'INPUT') {
    return;
  }
  const inputId = e.target.closest('li').dataset.id;

  const trueOrFalse = items.find(x => x.id === inputId);
  trueOrFalse.isDone = !trueOrFalse.isDone;

  axios.put(`/items/${inputId}`, trueOrFalse);
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

function scrollOnBtnLoadMore() {
  refs.loadMoreBtn.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

// ----- EventListeners--------
refs.inputSearch.addEventListener('input', searchFilter);
refs.inputSort.addEventListener('change', sortListToDo);
refs.todoList.addEventListener('click', clickDeleteToDoList);
refs.todoList.addEventListener('click', onOffChecked);
refs.todoList.addEventListener('click', onShowModal);
refs.btnAdd.addEventListener('click', addNewItem);
refs.inputAddItem.addEventListener('input', copyToLocalStorage);
refs.loadMoreBtn.addEventListener('click', onClickBtnLoadMore);
