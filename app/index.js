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

app.handleReloadClick = function(ev) {
  location.reload();
};

app.handleInputKeypress = function(ev) {
  if (ev.currentTarget.value && ev.code === 'Enter') {
    if (ev.currentTarget.value.length > 20) {
      ev.currentTarget.value = ev.currentTarget.value.substring(0,20);

      return alert('Up to 20 characters possible');
    }

    $bookData.resetData();
    getDataFromApi(ev.currentTarget.value, 1);
    ev.currentTarget.value = null;
  } else {
    if (ev.currentTarget.value.length >= 20) {
      ev.returnValue = false;
    }
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

const $loader = new Gorilla.Component(loaderTemplate);
const $inputBox = document.getElementsByClassName('gnb-input-box')[0];
const $bookData = new CreateBookData();
const $errorLog = [];
let $startNumber = 1;
let $beforeYOffset = 0;
let $displaySearchCount;
let $contentsComponent;
let $keyword;
let $viewType = 'list';
let $sortType = 'sim';
let $isDone = true;
let $totalSearchCount = 0;

window.addEventListener('scroll', controlByScroll);

function CreateBookData() {
  let _bookData = {};

  CreateBookData.prototype.getData = function() {
    return _bookData;
  };

  CreateBookData.prototype.storeData = function(key, value) {
    _bookData[key] = value;
  };

  CreateBookData.prototype.resetData = function() {
    _bookData = {};
  };
}

function controlByScroll(ev) {
  const toUpwardButton = document.getElementsByClassName('btn-upward')[0];
  const header = document.getElementsByTagName('header')[0];
  const yOffset = ev.currentTarget.pageYOffset;

  if (yOffset !== 0) {
    toUpwardButton.classList.remove('hidden');
  } else {
    toUpwardButton.classList.add('hidden');
  }

  if (yOffset >= 300 && yOffset - $beforeYOffset >= 0) {
    header.classList.add('scroll_bottom');
    $beforeYOffset = yOffset;
  } else if (yOffset - $beforeYOffset < 0) {
    header.classList.remove('scroll_bottom');
    $beforeYOffset = yOffset;
  }

  if ((yOffset + 500) / document.body.offsetHeight >= 0.85 && $isDone) {
    getDataFromApi($keyword, $startNumber, $sortType);
  }
}

function getDataFromApi(inputText, startNumber, option) {
  const sortOption = option || 'sim';
  const keyword = encodeURI(inputText);
  const httpRequest = new XMLHttpRequest();
  const url = `http://localhost:3000/v1/search/book?query=${keyword}&start=${startNumber}&display=20&sort=${sortOption}`;

  $isDone = false;
  $inputBox.disabled = true;
  $keyword = inputText;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const respondedBookData = JSON.parse(httpRequest.response);

        if (respondedBookData.items.length) {
          $totalSearchCount = respondedBookData.total;
          $displaySearchCount = respondedBookData.display;

          for (let i = 0; i < respondedBookData.items.length; i++) {
            compressUrl(respondedBookData.items[i], i, $startNumber);
          }

          $startNumber = startNumber + respondedBookData.display;
        } else {
          if (!Object.keys($bookData.getData()).length) {
            $totalSearchCount = 0;
            createComponent([]);
          } else {
            $loader.destroy();
          }
        }
      } else {
        $inputBox.disabled = false;
        $loader.destroy();
        $errorLog.push({[keyword]: httpRequest.status});

        return alert('Please try again later.');
      }
    }
  };

  httpRequest.open('GET', url);
  httpRequest.send();

  Gorilla.renderToDOM(
    $loader,
    document.querySelector('#root'),
  );
}

function compressUrl(bookData, iterationIndex, startIndex) {
  const httpRequest = new XMLHttpRequest();
  const url = 'http://localhost:3000/v1/util/shorturl?url=' + bookData.link;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const respondedUrl = JSON.parse(httpRequest.response);

        bookData.link = respondedUrl.result.url;
        $bookData.storeData([startIndex + iterationIndex - 1], cleansData(bookData));

        $displaySearchCount--;

        if ($displaySearchCount === 0) {
          createComponent($bookData.getData());
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
  const indexOfBracket = bookData.title.indexOf('(');

  if (indexOfBracket !== -1) {
    bookData.subTitle = bookData.title.substring(indexOfBracket + 1, bookData.title.length - 1);
    bookData.title = bookData.title.substring(0, indexOfBracket);
  }

  bookData.description = bookData.description.replace(/\s\s+/gm, ' ');
  bookData.description = bookData.description.replace(/<b>|<\/b>/gm, '');
  bookData.description = bookData.description.replace(/^\&\w*;|\w*;/gm, '');

  if (bookData.description.length >= 50) {
    bookData.description = bookData.description.substring(0, 35) + '<span>' + bookData.description.substring(35, 50) + '</span>';
  }

  if (!bookData.discount) {
    bookData.discount = addComma(bookData.price);
    bookData.price = null;
  } else {
    bookData.discount = addComma(bookData.discount);
    bookData.price = addComma(bookData.price);
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

function createComponent(bookData) {
  if (!$contentsComponent) {
    $contentsComponent = new Gorilla.Component(contentsTemplate, {
      viewType: $viewType,
      sortType: $sortType,
      keyword: $keyword,
      totalCount: $totalSearchCount,
      contentsData: Object.values(bookData),
    });

    $contentsComponent.selectView = function(ev) {
      const viewType = ev.target.dataset.view;

      if (viewType !== $viewType) {
        $viewType = viewType;
        $contentsComponent = null;
        createComponent($bookData.getData());
      }
    };

    $contentsComponent.selectSort = function(ev) {
      const sortType = ev.target.dataset.sort;

      if (sortType !== $sortType) {
        $sortType = sortType;
        $contentsComponent = null;
        $bookData.resetData();
        $startNumber = 1;
        getDataFromApi($keyword, 1, sortType);
      }
    };

    $contentsComponent.hoverImageIn = function(ev) {
      ev.currentTarget.nextElementSibling.classList.remove('hidden');
    };

    $contentsComponent.hoverImageOut = function(ev) {
      ev.currentTarget.classList.add('hidden');
    };

    app._view.children.contents = $contentsComponent;
    app.render();
  } else {
    $contentsComponent.totalCount = $totalSearchCount;
    $contentsComponent.keyword = $keyword;
    $contentsComponent.contentsData = Object.values(bookData);
  }

  window.scroll({top: $beforeYOffset});
  $inputBox.disabled = false;
  $isDone = true;

  if ($loader._element) {
    $loader.destroy();
  }
}

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */