import { refs } from './refs';

export function loadingOn() {
  refs.loading.classList.remove('visually-hidden');
}
export function loadingOff() {
  refs.loading.classList.add('visually-hidden');
}

export function loadMoreOff() {
  refs.loadMoreBtn.classList.add('visually-hidden');
}
export function loadMoreOn() {
  refs.loadMoreBtn.classList.remove('visually-hidden');
}
