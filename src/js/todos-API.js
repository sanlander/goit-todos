import axios from 'axios';

export class TodoApi {
  constructor() {
    this.url = 'https://630b95ba83986f74a7b3a073.mockapi.io/api/v1/items';
    this.maxPages = null;
    this.totalItems = null;
    this.page = 1;
    this.limitPage = 5;
    this.sort = 'date&order=desc';
    this.searchFiltervalue = '';
  }

  async fetchApi() {
    return await axios
      .get(
        `${this.url}?sortBy=${this.sort}&text=${this.searchFiltervalue}&p=${this.page}&l=${this.limitPage}`
      )
      .then(r => r.data);
  }

  async getTotalItems() {
    await axios.get(this.url).then(r => {
      this.totalItems = r.data.length;
    });
  }

  async maxShowPages() {
    await axios.get(this.url).then(r => {
      this.maxPages = Math.ceil(r.data.length / this.limitPage);
    });
  }

  async getTodo(id) {
    return await axios.get(`${this.url}/${id}`).then(r => r.data);
  }
  async updateTodo(id) {
    const updateTodo = await this.getTodo(id).then(r => {
      return { isDone: !r.isDone };
    });

    await axios.put(`${this.url}/${id}`, updateTodo);
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
