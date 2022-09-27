import Pagination from 'tui-pagination';
// import 'tui-pagination/dist/tui-pagination.css';
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
import { renderWeather } from './js/weather-API';
import { newItem } from './js/newToDo';
import * as VH from './js/visually-hidden';
import './js/scrollUpBtn';
import './js/weather-API';

const todoApi = new TodoApi();

currentTimeOnHomePage();

renderTodos();
renderWeather();

async function renderTodos(value) {
  refs.inputPageLimitDefault.textContent = `${todoApi.DEFAULT_LIMIT_PAGE} записів на сторінці`;
  Loading.pulse('Loading...');
  VH.loadingHomeOn();
  await todoApi.resetPage(value);
  // await todoApi.maxShowPages();
  await todoApi.getTotalItems();

  await todoApi.fetchApi().then(r => {
    const itemsList = r.map(newItem).join('');

    refs.todoList.innerHTML = itemsList;

    Loading.remove();
    VH.loadingHomeOff();
    VH.loadMoreOn();

    todoApi.pageIncrement();

    // insertTotalItems();
    addPagination(value);
  });
  await insertTotalItems();
}

async function insertTotalItems() {
  refs.totalItems.innerHTML = `Знайдено записів: ${todoApi.totalItems}`;
}

// Кнопки "Пагінації"
let paginationBtnLocal = [];
async function addPagination(currentPage) {
  var pagination = await new Pagination('tui-pagination-container', {
    totalItems: todoApi.totalItems,
    itemsPerPage: todoApi.limitPage,
    visiblePages: 5,
    page: currentPage || 1,
  });
  const paginationBtn = document.querySelectorAll('.tui-page-btn');
  paginationBtnLocal = Array.from(paginationBtn);

  for (let buttonItem of paginationBtn) {
    buttonItem.addEventListener('click', onPaginationBtnClick);
  }
}

async function onPaginationBtnClick(e) {
  if (e.currentTarget.nodeName !== 'A') return;

  const button = e.currentTarget.classList;

  if (button.contains('tui-next')) {
    const currentPage = todoApi.page;
    await renderTodos(currentPage);
    if (currentPage >= todoApi.maxPages) {
      VH.loadMoreOff();
    }
    return;
  }
  if (button.contains('tui-prev')) {
    const currentPage = todoApi.page - 2;
    renderTodos(currentPage);
    return;
  }
  if (button.contains('tui-last')) {
    const currentPage = todoApi.maxPages;
    await renderTodos(currentPage);
    await VH.loadMoreOff();
    return;
  }
  if (button.contains('tui-first')) {
    renderTodos();
    return;
  }
  if (button.contains('tui-next-is-ellip')) {
    const indxNextBtn = paginationBtnLocal.indexOf(e.currentTarget);
    const indxCurrentPage = paginationBtnLocal.findIndex(x =>
      x.classList.contains('tui-is-selected')
    );
    const currentPage = todoApi.page - 1;
    const newPage = indxNextBtn - indxCurrentPage + currentPage;
    await renderTodos(newPage);
    if (newPage >= todoApi.maxPages) {
      await VH.loadMoreOff();
    }
    return;
  }
  if (button.contains('tui-prev-is-ellip')) {
    const indxPrevBtn = paginationBtnLocal.indexOf(e.currentTarget);
    const indxCurrentPage = paginationBtnLocal.findIndex(x =>
      x.classList.contains('tui-is-selected')
    );
    const currentPage = todoApi.page - 1;
    const newPage = currentPage - (indxCurrentPage - indxPrevBtn);
    renderTodos(newPage);
    return;
  }

  if (button.contains('tui-page-btn')) {
    const currentPage = Number(e.currentTarget.textContent);
    await renderTodos(currentPage);
    if (currentPage >= todoApi.maxPages) {
      VH.loadMoreOff();
    }
  }
}

// Кнопка "Показати ще"
async function onClickBtnLoadMore() {
  Loading.pulse('Loading...');
  VH.loadingHomeOn();
  VH.loadMoreOff();

  await todoApi.fetchApi().then(r => {
    addPagination(todoApi.page);
    if (todoApi.page >= todoApi.maxPages) {
      Notify.info('Відображено всі записи!', { width: '205px' });
      Loading.remove();
      VH.loadingHomeOff();
      VH.loadMoreOff();
      const itemsList = r.map(newItem).join('');

      refs.todoList.insertAdjacentHTML('beforeend', itemsList);
      addPagination(todoApi.maxPages);
      return;
    }

    const itemsList = r.map(newItem).join('');

    refs.todoList.insertAdjacentHTML('beforeend', itemsList);
    Loading.remove();
    VH.loadingHomeOff();
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

  await renderTodos();
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
      renderTodos();
    },
    () => {
      return;
    },
    {}
  );
}

const onSortListToDo = () => {
  // refs.inputSearch.value = '';
  // todoApi.searchFiltervalue = '';

  switch (refs.inputSort.value) {
    case 'value-none':
      return;
    case 'az':
      todoApi.sort = 'text&order=asc';
      renderTodos();
      return;
    case 'za':
      todoApi.sort = 'text&order=desc';
      renderTodos();
      return;
    case 'dateDown':
      todoApi.sort = 'date&order=asc';
      renderTodos();
      return;

    default:
      todoApi.sort = 'date&order=desc';
      renderTodos();
  }
};

const onSearchFilter = async () => {
  todoApi.searchFiltervalue = await refs.inputSearch.value.toLowerCase();
  await renderTodos();
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
      renderTodos();
      break;
    case 'page-20':
      todoApi.limitPage = 20;
      renderTodos();
      break;
    case 'page-50':
      todoApi.limitPage = 50;
      renderTodos();
      break;

    default:
      todoApi.limitPage = todoApi.DEFAULT_LIMIT_PAGE;
      renderTodos();
      break;
  }
}

function scrollOnBtnLoadMore() {
  refs.loadMoreBtn.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

// -------- EventListeners --------
refs.inputSearch.addEventListener('input', debounce(onSearchFilter, 500));
refs.inputSort.addEventListener('change', onSortListToDo);
refs.todoList.addEventListener('click', clickDeleteToDoList);
refs.todoList.addEventListener('click', onOffChecked);
refs.todoList.addEventListener('click', onShowModal);
refs.btnAdd.addEventListener('click', addNewItem);
refs.inputAddItem.addEventListener('input', copyToLocalStorage);
refs.loadMoreBtn.addEventListener('click', onClickBtnLoadMore);
refs.inputPageLimit.addEventListener('change', onClickInputPageLimit);
