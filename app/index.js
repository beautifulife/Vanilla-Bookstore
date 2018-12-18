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

/* AJAX TEST~ */

const getApiButton = document.getElementById('test');
let keyWord = encodeURI('자바스크립트');

getApiButton.addEventListener('click', getDataFromApi);

function getDataFromApi() {
  console.log('pick me up!');

  const httpRequest = new XMLHttpRequest();
  const url = 'http://localhost:3000/v1/search/book?query=' + keyWord + '&display=2&sort=count';

  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === httpRequest.DONE) {
      if (httpRequest.status === 200 || httpRequest.status === 201) {
        const bookMasterData = JSON.parse(httpRequest.response);
        
        console.log(bookMasterData);
        
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
      if (httpRequest.status === 200 || httpRequest.status === 201) {
        const responsedUrl = JSON.parse(httpRequest.response);

        bookData.link = responsedUrl.result.url;
        console.log(bookData.link);

        makeComponent(bookData);
      } else {
        console.log(httpRequest.response);
      }
    }
  };

  httpRequest.open('GET', url);
  httpRequest.send();
}

function makeComponent(bookData) {
  let indexofBracket = bookData.title.indexOf('(');
  console.log(typeof bookData.title);
  let title;
  let subTitle

  if (indexofBracket) {
    title = bookData.title.substring(0, indexofBracket);
    subTitle = bookData.title.substring(indexofBracket + 1, bookData.title.length - 1);
  }

  const grandBaby = new Gorilla.Component(grandBabyTemplate, {
    content: null,
  });

  grandBaby.hello = function () {
    console.log('hello');
  };

  const baby = new Gorilla.Component(babyTemplate, {
    name: bookData.author,
    description: bookData.description,
  }, {
    grandBaby,
  });

  baby.whatAreYou = function () {
    console.log('what are you?');
  };

  const app = new Gorilla.Component(appTemplate, {
    image: bookData.image,
    title,
    subTitle,
    price: bookData.price,
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
    document.querySelector('#root')
  );
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
