// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

// Importing component templates
import appTemplate from 'app.ejs';
import contentsTemplate from 'contents.ejs';
import firstPageTemplate from 'first_page.ejs';
import loaderTemplate from 'loader.ejs';

// Import Gorilla Module
import Gorilla from '../Gorilla';

const app = new Gorilla.Component(appTemplate, {
  title: 'VAmazon',
  subTitle: 'The bookstore by Vanilla_Coding',
  inputBoxPlaceholder: 'subject, author, publisher',
  contact: 'beautifulife.github.io',
}, {
  contents: new Gorilla.Component(firstPageTemplate),
});

const loader = new Gorilla.Component(loaderTemplate);

window.addEventListener('scroll', controlByScroll);

app.handleReloadClick = function(ev) {
  location.reload();
};

app.handleInputKeypress = function(ev) {
  if (ev.currentTarget.value && ev.code === 'Enter') {
    if (ev.currentTarget.value.length > 20) {
      ev.currentTarget.value = ev.currentTarget.value.substring(0,20);

      return alert('Up to 20 characters possible');
    }

    removeBeforeSearch();
    getDataFromApi(ev.currentTarget.value, 1);
    ev.currentTarget.value = null;
  } else {
    if (ev.currentTarget.value.length >= 20) {
      ev.returnValue = false;
    }
  }

  function removeBeforeSearch() {
    $bookData = {};
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

Gorilla.renderToDOM(
  app,
  document.querySelector('#root'),
);

const $inputBox = document.getElementsByClassName('gnb-input-box')[0];
let $bookData = {};
let $nowSearch = 1;
let $beforeScroll = 0;
let $displaySearchCount = 0;
let $componentStorage;
let $keywordStorage;
let $viewType = 'list';
let $sortType = 'sim';
let $isDone = true;
let $totalSearchCount = 0;
const $errorLog = [];

const $bookDataStorage = (function() {
  let _bookData = {};
  const method = {};

  method.getData = function() {
    return _bookData;
  };

  method.storeData = function(key, value) {
    _bookData[key] = value;
  };

  method.resetData = function() {
    _bookData = {};
  };

  return method;
}());

function controlByScroll(ev) {
  const toUpwardButton = document.getElementsByClassName('btn-upward')[0];
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

  if ((yOffset + 500) / document.body.offsetHeight >= 0.85 && $isDone) {
    getDataFromApi($keywordStorage, $nowSearch, $sortType);
  }
}

function getDataFromApi(inputText, startNum, option) {
  const sortOption = option || 'sim';
  const keyword = encodeURI(inputText);
  const httpRequest = new XMLHttpRequest();
  const url = `http://localhost:3000/v1/search/book?query=${keyword}&start=${startNum}&display=20&sort=${sortOption}`;

  $isDone = false;
  $inputBox.disabled = true;
  $keywordStorage = inputText;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const bookMasterData = JSON.parse(httpRequest.response);

        if (bookMasterData.items.length) {
          $totalSearchCount = bookMasterData.total;
          $displaySearchCount = bookMasterData.display;

          for (let i = 0; i < bookMasterData.items.length; i++) {
            compressUrl(bookMasterData.items[i], i, $nowSearch);
          }

          $nowSearch = startNum + bookMasterData.display;
        } else if (!Object.keys($bookData).length) {
          $bookData = {};
          $totalSearchCount = 0;
          makeComponent([]);
        } else {
          loader.destroy();
        }
      } else {
        $inputBox.disabled = false;
        loader.destroy();
        $errorLog.push({[keyword]: httpRequest.status});

        return alert('Please try again later.');
      }
    }
  };

  httpRequest.open('GET', url);
  httpRequest.send();

  Gorilla.renderToDOM(
    loader,
    document.querySelector('#root'),
  );
}

function compressUrl(bookData, iterationIndex, startIndex) {
  const httpRequest = new XMLHttpRequest();
  const url = 'http://localhost:3000/v1/util/shorturl?url=' + bookData.link;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const responsedUrl = JSON.parse(httpRequest.response);

        bookData.link = responsedUrl.result.url;
        $bookData[startIndex + iterationIndex - 1] = cleansData(bookData);

        $displaySearchCount--;

        if ($displaySearchCount === 0) {
          makeComponent($bookData);
        }
      } else {
        $errorLog.push({[bookData]: httpRequest.status});
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

  bookData.description = bookData.description.replace(/\s\s+/g, ' ');
  bookData.description = bookData.description.replace(/<(\/b|b)([^>]*)>/g, '');
  bookData.description = bookData.description.replace(/^\&\w*;|\w*;/g, '');

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
      viewType: $viewType,
      sortType: $sortType,
      keyword: $keywordStorage,
      totalCount: $totalSearchCount,
      contentData: Object.values(bookData),
    });

    $componentStorage.selectView = function(ev) {
      const viewType = ev.target.dataset.view;

      if (viewType !== $viewType) {
        $viewType = viewType;
        $componentStorage = null;
        makeComponent($bookData);
      }
    };

    $componentStorage.selectSort = function(ev) {
      const sortType = ev.target.dataset.sort;

      if (sortType !== $sortType) {
        $sortType = sortType;
        $componentStorage = null;
        $bookData = {};
        getDataFromApi($keywordStorage, 1, sortType);
      }
    };

    $componentStorage.hoverImageIn = function(ev) {
      ev.currentTarget.nextElementSibling.classList.remove('hidden');
    };

    $componentStorage.hoverImageOut = function(ev) {
      ev.currentTarget.classList.add('hidden');
    };

    app._view.children.contents = $componentStorage;
    app.render();
  } else {
    $componentStorage.totalCount = $totalSearchCount;
    $componentStorage.keyword = $keywordStorage;
    $componentStorage.contentData = Object.values(bookData);
  }

  window.scroll({top: $beforeScroll});
  $inputBox.disabled = false;
  $isDone = true;

  if (loader._element) {
    loader.destroy();
  }
}

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */