import moment from 'moment';
import { refs } from '../index';

export function currentTimeOnHomePage() {
  setInterval(() => {
    refs.clock.textContent = moment().format('DD-MM-YYYY, HH:mm:ss');
  }, 1000);
}
