import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '47544015-fe77dd5a8ac21fd8fe7b4d8d8';
const BASE_URL = 'https://pixabay.com/api/';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
const perPage = 40;

let lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', fetchImages);

function onSearch(event) {
  event.preventDefault();
  query = event.target.elements.searchQuery.value.trim();
  if (!query) {
    Notiflix.Notify.warning('Please enter a search query.');
    return;
  }

  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';
  fetchImages();
}

async function fetchImages() {
  try {
    const response = await fetch(`
      ${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(
      query
    )}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}
    `);
    const data = await response.json();

    if (data.totalHits === 0) {
      Notiflix.Notify.failure('Sorry, no images found. Please try again.');
      return;
    }

    renderGallery(data.hits);
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

    if (data.hits.length < perPage || data.hits.length === 0) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      loadMoreBtn.style.display = 'block';
    }

    page++;
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('An error occurred. Please try again.');
  }
}

function renderGallery(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <a href="${largeImageURL}">
          <div class="photo-card">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b>Likes:</b> ${likes}</p>
              <p class="info-item"><b>Views:</b> ${views}</p>
              <p class="info-item"><b>Comments:</b> ${comments}</p>
              <p class="info-item"><b>Downloads:</b> ${downloads}</p>
            </div>
          </div>
        </a>
      `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

loadMoreBtn.addEventListener('click', () => {
  fetchImages().then(smoothScroll);
});

const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting && query) {
      fetchImages();
    }
  },
  { rootMargin: '200px' }
);

observer.observe(document.querySelector('.load-more'));
