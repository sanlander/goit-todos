import { refs } from './refs';

export async function loadingHomeOn() {
  refs.loadingHome.classList.remove('visually-hidden');
}
export async function loadingHomeOff() {
  refs.loadingHome.classList.add('visually-hidden');
}

export async function loadMoreOff() {
  refs.loadMoreBtn.classList.add('visually-hidden');
}
export async function loadMoreOn() {
  refs.loadMoreBtn.classList.remove('visually-hidden');
}