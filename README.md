# Vanilla Bookstore Web with Gorilla.js

Naver api를 이용하여 온라인 책방을 만들어보는 과제

![vanillaBookstore](VAmazon-bookstore-by-Vanilla_Coding-high.gif)

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

## Features

- UI 컴포넌트 활용
- Gorilla를 사용하여 컴포넌트 기반으로 작업
- 검색어를 입력받고, [Naver Book Search API](https://developers.naver.com/docs/search/book/)를 통해 검색결과 출력
  - 책 제목
  - 작가 이름
  - 출판사 이름
  - 책 요약 정보 (50글자 까지)
  - 출판일
  - 썸네일 이미지 (이미지가 없을 경우, 다른 dummy image를 구해서 대체)
  - 해당 검색 결과의 링크 단축 URL ([Naver URL Shortener API](https://developers.naver.com/docs/utils/shortenurl/) 이용)
- 리스트뷰 카드뷰 구현
- 무한 스크롤 구현
