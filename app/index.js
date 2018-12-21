// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

// Importing component templates
import appTemplate from 'app.ejs';
import contentsTemplate from 'contents.ejs';
import firstPageTemplate from 'first_page.ejs';
import loaderTemplate from 'loader.ejs'

// Import Gorilla Module
import Gorilla from '../Gorilla';

const app = new Gorilla.Component(appTemplate, {
  title: 'VAmazon',
  subTitle: 'The bookstore by Vanilla_Coding',
  searchboxPlaceholder: 'subject, author, publisher',
  contact: 'beautifulife.github.io',
}, {
  contents: new Gorilla.Component(firstPageTemplate),
});

const loader = new Gorilla.Component(loaderTemplate);

window.addEventListener('scroll', controlByScroll);

app.reloadClick = function(ev) {
  location.reload();
}

app.handleKeypress = function(ev) {
  if (ev.currentTarget.value && ev.code === 'Enter') {
    removeBeforeSearch();
    getDataFromApi(ev.currentTarget.value, 1);
    ev.currentTarget.value = null;
  }

  function removeBeforeSearch() {
    $bookData.length = 0;
  }
};

app.handleSearchClick = function(ev) {
  if (ev.currentTarget.previousElementSibling.value) {
    getDataFromApi(ev.currentTarget.previousElementSibling.value, 1);
  }
};

app.handleUpwardClick = function(ev) {
  ev.currentTarget.parentNode.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
};

app.getMoreClick = function(ev) {
  getDataFromApi($keywordStorage, $nowSearch);
};

Gorilla.renderToDOM(
  app,
  document.querySelector('#root'),
);

app.on('BEFORE_RENDER', () => {
  Gorilla.renderToDOM(
    loader,
    document.querySelector('#root'),
  );
});
app.on('AFTER_RENDER', () => {
  setTimeout(() => {
    if (loader._element) {
      loader.destroy();
    }
  }, 1000);
});

const $mainContent = document.getElementById('main_content');
const $getMoreButton = document.getElementById('get_more_button');
const $searchBox = document.getElementById('search_box');
const $bookData = [];
let $nowSearch = 1;
let $beforeScroll = 0;
let $count = 0;
let $componentStorage;
let $keywordStorage;

$getMoreButton.classList.add('hidden');

function controlByScroll(ev) {
  const toUpwardButton = document.getElementsByClassName('to_upward')[0];
  const header = document.getElementsByTagName('header')[0];
  const yOffset = ev.currentTarget.pageYOffset;

  if (yOffset !== 0) {
    toUpwardButton.classList.remove('hidden');
  } else {
    toUpwardButton.classList.add('hidden');
  }

  if (yOffset >= 300 && yOffset - $beforeScroll >= 0) {
    header.classList.add('scroll_bottom');
    $beforeScroll = yOffset;
  } else if (yOffset - $beforeScroll < 0) {
    header.classList.remove('scroll_bottom');
    $beforeScroll = yOffset;
  }
}

function getDataFromApi(inputText, startNum) {
  $searchBox.disabled = true;
  $nowSearch = startNum + 20;
  $keywordStorage = inputText;

  const keyWord = encodeURI(inputText);
  const httpRequest = new XMLHttpRequest();
  const url = `http://localhost:3000/v1/search/book?query=${keyWord}&start=${startNum}&display=20&sort=count`;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const bookMasterData = JSON.parse(httpRequest.response);

        for (let i = 0; i < bookMasterData.items.length; i++) {
          compressUrl(bookMasterData.items[i]);
        }
      } else {
        console.log(httpRequest.response);
      }
    }
  };

  httpRequest.open('GET', url);
  httpRequest.send();
}

function compressUrl(bookData) {
  const httpRequest = new XMLHttpRequest();
  const url = 'http://localhost:3000/v1/util/shorturl?url=' + bookData.link;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const responsedUrl = JSON.parse(httpRequest.response);

        bookData.link = responsedUrl.result.url;
        $bookData.push(cleansData(bookData));

        $count++;

        if ($count === 20) {
          makeComponent($bookData);
          $count = 0;
        }
      } else {
        console.log(httpRequest.response);
      }
    }
  };

  httpRequest.open('GET', url);
  httpRequest.send();
}

function cleansData(bookData) {
  const indexofBracket = bookData.title.indexOf('(');

  if (indexofBracket !== -1) {
    bookData.subTitle = bookData.title.substring(indexofBracket + 1, bookData.title.length - 1);
    bookData.title = bookData.title.substring(0, indexofBracket);
  }

  bookData.description = bookData.description.replace(/\s\s+/g, '');
  bookData.description = bookData.description.replace(/<(\/b|b)([^>]*)>/g, '');
  
  if (bookData.description.length >= 50) {
    bookData.description = bookData.description.substring(0, 50) + '...';
  }

  if (!bookData.discount) {
    bookData.discount = addComma(bookData.price);
    bookData.price = null;
  } else {
    bookData.price = addComma(bookData.price);
    bookData.discount = addComma(bookData.discount);
  }

  if (!bookData.image) {
    bookData.image = '/assets/images/replace_img.jpg';
  }

  return bookData;

  function addComma(priceString) {
    const priceArray = priceString.split('');
    let index = -3;

    while (priceArray.length + index > 0) {
      priceArray.splice(index, 0, ',');
      index -= 4;
    }

    return priceArray.join('');
  }
}

function makeComponent(bookData) {
  if (!$componentStorage) {
    $componentStorage = new Gorilla.Component(contentsTemplate, {
      keyword: $keywordStorage,
      contentData: bookData,
    });

    app._view.children.contents = $componentStorage;
    app.render();
  }

  $componentStorage.keyword = $keywordStorage;
  $componentStorage.contentData = bookData;

  if ($getMoreButton.classList.contains('hidden')) {
    $getMoreButton.classList.remove('hidden');
  }

  window.scroll({top: $beforeScroll});
  debugger;
  $searchBox.disabled = false;
}

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */