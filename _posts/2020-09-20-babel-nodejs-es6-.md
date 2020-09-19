---
layout: post
title: 'Babel없이 Node.js로 ES6 사용하기'
subtitle: 'ES6 without transpiler'
date: 2020-09-20
author: 'Kshired'
header-style: text
tags:
  - Javascript
  - ES6
  - Node.js
---

![node-es6](/img/node-es6.jpg)

여태까지 저는 Node.js를 쓰면서 `import`, `export` 를 사용하기 위해 `Babel`과 같은 transpiler를 이용했습니다. 하지만 분명 Node.js 홈페이지에서는 es6 이상의 feature를 지원한다고 되어있는 것을 봤기에 오늘 검색을 해보았고, Babel과 같은 transpiler를 사용하지 않고 es6 문법을 적용한 코드를 Node.js를 통해 실행하는 법을 알게 되었습니다.

### package.json 수정하기

`npm init` 또는 `yarn init` 명령어를 통해 pacakge.json 파일의 기본 설정을 진행 :

```javascript
{
  "name": "node-es6-without-babel",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT"
}
```

이제 여기에 아래와 같은 사항을 추가해봅시다 :

- `"type":"module"` 추가.
  사실 위의 한 줄만 package.json에 추가해도, `node index.js`를 실행해도 ES6이상의 문법을 컴파일하여 실행해주기는 합니다만. CommonJS의 file extension 과 index파일이 존재하는 directory import가 안된다는 문제가 생깁니다.

그래서 아래와 같은 사항을 package.json에 하나 더 추가합니다.

- scripts 추가.

```javascript
"scripts":{
  "start":"node --es-module-specifier-resolution=node index.js"
}
```

위의 scripts를 추가하면, `yarn start` 혹은 `npm run start`를 통해 transpiler 없이 es6 이상의 문법을 사용하여 코드를 작성해도 Node.js가 컴파일을 할 수 있게 됩니다.

> Note: [scripts 뒤의 플래그 대해서 알고싶다면 클릭](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html#esm_customizing_esm_specifier_resolution_algorithm)

#### 최종 package.json

```javascript
{
  "name": "node-es6-without-babel",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "type":"module",
  "scripts":{
    "start":"node --es-module-specifier-resolution=node index.js"
  }
}
```
