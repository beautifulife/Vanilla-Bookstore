// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

// Importing component templates
import appTemplate from 'app.ejs';
import contentsTemplate from 'contents.ejs';
import contentContainerTemplate from 'contentContainer.ejs';

// Import Gorilla Module
import Gorilla from '../Gorilla';

let $nowSearch = 1;
let $beforeScroll = 0;
let $count = 0;
const $bookData = [];

const app = new Gorilla.Component(appTemplate, {
  title: 'VAmazon',
  subTitle: 'The bookstore by Vanilla_Coding',
  searchboxPlaceholder: 'subject, author, publisher',
  contact: 'beautifulife.github.io',
}, {
  contents: new Gorilla.Component(contentContainerTemplate),
});

window.addEventListener('scroll', controlByScroll);

app.reloadClick = function (ev) {
  location.reload();
}

app.handleKeypress = function (ev) {
  if (ev.currentTarget.value && ev.code === 'Enter') {
    // removeBeforeSearch();
    ev.currentTarget.disabled = true;
    getDataFromApi(ev.currentTarget.value, 1);
    $nowSearch = 21;
  }

  // function removeBeforeSearch() {
  //   if ($mainContent.children[0].children.length) {
  //     const div = document.createElement('div');

  //     $mainContent.children[0].remove();
  //     div.id = 'root';
  //     $mainContent.appendChild(div);
  //   }
  // }
};

app.handleSearchClick = function (ev) {
  if (ev.currentTarget.previousElementSibling.value) {
    getDataFromApi(ev.currentTarget.previousElementSibling.value, $nowSearch);
    $nowSearch += 20;
  }
};

app.handleUpwardClick = function (ev) {
  ev.currentTarget.parentNode.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
};

// Listening to component life cycle
app.on('BEFORE_RENDER', () => console.log('app before render'));
app.on('AFTER_RENDER', () => console.log('app after render'));

//   contentContainer.on('BEFORE_RENDER', () => console.log('cont2 before render'));
//   contentContainer.on('AFTER_RENDER', () => console.log('cont2 after render'));
//   contents._view.children.contentContainer2 = contentContainer2;
//   contents.render();

// Initializing the app into DOM
Gorilla.renderToDOM(
  app,
  document.querySelector('#root'),
);

const $header = document.getElementsByTagName('header')[0];
const $toUpwardButton = document.getElementById('to_upward');

function controlByScroll(ev) {
  const yOffset = ev.currentTarget.pageYOffset;

  if (yOffset !== 0) {
    $toUpwardButton.classList.remove('hidden');
  } else {
    $toUpwardButton.classList.add('hidden');
  }

  if (yOffset >= 300 && yOffset - $beforeScroll >= 0) {
    $header.classList.add('scroll_bottom');
    $beforeScroll = yOffset;
  } else if (yOffset - $beforeScroll < 0) {
    $header.classList.remove('scroll_bottom');
    $beforeScroll = yOffset;
  }
}

//

function getDataFromApi(inputText, startNum) {
  const keyWord = encodeURI(inputText);
  const httpRequest = new XMLHttpRequest();
  const url = `http://localhost:3000/v1/search/book?query=${keyWord}&start=${startNum}&display=20&sort=count`;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const bookMasterData = JSON.parse(httpRequest.response);

        for (let i = 0; i < bookMasterData.items.length; i++) {
          console.log('now i send data');
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

  if (bookData.description.length >= 50) {
    bookData.description = bookData.description.substring(0, 50);
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
  const contents = new Gorilla.Component(contentsTemplate, {
    name: 'Baby.',
    contentContainer: bookData,
  });

  app._view.children.contents = contents;

  app.render();
}

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */