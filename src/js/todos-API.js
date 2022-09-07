import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';

export class TodoApi {
  constructor() {
    this.url = 'https://630b95ba83986f74a7b3a073.mockapi.io/api/v1/items';
    this.maxPages = null;
    this.totalItems = null;
    this.page = 1;
    this.limitPage = 5;
  }

  fetchApi() {
    return axios
      .get(
        `${this.url}?sortBy=date&order=desc&p=${this.page}&l=${this.limitPage}`
      )
      .then(r => r.data);
  }
  maxShowPages() {
    axios.get(this.url).then(r => {
      this.totalItems = r.data.length;
      this.maxPages = Math.ceil(r.data.length / this.limitPage);

      // Notify.success(`Знайдено ${this.totalItems} записів`, {
      //   width: '205px',
      //   cssAnimationStyle: 'zoom',
      // });
    });
  }
  getTodo(id) {
    return axios.get(`${this.url}/${id}`).then(r => r.data);

  }

  resetPage() {
    this.page = 1;
  }
  pageIncrement() {
    this.page += 1;
  }
  async addTodo(newTodo) {
    await axios.post(this.url, newTodo);
  }
  async deleteTodo(id) {
    await axios.delete(`${this.url}/${id}`);
  }
}
