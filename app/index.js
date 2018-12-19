// Load application styles
import 'styles/index.less';

// ================================
// START YOUR APP HERE
// ================================

// Importing component templates
import appTemplate from 'app.ejs';
import babyTemplate from 'baby.ejs';
import grandBabyTemplate from 'grandBaby.ejs';

// Import Gorilla Module
import Gorilla from '../Gorilla';

const $header = document.getElementsByTagName('header')[0];
const $mainContent = document.getElementById('main_content');
const $inputBox = document.getElementById('search_box');
const $searchButton = document.getElementById('search_button');
const $getMoreButton = document.getElementById('get_more_button');
const $toUpwardButton = document.getElementById('to_upward');
let $nowSearch = [];
let $beforeScroll = 0;

$inputBox.addEventListener('keypress', getText);
$searchButton.addEventListener('click', startSearch);
$getMoreButton.addEventListener('click', getMoreData);
$toUpwardButton.addEventListener('click', moveToUpward);
document.addEventListener('scroll', controlByScroll);

function getText(ev) {
  if (ev.currentTarget.value && ev.code === 'Enter') {
    removeBeforeSearch();
    ev.currentTarget.disabled = true;
    $nowSearch = [ev.currentTarget.value, 21];
    getDataFromApi(ev.currentTarget.value, 1);
  }

  function removeBeforeSearch() {
    if ($mainContent.children[0].children.length) {
      const div = document.createElement('div');

      $mainContent.children[0].remove();
      div.id = 'root';
      $mainContent.appendChild(div);
    }
  }
}

function startSearch(ev) {
  if ($inputBox.value) {
    getDataFromApi($inputBox.value);
  }
}

function getMoreData(ev) {
  getDataFromApi($nowSearch[0], $nowSearch[1]);
  $nowSearch[1] += 20;
}

function moveToUpward(ev) {
  $mainContent.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
}

function controlByScroll(ev) {
  const bodyYOffset = window.pageYOffset;

  if (bodyYOffset !== 0) {
    $toUpwardButton.classList.remove('hidden');
  } else {
    $toUpwardButton.classList.add('hidden');
  }

  if (bodyYOffset >= 300 && bodyYOffset - $beforeScroll >= 0) {
    $header.classList.add('scroll_bottom');
    $beforeScroll = bodyYOffset;
  } else if (bodyYOffset - $beforeScroll < 0) {
    $header.classList.remove('scroll_bottom');
    $beforeScroll = bodyYOffset;
  }
}

function getDataFromApi(inputText, startNum) {
  const keyWord = encodeURI(inputText);
  const httpRequest = new XMLHttpRequest();
  const url = `http://localhost:3000/v1/search/book?query=${keyWord}&start=${startNum}&display=20&sort=count`;

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200) {
        const bookMasterData = JSON.parse(httpRequest.response);
        
        console.log(bookMasterData);
        
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
        console.log(bookData.link, 'this is short link');

        makeComponent(cleansData(bookData));
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
  const grandBaby = new Gorilla.Component(grandBabyTemplate, {
    sales: bookData.price,
    discount: bookData.discount,
  });

  grandBaby.hello = function () {
    console.log('hello');
  };

  const baby = new Gorilla.Component(babyTemplate, {
    name: bookData.author,
    publisher: bookData.publisher,
    date: bookData.pubdate,
    description: bookData.description,
    url: bookData.link,
  }, {
    grandBaby,
  });

  baby.whatAreYou = function () {
    console.log('what are you?');
  };

  const app = new Gorilla.Component(appTemplate, {
    image: bookData.image,
    title: bookData.title,
    subTitle: bookData.subTitle,
  }, {
    baby,
  });

  app.handleMouseover = function () {
    console.log('mouseover');
  };

  app.handleClick = function () {
    console.log('click');
  };

  app.on('BEFORE_RENDER', () => console.log('app before render'));
  app.on('AFTER_RENDER', () => console.log('app after render'));

  Gorilla.renderToDOM(
    app,
    document.querySelector('#main_content').firstElementChild,
  );

  $inputBox.disabled = false;
}

/* AJAX TEST~ */

// // Creating Gorilla Component Instance with some data
// const grandBaby = new Gorilla.Component(grandBabyTemplate, {
//   content: 'What!!!'
// });

// // Creating Component Instance Method (Frequently used as event handler in template)
// grandBaby.hello = function () {
//   console.log('hello');
// };

// // Creating Gorilla Component Instance with some data and child component
// const baby = new Gorilla.Component(babyTemplate, {
//   name: 'Baby..'
// }, {
//   grandBaby
// });

// baby.whatAreYou = function () {
//   console.log('what are you?');
// };

// const app = new Gorilla.Component(appTemplate, {
//   title: '바닐라코딩'
// }, {
//   baby
// });

// app.handleMouseover = function () {
//   console.log('mouseover');
// };

// app.handleClick = function () {
//   console.log('click');
// };

// // Listening to component life cycle
// app.on('BEFORE_RENDER', () => console.log('app before render'));
// app.on('AFTER_RENDER', () => console.log('app after render'));

// Updating component data model
// setTimeout(() => {
//   app.title = '빠닐라코띵';
//   baby.name = 'Qkqkqkqk';
//   grandBaby.content = 'GGGGG';
// }, 2000);

// Initializing the app into DOM
// Gorilla.renderToDOM(
//   app,
//   document.querySelector('#root')
// );

/* DO NOT REMOVE */
// module.hot.accept();
/* DO NOT REMOVE */