import { refs } from './refs';

export async function loadingOn() {
  refs.loading.classList.remove('visually-hidden');
}
export async function loadingOff() {
  refs.loading.classList.add('visually-hidden');
}

export async function loadMoreOff() {
  refs.loadMoreBtn.classList.add('visually-hidden');
}
export async function loadMoreOn() {
  refs.loadMoreBtn.classList.remove('visually-hidden');
}
