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

app.handleInputKeypress = function(ev) {
  if (ev.currentTarget.value && ev.code === 'Enter') {
    if (ev.currentTarget.value.length > 20) {
      ev.currentTarget.value = ev.currentTarget.value.substring(0,20);

      return alert('Up to 20 characters possible');
    }

    vanillaBookStore.bookData.resetData();
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

const $inputBox = document.getElementsByClassName('gnb-input-box')[0];
const vanillaBookStore = {
  loader: new Gorilla.Component(loaderTemplate),
  bookData: BookData(),
  errorLog: [],
  startNumber: 1,
  beforeYOffset: 0,
  displaySearchCount: 0,
  contentsComponent: undefined,
  keyword: '',
  viewType: 'list',
  sortType: 'sim',
  isDone: true,
  totalSearchCount: 0,
};

window.addEventListener('scroll', controlByScroll);

function BookData() {
  let _bookData = {};
  const methods = {};

  methods.getData = function() {
    return _bookData;
  };

  methods.storeData = function(key, value) {
    _bookData[key] = value;
  };

  methods.resetData = function() {
    _bookData = {};
  };

  return methods;
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

  if (yOffset >= 300 && yOffset - vanillaBookStore.beforeYOffset >= 0) {
    header.classList.add('scroll_bottom');
    vanillaBookStore.beforeYOffset = yOffset;
  } else if (yOffset - vanillaBookStore.beforeYOffset < 0) {
    header.classList.remove('scroll_bottom');
    vanillaBookStore.beforeYOffset = yOffset;
  }

  if ((yOffset + 500) / document.body.offsetHeight >= 0.85 && vanillaBookStore.isDone) {
    getDataFromApi(vanillaBookStore.keyword, vanillaBookStore.startNumber, vanillaBookStore.sortType);
  }
}

function getDataFromApi(inputText, startNumber, option) {
  const sortOption = option || 'sim';
  const keyword = encodeURI(inputText);
  const httpRequest = new XMLHttpRequest();
  const url = `http://localhost:3000/v1/search/book?query=${keyword}&start=${startNumber}&display=20&sort=${sortOption}`;

  vanillaBookStore.isDone = false;
  $inputBox.disabled = true;
  vanillaBookStore.keyword = inputText;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const respondedBookData = JSON.parse(httpRequest.response);

        if (respondedBookData.items.length) {
          vanillaBookStore.totalSearchCount = respondedBookData.total;
          vanillaBookStore.displaySearchCount = respondedBookData.display;

          for (let i = 0; i < respondedBookData.items.length; i++) {
            compressUrl(respondedBookData.items[i], i, vanillaBookStore.startNumber);
          }

          vanillaBookStore.startNumber = startNumber + respondedBookData.display;
        } else {
          if (!Object.keys(vanillaBookStore.bookData.getData()).length) {
            vanillaBookStore.totalSearchCount = 0;
            createComponent([]);
          } else {
            vanillaBookStore.loader.destroy();
          }
        }
      } else {
        $inputBox.disabled = false;
        vanillaBookStore.loader.destroy();
        vanillaBookStore.errorLog.push({[keyword]: httpRequest.status});

        alert('Please try again later.');
      }
    }
  };

  httpRequest.open('GET', url);
  httpRequest.send();

  Gorilla.renderToDOM(
    vanillaBookStore.loader,
    document.querySelector('#root'),
  );
}

function compressUrl(bookData, iterationIndex, startIndex) {
  const httpRequest = new XMLHttpRequest();
  const url = `http://localhost:3000/v1/util/shorturl?url=${bookData.link}`;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const respondedUrl = JSON.parse(httpRequest.response);

        bookData.link = respondedUrl.result.url;
        vanillaBookStore.bookData.storeData([startIndex + iterationIndex - 1], cleansData(bookData));

        vanillaBookStore.displaySearchCount--;

        if (vanillaBookStore.displaySearchCount === 0) {
          createComponent(vanillaBookStore.bookData.getData());
        }
      } else {
        vanillaBookStore.errorLog.push({[bookData]: httpRequest.status});
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
  if (!vanillaBookStore.contentsComponent) {
    vanillaBookStore.contentsComponent = new Gorilla.Component(contentsTemplate, {
      viewType: vanillaBookStore.viewType,
      sortType: vanillaBookStore.sortType,
      keyword: vanillaBookStore.keyword,
      totalCount: vanillaBookStore.totalSearchCount,
      contentsData: Object.values(bookData),
    });

    vanillaBookStore.contentsComponent.selectView = function(ev) {
      const viewType = ev.target.dataset.view;

      if (viewType !== vanillaBookStore.viewType) {
        vanillaBookStore.viewType = viewType;
        vanillaBookStore.contentsComponent = null;
        createComponent(vanillaBookStore.bookData.getData());
      }
    };

    vanillaBookStore.contentsComponent.selectSort = function(ev) {
      const sortType = ev.target.dataset.sort;

      if (sortType !== vanillaBookStore.sortType) {
        vanillaBookStore.sortType = sortType;
        vanillaBookStore.contentsComponent = null;
        vanillaBookStore.bookData.resetData();
        vanillaBookStore.startNumber = 1;
        getDataFromApi(vanillaBookStore.keyword, 1, sortType);
      }
    };

    vanillaBookStore.contentsComponent.hoverImageIn = function(ev) {
      ev.currentTarget.nextElementSibling.classList.remove('hidden');
    };

    vanillaBookStore.contentsComponent.hoverImageOut = function(ev) {
      ev.currentTarget.classList.add('hidden');
    };

    app._view.children.contents = vanillaBookStore.contentsComponent;
    app.render();
  } else {
    vanillaBookStore.contentsComponent.totalCount = vanillaBookStore.totalSearchCount;
    vanillaBookStore.contentsComponent.keyword = vanillaBookStore.keyword;
    vanillaBookStore.contentsComponent.contentsData = Object.values(bookData);
  }

  window.scroll({top: vanillaBookStore.beforeYOffset});
  $inputBox.disabled = false;
  vanillaBookStore.isDone = true;

  if (vanillaBookStore.loader._element) {
    vanillaBookStore.loader.destroy();
  }
}

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */
