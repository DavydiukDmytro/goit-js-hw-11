import 'normalize.css';
import { getPhotos } from './js/getPhotos';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import throttle from 'lodash.throttle';

const KEY = '34428606-d91e465e278c258cee6249ca4';
const URL = 'https://pixabay.com/api/';

// Налаштування запиту нал
const option = {
    key: KEY,
    q: '',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: 40,
    page: 1,
};

// Посилання на елементи
const refs = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    btnLoadMore: document.querySelector('.load-more'),
}

// Сторення екземпляру SimpleLightbox
let gallery = new SimpleLightbox('.gallery a');



refs.form.addEventListener('submit', search);
refs.btnLoadMore.addEventListener('click', clickNextPage);
window.addEventListener('scroll', throttle(scrollBottom, 500));
function scrollBottom() {
  if ((window.innerHeight + window.pageYOffset + 2) >= document.documentElement.scrollHeight) {
      searchImages(URL, option, true, true);
  }
}
function search(e) {
    e.preventDefault();

    refs.gallery.innerHTML = "";
    option.page = 1;
    const { elements: { searchQuery } } = e.currentTarget;
    option.q = searchQuery.value;

    searchImages(URL, option);
}

function clickNextPage() {
    searchImages(URL, option, true);
}

async function searchImages(url, params, scrollFlag = false, windowScrollFlag = false) {
    try {
        const photos = await getPhotos(url, params);

        if (photos.totalHits === 0) {
            Notify.warning('Sorry, there are no images matching your search query. Please try again.');
            refs.btnLoadMore.disabled = true;
            refs.btnLoadMore.classList.add("visually-hidden");
            return;
        }
        if (windowScrollFlag && photos.totalHits < (option.per_page * option.page)) {
            return;
        }

        createMarkupCardPhoto(photos.hits);

        if (scrollFlag) {
            scroll();
        }
        
        if (option.page === 1) {
            Notify.info(`Hooray! We found ${photos.totalHits} images.`);
        }
        
        if (photos.totalHits > (option.per_page * option.page)) {
            refs.btnLoadMore.disabled = false;
            refs.btnLoadMore.classList.remove("visually-hidden");
        } else {
            refs.btnLoadMore.disabled = true;
            refs.btnLoadMore.classList.add("visually-hidden");
            Notify.info('We\'re sorry, but you\'ve reached the end of search results.');
        }
        option.page++;

        gallery.refresh();
    } catch (error) {
        console.log(error.message);
    }
}

function createMarkupCardPhoto(dataPhotos) {
    refs.gallery.insertAdjacentHTML("beforeend", dataPhotos.map(dataPhoto =>
        `
    <a onclick="event.preventDefault()" href="${dataPhoto.largeImageURL}">
    <div class="photo-card">
        <img style="height: 293px" src="${dataPhoto.webformatURL}" alt="${dataPhoto.tags}" loading="lazy" />
        <div class="info">
            <p class="info-item">
                <b>Likes</b>
                ${dataPhoto.likes}
            </p>
            <p class="info-item">
                <b>Views</b>
                ${dataPhoto.views}
            </p>
            <p class="info-item">
                <b>Comments</b>
                ${dataPhoto.comments}
            </p>
            <p class="info-item">
                <b>Downloads</b>
                ${dataPhoto.downloads}
            </p>
        </div>
    </div>
    </a>
    `).join(""));
};

function scroll() {
    const { height: cardHeight } = document
    .querySelector(".gallery").firstElementChild.getBoundingClientRect();
    
    window.scrollBy({
        top: cardHeight * 1.7,
        behavior: "smooth",
    });
}

