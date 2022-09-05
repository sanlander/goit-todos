import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import shortid from 'shortid';
import * as basicLightbox from 'basiclightbox';
import './css/style.css';
import '../node_modules/basiclightbox/dist/basicLightbox.min.css';
import '../node_modules/basiclightbox/src/styles/main.scss';
import moment from 'moment';
import newItem from './js/newToDo';
import readTodos from './js/todos-API';

const todoNewItem = newItem;

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
};

readTodos();

let items = [];
item.then(({ data }) => {
  items = data;
});

function currentTimeOnHomePage() {
  setInterval(() => {
    refs.clock.textContent = moment().format('DD-MM-YYYY, HH:mm:ss');
  }, 1000);
}
currentTimeOnHomePage();

const LOCAL_STORAGE_TEXT = 'text-new-todo';

textInputNewAddOfLocalSt();

function textInputNewAddOfLocalSt() {
  const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT);

  if (savedText) {
    refs.inputAddItem.value = savedText;
  }
}

const clickDeleteToDoList = e => {
  if (e.target.nodeName !== 'BUTTON') {
    return;
  }
  // if (!confirm('Дійсно видалити ??')) {
  //   return;
  // }

  let idOfDelete = e.target.closest('li').dataset.id;

  axios.delete(`/items/${idOfDelete}`);
  items = items.filter(x => x.id !== `${idOfDelete}`);

  refs.todoList.innerHTML = items.map(todoNewItem).join('');

  Notify.failure('Запис видалено!', {
    fontSize: '14px',
    timeout: 2000,
    clickToClose: true,
  });
};

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

const addNewItem = e => {
  e.preventDefault();

  if (refs.inputAddItem.value.trim().length === 0) {
    return;
  }

  const newItem = {
    id: shortid(),
    text: refs.inputAddItem.value,
    isDone: false,
    date: Date.now(),
  };

  items.push(newItem);
  axios.post('/items', newItem);

  refs.todoList.insertAdjacentHTML('afterbegin', todoNewItem(newItem));

  refs.inputAddItem.value = '';
  localStorage.removeItem(LOCAL_STORAGE_TEXT);

  Notify.success('Новий запис створено!!', {
    fontSize: '14px',
    timeout: 2000,
    clickToClose: true,
  });
};

const onOffChecked = e => {
  if (e.target.nodeName !== 'INPUT') {
    return;
  }
  const inputId = e.target.closest('li').dataset.id;

  const trueOrFalse = items.find(x => x.id === inputId);
  trueOrFalse.isDone = !trueOrFalse.isDone;

  axios.put(`/items/${inputId}`, trueOrFalse);
};

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
  const itemsFind = items.find(x => x.id === e.target.closest('li').dataset.id);

  const instance = basicLightbox.create(`
    <div class="todo__modal">
    <h1>${itemsFind.text}</h1>
    <p class="todo-modal-text-title">Дата створення:</p>
    <p>${moment(itemsFind.date).format('DD-MM-YYYY, HH:mm:ss')}</p>
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
}

// ----- EventListeners--------
refs.inputSearch.addEventListener('input', searchFilter);
refs.inputSort.addEventListener('change', sortListToDo);
refs.todoList.addEventListener('click', clickDeleteToDoList);
refs.todoList.addEventListener('click', onOffChecked);
refs.todoList.addEventListener('click', onShowModal);
refs.btnAdd.addEventListener('click', addNewItem);
refs.inputAddItem.addEventListener('input', copyToLocalStorage);
