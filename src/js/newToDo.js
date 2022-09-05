import moment from 'moment';

const newItem = ({ id, text, isDone, date }) => {
  let newDate = moment(date).format('DD-MM-YYYY, HH:mm:ss');
  return `
  <li class="todo-item" data-id="${id}">    

    <span class="todo__text">

    <input class="todo__input" type="checkbox" name="todo-done"${
      isDone ? 'checked' : ''
    }/>
    <label>${text}</label>
    
    </span>

    <div class="todo-buttons">
        <p class="todo__data">Дата/час створення: ${newDate}</p>
        
        <img class="todo-open"
        src="images/eye.png"
        width="30"
        alt="open"
        title="Відкрити для перегляду"
        />
        
      <button class="button-delete">X</button>
    </div>
  </li>
  `;
};

export default newItem;
