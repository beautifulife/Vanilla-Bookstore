# Vanilla Bookstore Web with Gorilla.js

## Setup

Install dependencies

```sh
$ yarn install (or npm install)
```

## Development

```sh
$ yarn dev (or npm run dev)
# visit http://localhost:8080
```

- HTML 수정: `index.ejs`를 수정하시면 됩니다.
- JS 수정: `/app/index.js`를 수정하시면 됩니다.
- CSS 수정: `/assets/styles/index.less`를 수정하시면 됩니다. (파일 형식을 `.scss`로 바꿔서 SCSS를 사용하여도 됩니다.)

## Objectives

- UI 컴포넌트란 무엇인가에 대해 조사해보고 고민해보시기 바랍니다.
- Gorilla를 사용하여 컴포넌트 기반으로 작업하여야 하며, Gorilla를 최대한 이해하고 활용하세요.
- `import`, `export` statement를 처음 보셨다면, 조사해보시기 바랍니다.

## TODO

### 1. 책 검색창 보여주기

Acceptance Criteria

- 검색어를 입력할 수 있는 화면이 보여야 합니다.
- 검색어를 입력하면 [Naver Book Search API](https://developers.naver.com/docs/search/book/)로부터 검색 결과를 가져와야 합니다.
- 검색어는 1글자 이상 20글자 이하(공백 포함)여야 합니다.
- 검색 데이터를 가져오는 동안에는 새로운 검색이 불가능해야 합니다.

### 2. 검색 결과 보여주기

Acceptance Criteria

- 기본적으로 리스트 형식으로 보여주어야 합니다.
- 사용자가 카드 형식으로 볼 수 있도록 선택할 수 있어야 합니다.
- 카드 형식으로 선택한 후, 다시 리스트 형식으로 선택할 수 있어야 합니다.
- 검색 결과는 최대 20개까지 보여줍니다.
- 목록 최 하단에 "더보기" 버튼이 있어야 하고, "더보기"를 클릭할 경우, 그 다음 20개를 불러와 목록에 추가해주어야 합니다.
- 각 검색 결과는 아래의 항목들을 표시해야 합니다.
  - 책 제목
  - 작가 이름
  - 출판사 이름
  - 책 요약 정보 (50글자까지만 보여주어야 합니다.)
  - 출판일
  - 썸네일 이미지 (이미지가 없을 경우, 다른 dummy image를 구해서 대체해주세요.)
  - 해당 검색 결과의 링크 단축 URL ([Naver URL Shortener API](https://developers.naver.com/docs/utils/shortenurl/) 이용)

### Bonus

- "더보기" 버튼을 없애고 무한 스크롤 형식으로 수정해보세요.

## [webpack](https://webpack.js.org/)
If you're not familiar with webpack, the [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) will serve the static files in your build folder and watch your source files for changes.
When changes are made the bundle will be recompiled. This modified bundle is served from memory at the relative path specified in publicPath.
