---
layout: post
title: "GraphQL에 Prisma2 도입하기"
subtitle: "Modern Database Access"
date: 2020-08-18
author: "Kshired"
header-style: text
tags:
  - GraphQL
  - Prisma
  - Node
  - Javascript
  - devlog
---

`GraphQL`을 접하고, 처음에는 직접 resolver에 SQL을 작성해오면서 불편함과 어려움을 겪었다. GQL 자체는 쉬운데, 여기에 SQL을 섞으니 답이 없다.. 또, 서버 개발을 시작 할 때 처음으로 접한게 `django`여서 그런지 ORM으로 처리하던게 SQL로 되버리니 더 어려워진 느낌도 받았다.

이 때 접하게 된게 Prism였고, Prisma를 살펴본 결과 GraphQL의 생산성을 높이는데 충분히 좋다는 것도 깨달았다. 이제 Prisma를 GraphQL에 도입하는 방법을 알아보자.

## GraphQL의 resolver를 SQL로 작성하기

일단, Prisma를 사용하기전에 GraphQL의 resolver에 SQL을 사용하는 법을 알아보자.

아래와 같은 쿼리가 있다고 생각해보자.

```javascript

//graphql query example1

type Person {
  id:Int!
  name: String!
}

type Query{
  people: [Person]
}
```

여기서 people이라는 Query의 resolver를 SQL로 작성하려면 어떻게 해야 할까?

`select * from people`과 같이 작성하면 될 것이다. 코드로 작성하면 아래와 유사하게 작성하면 된다.

```javascript
const resolver = {
  Query: {
    people: async () => {
      const { rows } = await pool.query("select * from user");
      return rows;
    },
  },
};
```

지금은 꽤 간단해 보이는 SQL이지만, 쿼리가 원하는게 더 복잡해지고 많아지면 쿼리는 길어지고 복잡해진다.

나는 이 쿼리 작성에 **한계를 느꼈고**, 결국 Prisma로 갈아타게 되었다.

## GraphQL에 Prisma 도입하기

일단 Prisma가 무엇일까? [Prisma](https://prisma.io) 공식사이트에는 아래와 같은 문구로 소개하고 있다.

> Modern Database Access for TypeScript & Node.js

어떠한 방법으로 Access를 하길래, **Modern** Database Access라고 하는걸까?

일단 아래 이미지를 참고해보자.

![prisma](/img/prisma.png)

간단하게 위 내용을 설명해보면.. API Server(GraphQL Server)에서 Prisma client로 Javascript문법을 이용하여 request를 하면, Prisma client에서 해석하여 SQL Query를 만들어 데이터베이스에 요청하는 것이다.

쓰다보니 복잡한데, 더 간단하게 설명하면 아래와 같다.

API Server에서 Javascript문법으로 요청 -> Prisma client에서 Query 생성 -> DB에 요청

이 설명으로 약간 부족하게 느낄 수 있으니 위 person Query를 이용해 직접 resolver 코드를 작성해보자.

```javascript
const prisma = new PrismaClient();

const resolver = {
  Query: {
    people: async () => {
      return await prisma.person.findMany();
    },
  },
};
```

이게 끝이다. 정말 간단하고. 그냥 Prisma client에 "person을 많이 찾아줘! ( `person.findMany` )" 이렇게 요청하면, 알아서 SQL Query를 작성해주고 DB에서 값을 가져와준다. 너무 아름답다..

이제 GraphQL Playground에 아래와 같은 Query를 요청하면.. 깔끔한 결과를 얻을 수 있다.

```javascript
query {
  people {
    id
    name
  }
}

// 결과는 person의 id와 name으로 이루어진 json 배열일 것이다.
```

### 마치면서

Prisma는 정말 생산성을 쉽게 올려 줄 수 있고 GraphQL만이 아닌 일반적인 REST API에서도 사용 할 수 있다. SQL을 작성하는게 이제 너무 지겹다면, Prisma를 사용해 보는 것이 어떨까?

또, 현재 experimental로 Prisma datamodel schema를 생성하면 Database의 Schema까지 생성해주는 `Prisma migrate`가 있다. 이 외에도 `Prisma Studio`라는 Database Admin 페이지와 유사한 것도 제공하고 있으니 궁금하면 찾아보자.

#### References

- https://www.prisma.io/
- https://www.prisma.io/docs/
