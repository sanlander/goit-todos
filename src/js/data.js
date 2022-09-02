import axios from 'axios';

axios.defaults.baseURL = 'https://630b95ba83986f74a7b3a073.mockapi.io/api/v1';

export const item = axios.get('/items');

// const item = [
//   {
//     id: shortid.generate(),
//     text: 'Купить молоко',
//     isDone: true,
//     date: CURRENT_DATE,
//   },
//   {
//     id: shortid.generate(),
//     text: 'Купить води',
//     isDone: false,
//     date: CURRENT_DATE,
//   },
//   {
//     id: shortid.generate(),
//     text: 'Якщо нема води, купить вина',
//     isDone: true,
//     date: CURRENT_DATE,
//   },
//   {
//     id: shortid.generate(),
//     text: 'Винести мусор',
//     isDone: true,
//     date: CURRENT_DATE,
//   },
// ];

// export default item;
