import { refs } from './refs';

window.onscroll = function () {
  userScroll();
};

function userScroll() {
  if (document.body.scrollTop > 500) {
    refs.pageUpBtn.classList.remove('visually-hidden');
  } else {
    refs.pageUpBtn.classList.add('visually-hidden');
  }
}

function onPageUp() {
  refs.body.scrollIntoView({ behavior: 'smooth' });
}

// -------- EventListeners --------
refs.pageUpBtn.addEventListener('click', onPageUp);
