---
layout: post
title: "ES6에서 export와 import"
subtitle: "그냥 내가 헷갈려서.."
date: 2020-08-29
author: "Kshired"
header-style: text
tags:
  - Javascript
  - ES6
---

![es6](/img/es.jpg)

`ES6 === ES2015` 에는 `import`와 `export` 가 CommonJS에서 사용하던 `module.exports` 를 대체한다. 이 문서에서는 `import`와 `export` 의 사용법과 용례를 알아보려한다.

## export

`export` 문은 함수, 객체, 원시 값을 내보낼 때 사용합니다. 내보낸 값은 다른 프로그램에서 `import`로 가져올 수 있습니다.

### 구문

```javascript
// 하나씩 내보내기
export let name1, name2, …, nameN; // var, const도 동일
export let name1 = …, name2 = …, …, nameN; // var, const도 동일
export function functionName(){...}
export class ClassName {...}

// 목록으로 내보내기
export { name1, name2, …, nameN };

// 내보내면서 이름 바꾸기
export { variable1 as name1, variable2 as name2, …, nameN };

// 비구조화로 내보내기
export const { name1, name2: bar } = o;

// 기본 내보내기
export default expression;
export default function (…) { … } // also class, function*
export default function name1(…) { … } // also class, function*
export { name1 as default, … };

// 모듈 조합
export * from …; // does not set the default export
export * as name1 from …;
export { name1, name2, …, nameN } from …;
export { import1 as name1, import2 as name2, …, nameN } from …;
export { default } from …;
```

### named vs default

export는 named와 default로 나뉘는데, named export는 여러 개가 존재 할 수 있지만, default export는 단 하나만 가능.

- named export

  ```js
  // 먼저 선언한 식별자 내보내기
  export { myFunction, myVariable };

  // 각각의 식별자 내보내기
  // (변수, 상수, 함수, 클래스)
  export let myVariable = Math.sqrt(2);
  export function myFunction() { ... };
  ```

- default export

  ```js
  // 먼저 선언한 식별자 내보내기
  export { myFunction as default };

  // 각각의 식별자 내보내기
  export default function () { ... };
  export default class { ... }
  ```

named는 여러 값을 import 할 때 유용하고, import 할 때 export 했던 이름으로 import 해야 함.

default는 import 할 때 어떤 이름으로도 가져 올 수 있음.

#### 예제코드

1. named export

   ```javascript
   //exporting.js
   let a = 12;
   let b = 13;

   export { a, b };
   ```

   ```javascript
   //importing.js
   import { a, b } from "./exporting";

   console.log(a); // 12 print
   console.log(b); // 13 print

   /*
   아래와 같이 모듈 전체를 가져 올 수도 있음.
   import * as exporting from "./exporting"
   // import exporting from "./exporting" => 안됨! default export된 것이 없음.
   
   console.log(exporting.a); // 12 print
   console.log(exporting.b); // 13 print
   */
   ```

2. default export

   ```javascript
   //exporting.js
   let a = 12;

   export default a;
   ```

   ```javascript
   //importing.js
   import a from "./exporting";

   console.log(a); // 12 print

   /*
   아래와 같이 모듈 이름을 바꿔 가져와도 상관 없음
   import b from "./exporting"
   
   console.log(b); // 12 print
   */
   ```

**예제**

```javascript
//exporting.js
let a = 12;
let b = 13;
let c = 14;

export { a, b };
export default c;
```

```javascript
import a from "./exporting";

console.log(a); // a의 값은?
```

a의 값은 default로 export 된 c의 값!

exporting.js의 a 값을 print하고 싶다면 `import {a} from "./exporting"`

## import

`import` 문은 다른 모듈에서 내보낸 바인딩을 가져올 때 사용합니다.

### 구문

```javascript
import defaultExport from "module-name";
import * as name from "module-name";
import { export1 } from "module-name";
import { export1 as alias1 } from "module-name";
import { export1 , export2 } from "module-name";
import { foo , bar } from "module-name/path/to/specific/un-exported/file";
import { export1 , export2 as alias2 , [...] } from "module-name";
import defaultExport, { export1 [ , [...] ] } from "module-name";
import defaultExport, * as name from "module-name";
import "module-name";
var promise = import("module-name");
```

- `defaultExport`

  모듈에서 가져온 default export를 가리킬 이름.

- `name`

  import한 대상에 접근할 때 일종의 이름공간으로 사용할, 모듈 객체의 이름.

- `exportN`

  export한 대상 중 import 할 것들의 이름.

- `aliasN`

  import한 named export를 가리킬 이름.
