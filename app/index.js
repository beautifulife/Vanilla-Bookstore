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

// Creating Gorilla Component Instance with some data
const grandBaby = new Gorilla.Component(grandBabyTemplate, {
  content: 'What!!!'
});

// Creating Component Instance Method (Frequently used as event handler in template)
grandBaby.hello = function () {
  console.log('hello');
};

// Creating Gorilla Component Instance with some data and child component
const baby = new Gorilla.Component(babyTemplate, {
  name: 'Baby..'
}, {
  grandBaby
});

baby.whatAreYou = function () {
  console.log('what are you?');
};

const app = new Gorilla.Component(appTemplate, {
  title: '바닐라코딩'
}, {
  baby
});

app.handleMouseover = function () {
  console.log('mouseover');
};

app.handleClick = function () {
  console.log('click');
};

// Listening to component life cycle
app.on('BEFORE_RENDER', () => console.log('app before render'));
app.on('AFTER_RENDER', () => console.log('app after render'));

// Updating component data model
setTimeout(() => {
  app.title = '빠닐라코띵';
  baby.name = 'Qkqkqkqk';
  grandBaby.content = 'GGGGG';
}, 2000);

// Initializing the app into DOM
Gorilla.renderToDOM(
  app,
  document.querySelector('#root')
);

/* DO NOT REMOVE */
module.hot.accept();
/* DO NOT REMOVE */