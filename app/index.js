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

Gorilla.renderToDOM(
  app,
  document.querySelector('#root'),
);

app.on('BEFORE_RENDER', () => {
});
app.on('AFTER_RENDER', () => {
});

const $inputBox = document.getElementsByClassName('gnb-input-box')[0];
const $bookData = [];
let $nowSearch = 1;
let $beforeScroll = 0;
let $count = 0;
let $componentStorage;
let $keywordStorage;
let $viewType = 'list';
let $isDone = true;

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

  if ((yOffset + 500) / document.body.offsetHeight >= 0.8 && $isDone) {
    getDataFromApi($keywordStorage, $nowSearch);
  }
}

function getDataFromApi(inputText, startNum) {
  const keyWord = encodeURI(inputText);
  const httpRequest = new XMLHttpRequest();
  const url = `http://localhost:3000/v1/search/book?query=${keyWord}&start=${startNum}&display=20&sort=count`;

  Gorilla.renderToDOM(
    loader,
    document.querySelector('#root'),
  );

  $isDone = false;
  $inputBox.disabled = true;
  $nowSearch = startNum + 20;
  $keywordStorage = inputText;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const bookMasterData = JSON.parse(httpRequest.response);

        if (bookMasterData.items.length) {
          for (let i = 0; i < bookMasterData.items.length; i++) {
            compressUrl(bookMasterData.items[i]);
          }
        } else {
          makeComponent([]);
          $bookData.length = 0;
        }
      } else {
        $inputBox.disabled = false;
        loader.destroy();
        console.log('정보를 가져올 수 없습니다.');
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

  bookData.description = bookData.description.replace(/\s\s+/g, ' ');
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
      viewType: $viewType,
      keyword: $keywordStorage,
      contentData: bookData,
    });

    $componentStorage.selectView = function(ev) {
      let viewType;

      if (ev.currentTarget.classList.contains('btn-list-view')) {
        viewType = 'list';
      } else {
        viewType = 'card';
      }

      if (viewType !== $viewType) {
        $viewType = viewType;
        $componentStorage = null;
        makeComponent($bookData);
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
    $componentStorage.keyword = $keywordStorage;
    $componentStorage.contentData = bookData;
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