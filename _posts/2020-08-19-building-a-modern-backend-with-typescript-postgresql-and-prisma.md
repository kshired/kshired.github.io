---
layout: post
title: "Building a Modern Backend with TypeScript, PostgreSQL and Prisma"
date: 2020-08-19
author: "Kshired"
header-style: text
tags:
  - devlog
  - Prisma
  - TypeScript
  - PostgreSQL
  - Docker
---

- 이 시리즈는 [**Building a Modern Backend with TypeScript, PostgreSQL and Prisma**](https://www.prisma.io/blog/modern-backend-1-tsjs1ps7kip1) 을 순차적으로 번역 하는 시리즈입니다.

- 오역,의역,오타가 존재 할 수 있습니다.

## Building a Modern Backend with TypeScript, PostgreSQL and Prisma

이 포스트는 라이브로 스트리밍 된 `TypeScript, PostgreSQL, Prisma를 이용하여 Backend 구축하기` 를 요약 한 것입니다. 우리는 이 포스트를 통해 데이터 모델 디자인, CRUD 동작 그리고 Query Aggregate가 어떻게 Prisma를 통해 이루어지는 지를 알아 볼 것입니다.

![part1](/img/part1.png)

#### 개관

이 시리즈의 목표는 **온라인 강좌의 등급 부여 시스템**을 구현하면서, 모던 백엔드에 맞게 다양한 패턴과 문제 그리고 아키텍쳐에 대해 생각해보고 그것들을 해결하는 것입니다. 이 시스템은 다양한 타입의 relation과 충분히 복잡하기 때문에 실제 현실을 나타낼 수 있습니다.

##### 이 시리즈는 무엇을 배우는가?

이 시리즈는 데이터베이스의 역할에 집중 하면서, 모든 방면의 백엔드 개발에 대해 배울 것입니다.

- 데이터 모델링

- CRUD ( 생성, 읽기, 갱신, 삭제 )

- Aggregations ( 집계 )

- API layer

- Validation ( 검증 )

- Testing ( 테스트 )

- Authentication ( 인증 )

- Authorization ( 권한 부여 )

- Integration with external APIs ( 외부 API들과 통합)

- Deployment ( 배포 )

##### 오늘은 무엇을 배울 것인가?

이 포스트에서는 문제를 정리하고 그 후 다음과 같은 백엔드의 다음과 같은 것들을 개발하면서 시작 할 것 입니다.

1. 데이터 모델링 : 데이터 베이스 스키마를 문제 상황에 맞게 작성 할 것입니다.
2. CRUD : Create(생성), Read(읽기), Update(갱신), Delete(삭제) 쿼리를 [Prisma Client](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client)를 이용하여 구현 할 것입니다.
3. Aggregation : 평균등을 내는 Aggreation 쿼리를 Prisma를 이용해 구현 할 것입니다.

이 포스트가 끝나고 난 뒤 당신은 Prisma Schema, Prisma Migrate를 통해 생성 된 데이터 베이스 스키마 그리고 Prisma Client를 이용한 CRUD 및 Aggregation 쿼리를 작성하는 법에 대해 알게 될 것입니다.

이 시리즈의 다음 파트에서는 리스트에 있는 다른 것들을 배울 것입니다.

> _Note_ : 가이드에 있는 **체크포인트**를 통해 당신이 이 강의를 제대로 수행했는지 스스로 알 수 있습니다.

### 필요사항

**전제 지식**

이 시리즈는 당신이 TypeScript, Node.js, 관계형 데이터베이스의 기본은 알고 있다고 생각하고 진행됩니다. 하지만, TypeScript를 해본 적이 없다해도 JavaScript를 해본적이 있다면 진행 할 수 있습니다. 또, 이 시리즈는 PostgreSQL을 사용하지만 MySQL과 같은 대부분의 관계형 데이터베이스와 유사하기에 문제가 없습니다. 그리고 Prisma에 대한 선행지식은 필요하지 않습니다.

**개발 환경**

아래의 것들이 설치 되어있어야 합니다

- [Node.js](https://nodejs.org)
- [Docker](https://www.docker.com/) ( PostgreSQL 데이터베이스를 사용 할 때 이용 할 것입니다. )

만약 Visual Studio Code를 사용한다면, [Prisma Extension](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)을 설치하는 것을 추천합니다.

> _Note_ : Doker를 사용하고 싶지 않다면, 로컬 환경에서 PostgreSQL 데이터 베이스를 사용하거나 Heroku에서 호스팅하는 것을 사용하세요.

### 깃허브 저장소 클론하기

이 코드는 GitHub에서 찾아 볼 수 있습니다.

시작하기 위해, 아래와 같은 저장소를 클론하고 프로젝트 의존성을 설치하세요.

```bash
git clone -b part-1 git@github.com:2color/real-world-grading-app.git
cd real-world-grading-app
npm install
```

> _Note_ : `파트-1` 의 브랜치를 체크아웃해야 이 포스트를 시작부터 따라 할 수 있습니다.

### PostgreSQL 실행하기

PostgreSQL을 실행하기위해 아래와 같은 명령어를 `real-world-grading-app` 폴더에서 실행하세요.

```bash
docker-compose up -d
```

> _Note_ : Docker는 `docker-compose.yml 파일을 사용하여 PostgreSQL 컨테이너를 실행 할 것입니다.

### 온라인 강좌 등급 부여 시스템을 위한 데이터 모델

#### 문제 영역과 엔티티 정의하기

우리가 백엔드를 구성 할 때 가장 중요한 것 중 하나는 문제 영역( 또는 문제 공간 )에 대한 적절한 이해입니다. 문제 영역( problem domain )은 문제를 정의하고 해결책의 제약 조건등을 가리키는 말입니다. 문제 영역을 이해하게 되면, 데이터 모델의 형태와 구조는 명확해질 것 입니다.

온라인 강좌 시스템은 아래와 같은 엔티티를 가지고 있습니다.

- **User** : 계정을 갖고 있는 사람. 유저는 강좌에 따라 선생님 혹은 학생 일 수 있습니다. 즉, 어떤 강좌에서는 선생님인 유저가 다른 강좌에서는 학생 일 수 있습니다.
- **Course** : 강좌는 한 명 이상의 선생님과 학생으로 이루어져 있으며, 한 개 이상의 테스트를 가지고 있습니다. 예를 들어, "TypeScript 입문"이라는 수업은 선생님 두 명과 학생 열 명을 가질 수 있습니다.
- **Test** : 강좌는 학생을 평가하기 위해 많은 테스트를 가질 수 있고, 날짜와 강좌와 관련 된 정보를 가지고 있습니다.
- **Test result** : 각 테스트는 한 학생당 여러 개의 테스트 결과를 가질 수 있습니다. 또한 테스트 결과는 어떤 선생님이 평가했는지에 관한 정보를 포함하고 있습니다.

> _Note_ : 엔테티는 물리적 사물이나 형태가 없는 개념을 나타냅니다. 예를 들어, 유저는 사람이라는 물리적인 것을 나타내지는 강좌는 형태가 없는 개념입니다.

이 엔티티들은 관계형 데이터 베이스( 현재는 PostgreSQL )에서 어떻게 표현 되는지 [다이어그램](https://dbdiagram.io/d/5f19635fe586385b4ff7a26d)을 통해 시각화 될 수 있습니다. 아래 다이어그램은 각 엔티티 및 외래키와 관련된 열을 추가하여 엔티티 간의 관계를 설명합니다.

![diagram](/img/diagram.png)

다이어그램에서 첫 번째로 언급 할 것은 모든 엔티티들이 데이터 베이스 테이블에 맵핑된다는 것입니다.

다이어그램에서 엔티티들은 아래와 같은 관계를 가집니다.

- 일대다 관계 ( 1 - n )
  - `Test` <> `TestResult`
  - `Course` <> `Test`
  - `User` <> `TestResult` (via `graderId`)
  - `User` <> `TestResult` (via `student`)
- 다대다 관계 ( m - n )
  - `User` <> `Course` ( 다음과 같은 두 외래키 (`userId` , `courseId`) 를 이용하여 `CourseEnrollment` 관계 테이블을 형성한다. ) 다대다 관계는 일반적으로 추가적인 테이블을 필요로하고, 이것은 등급 부여 시스템에 필수적이며 아래와 같은 것들이 필요로합니다.
    - 한 강좌는 여러 명의 유저가 들을 수 있습니다.
    - 한 유저는 여러 강의를 들을 수 있습니다.

> _Note_ : 관계 테이블 ( JOIN 테이블로 잘 알려져 있습니다. )은 두 개 이상의 테이블을 연결하기 위해 필요로합니다. 관계 테이블을 만드는 것은 SQL에서 다른 엔티티 사이의 관계를 나타내기위한 일반적인 데이터 모델링 방법입니다. 즉, "데이터 베이스에서 m-n관계는 두 개의 1-n관계 처럼 모델링 된다는 것입니다."

##### Prisma Schema 이해하기

데이터베이스에 테이블을 생성하기 위해서는 [Prisma Schema](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema)를 먼저 정의해야합니다. Prisma Schema는 [Prisma Migrae](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-migrate)이 데이터베이스 테이블을 만들기 위해 사용됩니다. 위의 엔티티 다이어그램과 유사하며, Prisma Schema는 행과 데이터베이스 테이블사이의 관계를 정의합니다.

Prisma Schema는 Prisma Client와 Prisma Migrate가 데이터베이스 스키마를 구성하는데 사용됩니다.

Prisma Schema는 프로젝트의 `prisma/schema.prisma` 에서 찾을 수 있습니다. Schema 파일에서 이 포스트에서 정의 할 임시 모델(stub model)을 볼 수 있을것이며, `datasource` 블록도 볼 수 있을 것입니다. `datasource` 블록은 연결 할 데이터베이스를 정의합니다. Prisma `env("DATABASE_URL")` 을 이용하여 데이터베이스 연결 URL을 환경 변수로부터 불러올 것입니다.

##### 모델 정의하기

Prisma Schema의 기초적인 블록 중 하나는 `모델` 입니다. 모든 모델은 데이터베이스와 매핑 될 것입니다.

기초적인 모델의 예시는 아래와 같습니다.

```javascript
model User {
  id        Int    @default(autoincrement()) @id
  email     String @unique
  firstName String
  lastName  String
  social    Json?
}
```

정의한 `User`모델은 다음과 같은 여러 [필드](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/models#fields)로 구성됩니다. 각 필드는 이름과 타입이 있으며 선택적인(optional) 필드 속성을 가지고있습니다. 예를들어 `id` 필드는 아래와 같이 구성됩니다.

| NAME        | TYPE     | SCALAR VS RELATION | TYPE MODIFIER                                                                                                         | ATTRIBUTES                                                                                          |
| :---------- | :------- | :----------------- | :-------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `id`        | `Int`    | Scalar             | -                                                                                                                     | `@id` (denote the primary key) and `@default(autoincrement())` (set a default auto-increment value) |
| `email`     | `String` | Scalar             | -                                                                                                                     | `@unique`                                                                                           |
| `firstName` | `String` | Scalar             | -                                                                                                                     | -                                                                                                   |
| `lastName`  | `String` | Scalar             | -                                                                                                                     | -                                                                                                   |
| `social`    | `Json`   | Scalar             | `?` ([optional](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/models#optional-vs-required)) | -                                                                                                   |

Prisma는 사용되는 데이터베이스에 따라 기본 데이터 베이스 유형에 매핑되는 [데이터 유형](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-model#scalar-types)을 정의해줍니다.

`Json` 데이터 타입은 Json형식에 대한 자유로운 저장을 허용합니다. 이 타입은 `User` 사이에서 일관성이 없거나 백엔드의 핵심적인 기능에 영향을 주지않는 정보에 유용합니다. 우리의 `User` 모델에서는 트위터, 페이스북과 같이 SNS 정보를 저장하는데 사용될 것이며 새로 SNS 정보를 저장 할 때는 데이터베이스 Migration이 필요하지 않을 것입니다.

이제 문제영역을 잘 이해하여 Prisma를 이용해서 데이터 모델링을하면 `prisma/schema.prisma` 파일에 다음과 같은 모델을 추가 할 수 있습니다.

```javascript
model User {
  id        Int    @default(autoincrement()) @id
  email     String @unique
  firstName String
  lastName  String
  social    Json?
}

model Course {
  id            Int     @default(autoincrement()) @id
  name          String
  courseDetails String?
}

model Test {
  id        Int      @default(autoincrement()) @id
  updatedAt DateTime @updatedAt
  name      String // Name of the test
  date      DateTime // Date of the test
}

model TestResult {
  id        Int      @default(autoincrement()) @id
  createdAt DateTime @default(now())
  result    Int // Percentage precise to one decimal point represented as `result * 10^-1`
}
```

이제 각 모델은 ( 다음 단계에서 정의 될 ) 관계를 제외하고 모두 필드를 가지고 있습니다.

##### 관계 정의

#### 일대다 관계

이 단계에서는 `Test` 와 `TestResult` 사이의 [일대다 관계](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#one-to-many-relations)를 정의 할 것입니다.

먼저, 이전의 정의 된 `Test` 와 `TestResult` 모델을 보겠습니다.

```javascript
model Test {
  id        Int      @default(autoincrement()) @id
  updatedAt DateTime @updatedAt
  name      String
  date      DateTime
}

model TestResult {
  id        Int      @default(autoincrement()) @id
  createdAt DateTime @default(now())
  result    Int // Percentage precise to one decimal point represented result * 10^-1
}
```

두 모델 사이의 일대다 관계를 정의하기 위해 아래 세 개의 필드를 추가 할 것 입니다.

- `testId` : `Int` ([_relation scalar_](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#annotated-relation-fields-and-relation-scalar-fields)) 타입의 필드이며 `TestResult` 와 "many"에 해당하는 관계를 가지고 있습니다. : 이 필드는 데이터 테이블에서 _외래키_ 로 구성 될 것입니다.

- `test` : `Test` ([_relation field_](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#relation-fields)) 타입의 필드이며, `@relation` 속성은 관계형 스칼라(rleation sclara) `testId` 와 `Test` 모델의 기본키 ( primary key ) `id` 에 맵핑됩니다.

- `testResults` : `TestResult[]` ([_relation field_](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#relation-fields)) 타입의 필드입니다.

```javascript
model Test {
  id        Int      @default(autoincrement()) @id
  updatedAt DateTime @updatedAt
  name      String
  date      DateTime

+ testResults TestResult[] // relation field
}

model TestResult {
  id        Int      @default(autoincrement()) @id
  createdAt DateTime @default(now())
  result    Int // Percentage precise to one decimal point represented result * 10^-1
+ testId    Int // relation scalar field
+ test      Test @relation(fields: [testId], references: [id]) // relation field
}
```

`test` , `testResults` 같은 관계형 필드(relation fileds)는 다른 모델들을 (예를 들어, `Test` 와 `TestResult` 모델 ) 가리키는 값의 타입으로 간주 될 수 있습니다. 이것들의 이름은 Prisma Client와 프로그래밍적으로 관계(relation)에 접근하는 방법에 영향을 끼칠 수는 있지만, 실제 데이터 베이스 열을 나타내지는 않습니다.

#### 다대다 관계

이 단계에서는 우리는 `User` 와 `Course` 사이의 _다대다 관계 ( many-to-many relation )_ 를 정의 할 것입니다.

다대다 관계는 [_명시적 혹은 암묵적_](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#implicit-vs-explicit-many-to-many-relations)으로 Prisma Schema에서 정의 할 수 있습니다. 이번 파트에서 우리는 두 개의 다른 모델 사이에서 언제 명시적 혹은 암묵적인 다대다 관계를 선택하는지를 배우게 될 것입니다.

먼저 이전에 정의한 `User` 와 `Course` 모델을 살펴보겠습니다.

```javascript
model User {
  id        Int    @default(autoincrement()) @id
  email     String @unique
  firstName String
  lastName  String
  social    Json?
}

model Course {
  id            Int     @default(autoincrement()) @id
  name          String
  courseDetails String?
}
```

다대다 관계를 만들기 위해 관계형 필드(relation field)를 양쪽 모델 모두에 정의하겠습니다.

```javascript
model User {
  id        Int    @default(autoincrement()) @id
  email     String @unique
  firstName String
  lastName  String
  social    Json?
+ courses     Course[]
}

model Course {
  id            Int     @default(autoincrement()) @id
  name          String
  courseDetails String?
+ members User[]
}
```

이를 통해, Prisma Client는 관계형 테이블을 형성하여 등급 부여 시스템이 위에서 정의한 다음과 같은 속성(프로퍼티,property)을 가질 수 있도록 할 것입니다.

- 한 강좌는 여러 명의 유저가 들을 수 있다.
- 한 유저는 여러 개의 강의를 들을 수 있다.

그러나, 등급 부여 시스템의 필요 조건 중 하나는 _선생님_ 혹은 _학생_ 의 역할을 가진 유저가 강좌와 관계(relation)를 가질 수 있도록 하는 것입니다. 즉, 우리는 관계(relation)에 관한 "메타정보"를 데이터 베이스에 저장 할 방법을 찾아야합니다.

그러기 위해, 우리는 `CourseEnrollment` 라는 관계 테이블(relation table)을 정의하고 `CourseEnrollemnt` 타입의 `course`와 `members` 필드를 각각 `User`와`Course` 모델에 다음과 같이 추가해야합니다.

```javascript
model User {
  id        Int    @default(autoincrement()) @id
  email     String @unique
  firstName String
  lastName  String
  social    Json?
+ courses     CourseEnrollment[]
}

model Course {
  id            Int     @default(autoincrement()) @id
  name          String
  courseDetails String?
+ members CourseEnrollment[]
}

+model CourseEnrollment {
+  createdAt DateTime @default(now())
+  role      UserRole
+
+  // Relation Fields
+  userId   Int
+  user     User   @relation(fields: [userId], references: [id])
+  courseId Int
+  course   Course @relation(fields: [courseId], references: [id])
+  @@id([userId, courseId])
+}
+
+enum UserRole {
+  STUDENT
+  TEACHER
+}
```

`CourseEnrollment` 에 관해 알아두어 야 할 것들

- enum 타입의 `UserRole` 를 사용하여 유저가 학생인지 선생님인지 표시합니다.
- `@@id[userId,courseId]`는 두 필드를 다중 필드 기본키(multi-field primary key)로 정의하는 것입니다. 이것은 모든 `User` 가 한 `Course`에 대해 단 한 번만 학생 혹은 선생님으로써 정의 될 수 있도록 도와줍니다.

관계(relation)에 대해 더 알고 싶다면, [relation docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations) 를 읽어보는 것을 추천합니다.

#### The full Schema

이제 우리는 관계가 어떻게 정의 되어 있는지 알아보았습니다. 아래와 같이 Prisma Schema를 업데이트 하세요.

```javascript
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int    @default(autoincrement()) @id
  email     String @unique
  firstName String
  lastName  String
  social    Json?

  // Relation fields
  courses     CourseEnrollment[]
  testResults TestResult[]       @relation(name: "results")
  testsGraded TestResult[]       @relation(name: "graded")
}

model Course {
  id            Int     @default(autoincrement()) @id
  name          String
  courseDetails String?

  // Relation fields
  members CourseEnrollment[]
  tests   Test[]
}

model CourseEnrollment {
  createdAt DateTime @default(now())
  role      UserRole

  // Relation Fields
  userId   Int
  courseId Int
  user     User   @relation(fields: [userId], references: [id])
  course   Course @relation(fields: [courseId], references: [id])

  @@id([userId, courseId])
}

model Test {
  id        Int      @default(autoincrement()) @id
  updatedAt DateTime @updatedAt
  name      String
  date      DateTime

  // Relation Fields
  courseId   Int
  course     Course       @relation(fields: [courseId], references: [id])
  testResults TestResult[]
}

model TestResult {
  id        Int      @default(autoincrement()) @id
  createdAt DateTime @default(now())
  result    Int // Percentage precise to one decimal point represented as `result * 10^-1`

  // Relation Fields
  studentId Int
  student   User @relation(name: "results", fields: [studentId], references: [id])
  graderId  Int
  gradedBy  User @relation(name: "graded", fields: [graderId], references: [id])
  testId    Int
  test      Test @relation(fields: [testId], references: [id])
}

enum UserRole {
  STUDENT
  TEACHER
}
```

`TestResult` 이 `User`모델과 두 가지 관계를 가진다는 것을 유의하세요. `student` 와 `gradedBy` 필드는 등급을 부여 한 선생님과 시험을 친 학생을 나타냅니다. `@relation` 속성의 `name` 인자는 한 모델이 같은 모델에 여러 관계를 가지고 있을 때 모호한 관계를 분명하게 하기위해 필수적으로 필요합니다. [참고](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/relations#disambiguating-relations)

#### 데이터베이스 마이그레이션

Prisma Schema에서 정의한 것을 이용하여 Prisma Migrate가 실제 데이터베이스 테이블을 생성 할 것입니다.

먼저 `DATABASE_URL` 환경 변수값을 정의하여 Prisma가 데이터베이스에 연결 할 수 있도록 하세요.

```sh
export DATABASE_URL="postgresql://prisma:prisma@127.0.0.1:5432/grading-app"
```

> _Note_ : username과 password는 `prisma` 로 `docker-compose.yml` 에 정의되어있습니다.

Prisma Migrate를 이용해 마이그레이션을 하려면 다음과 같은 단계를 진행해야합니다

1. **마이그레이션 저장** : 이 단계에서는 Prisma Migration이 Schema의 스냅샷을 만들어 마이그레이션을 진행하기 위한 준비를 할 것입니다. 마이그레이션 스냅샷 파일은 `prisma/migrations` 에 저장 될 것입니다.
2. **마이그레이션 실행** : 이 단계에서는 Prisma Migration이 스냅샷 파일을 이용하여 데이터베이스를 생성하거나 교체하는 마이그레이션을 진행 할 것입니다.

> _Note : Prisma Migrate는 현재 실험 상태입니다. 실제 프로덕트에서 Prisma Migrate를 사용하는 것은 추천하지 않습니다. 실제 프로덕트에서는 SQL을 이용하거나 다른 방법을 이용하여 Migration을 진행하고, 변경점이 발생하면 introspection을 이용해 Prisma Schema에 적용 할 수 있습니다._

다음과 같은 명령어를 터미널에 입력하세요 :

```
# Save the migration
npx prisma migrate save --experimental --name "init-db" --create-db

# Run the migration
npx prisma migrate up --experimental
```

**체크포인트** : 이제 우리는 `🚀 Done with 1 migration in 263ms.` 다음과 같은 출력을 볼 수 있습니다.

축하합니다! 우리는 성공적으로 데이터 모델을 정의하고 생성하였습니다. 다음 스텝에서는 Prisma Client를 이용하여 CRUD와 Aggregation 쿼리를 생성 할것입니다.

### Prisma Client 생성하기

Prisma Client는 스키마 기반으로 자동 생성 된 데이터베이스 클라이언트입니다. Prisma Client는 Prisma Schema를 분석하여 우리의 코드에 import 할 수 있는 TypeScript client를 생성해줍니다.

Prisma Client를 생성하기 위해, 다음과 같은 세 단계를 진행해야합니다.

1. 다음과 같은 `generator`를 Prisma Schema에 추가해줍니다.

   ```javascript
    generator client {
      provider        = "prisma-client-js"
      previewFeatures = ["aggregateApi"]
    }
   ```

2. `@prisma/client` 패키지를 설치해줍니다.

   ```bash
   npm install --save @prisma/client
   ```

3. 다음과 같은 명령어로 Prisma Client를 생성해줍니다.

   ```bash
   npx prisma generate
   ```

**체크포인트** : 이제 우리는 `✔ Generated Prisma Client to ./node_modules/@prisma/client in 57ms` 와 같은 출력을 볼 수 있습니다.

### Seeding the database

이 단계에서는 우리는 Prisma Client를 이용하여 데이터베이스에 샘플데이터를 넣을 seed script를 작성 할 것입니다.

*seed script*는 Prisma Client를 이용해 CRUD ( 생성, 읽기, 갱신, 삭제 ) 동작을 실행 할 스크립트입니다. 우리는 [nested write](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/relation-queries#nested-writes)를 이용하여 단일 동작으로 데이터베이스 열에 관계된 엔티티를 한 번에 생성 할 것입니다.

`src/seed.ts` 파일을 열어보면 Prisma Client가 import 되어 있는 부분과 Prisma Client 함수를 호출 한 부분을 볼 수 있을 것입니다. 하나는 Prisma Client를 인스턴스화하고 다른 하나는 Prisma Client와의 연결을 종료하는 코드입니다.

#### User 생성

User를 `main` 함수에서 다음과 같이 생성 하겠습니다

```ts
const grace = await prisma.user.create({
  data: {
    email: "grace@hey.com",
    firstName: "Grace",
    lastName: "Bell",
    social: {
      facebook: "gracebell",
      twitter: "therealgracebell",
    },
  },
});
```

이 동작은 _User_ 테이블에 행을 생성하고 생성된 자동 생성된 `id` 를 포함한 User를 반환 해 줄 것입니다. `user`가 `@prisma/client` 에 정의된 `User` 타입으로 추론 될 수 있다는 것은 정말 가치가 있습니다.

```ts
export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  social: JsonValue | null;
};
```

`User` 를 생성하는 코드가 있는 seed script를 실행하기위해 다음과 같이 우리는 [`package.json` 에 정의 되어 있는 `seed`](https://github.com/2color/real-world-grading-app/blob/part-1/package.json#L25)명령어를 사용 할 수 있습니다

```
npm run seed
```

다음 단계를 진행하다보면, 우리는 seed script를 한 번 이상 실행하게 될 것입니다. 제약조건 에러를 피하기 위해 다음과 같은 코드를 `main` 함수에 추가하여 실행하면 데이터베이스의 값들을 삭제 할 수 있습ㄴ다.

```ts
await prisma.testResult.deleteMany({});
await prisma.courseEnrollment.deleteMany({});
await prisma.test.deleteMany({});
await prisma.user.deleteMany({});
await prisma.course.deleteMany({});
```

> _Note : 이 명령어는 데이터베이스 테이블의 모든 행을 삭제합니다. 실제 프로덕트에서는 사용을 피하세요_

#### 강좌와 이에 관련한 테스트와 유저 생성하기

이번 단계에서는 nested write를 이용하여 *course*와 course에 관련 된 *tests*를 생성 할 것입니다.

다음과 같은 함수를 `main` 함수에 추가하세여

```ts
const weekFromNow = add(new Date(), { days: 7 });
const twoWeekFromNow = add(new Date(), { days: 14 });
const monthFromNow = add(new Date(), { days: 28 });

const course = await prisma.course.create({
  data: {
    name: "CRUD with Prisma",
    tests: {
      create: [
        {
          date: weekFromNow,
          name: "First test",
        },
        {
          date: twoWeekFromNow,
          name: "Second test",
        },
        {
          date: monthFromNow,
          name: "Final exam",
        },
      ],
    },
  },
});
```

이 코드는 `Course` 테이블 행과 이와 관련 된 세 개의 `Test` 테이블 행을 생성합니다. ( `Course`와 `Tests` 는 일대다 관계를 가지고 있어서 이렇게 코드를 작성하는게 허용됩니다.)

만약 이전 단계에서 생성한 user를 선생님으로 만드려면 어떻게 해야할까요?

`User` 와 `Course`는 명시적인 다대다관계를 가지고있습니다. 이를 이용하여 우리는 `CourseEnrollment` 테이블에 행을 만들고 `User` 와 `Course`를 연결하고 역할을 지정 해 줄 수 있습니다.

위 코드에 코드를 다음과 같이 추가하여 실행하면 됩니다.

```ts
const weekFromNow = add(new Date(), { days: 7 });
const twoWeekFromNow = add(new Date(), { days: 14 });
const monthFromNow = add(new Date(), { days: 28 });

const course = await prisma.course.create({
  data: {
    name: "CRUD with Prisma",
    tests: {
      create: [
        {
          date: weekFromNow,
          name: "First test",
        },
        {
          date: twoWeekFromNow,
          name: "Second test",
        },
        {
          date: monthFromNow,
          name: "Final exam",
        },
      ],
    },
    members: {
      create: {
        role: "TEACHER",
        user: {
          connect: {
            email: grace.email,
          },
        },
      },
    },
  },
  include: {
    tests: true,
  },
});
```

> _Note : `include` 인자는 결과를 fetch 할 수 있도록 해줍니다. 이것은 다음 스텝에서 test와 관련 되어있는 test results를 가져올 때 유용하게 쓸 수 있습니다._

`members` 와 `tests` 같이 nested write를 사용 할 때는 두가지 옵션이 존재합니다.

- `connect` : 현재 존재하는 행과 relation 생성
- `create` : 새로운 행과 relation 생성

`tests` 의 경우에는 생성 된 강좌에 오브젝트 배열을 인자로 넘겨주었습니다.

`members`의 경우에는 `create`와 `connect`를 사용하였습니다. 이는 `user`가 이미 존재하더라도, 이전에 생성된 유저가 관계를 형성하기 위해 `connect`를 사용하는 관계 테이블( `member` 가 참조하는 `CourseEnrollment` )에 _새로운_ 행을 만들어야 하기 때문입니다.

#### 유저를 생성하고 강좌와 relation 생성하기

이전 단계에서는 강좌생성과 테스트와 relation 생성 그리고 선생님 역할을 할당하는 것을 하였습니다. 이번 단계에서는 우리는 더 많은 유저를 생성하고 강좌와 학생으로써의 relation을 만들 것입니다.

다음과 같은 코드를 사용 할 것입니다.

```ts
const shakuntala = await prisma.user.create({
  data: {
    email: "devi@prisma.io",
    firstName: "Shakuntala",
    lastName: "Devi",
    courses: {
      create: {
        role: "STUDENT",
        course: {
          connect: { id: course.id },
        },
      },
    },
  },
});

const david = await prisma.user.create({
  data: {
    email: "david@prisma.io",
    firstName: "David",
    lastName: "Deutsch",
    courses: {
      create: {
        role: "STUDENT",
        course: {
          connect: { id: course.id },
        },
      },
    },
  },
});
```

#### 시험 결과를 학생에 추가하기

`TestReult` 모델을 보면 `student`, `gradedBy`, `test` 세 개의 relation이 존재합니다. Shakuntala 와 David에게 새로운 시험결과를 추가하기 위해 이전 단계와 유사하게 nested write를 사용 할 것입니다.

아래 참고 할 `TestReult` 모델이 있습니다

```javascript
model TestResult {
  id        Int      @default(autoincrement()) @id
  createdAt DateTime @default(now())
  result    Int // Percentage precise to one decimal point represented as `result * 10^-1`

  // Relation Fields
  studentId Int
  student   User @relation(name: "results", fields: [studentId], references: [id])
  graderId  Int
  gradedBy  User @relation(name: "graded", fields: [graderId], references: [id])
  testId    Int
  test      Test @relation(fields: [testId], references: [id])
}
```

한 개의 시험 결과를 다음과 같은 코드로 추가 해보겠습니다.

```ts
await prisma.testResult.create({
  data: {
    gradedBy: {
      connect: { email: grace.email },
    },
    student: {
      connect: { email: shakuntala.email },
    },
    test: {
      connect: { id: test.id },
    },
    result: 950,
  },
});
```

David와 Shakuntala에게 각각 세 개의 시험 결과를 추가하기 위해 다음과 같은 loop를 사용 할 수 있습니다.

```ts
const testResultsDavid = [650, 900, 950];
const testResultsShakuntala = [800, 950, 910];

let counter = 0;
for (const test of course.tests) {
  await prisma.testResult.create({
    data: {
      gradedBy: {
        connect: { email: grace.email },
      },
      student: {
        connect: { email: shakuntala.email },
      },
      test: {
        connect: { id: test.id },
      },
      result: testResultsShakuntala[counter],
    },
  });

  await prisma.testResult.create({
    data: {
      gradedBy: {
        connect: { email: grace.email },
      },
      student: {
        connect: { email: david.email },
      },
      test: {
        connect: { id: test.id },
      },
      result: testResultsDavid[counter],
    },
  });

  counter++;
}
```

축하합니다! 여기까지 하셨다면 당신은 유저, 강좌, 시험, 시험 결과의 샘플 데이터를 데이터베이스에 성공적으로 추가 한 것입니다.

만약 데이터베이스의 내용을 보고 싶다면, [Prisma Studio](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-studio)를 사용 할 수 있습니다. Prisma Studio는 데이터베이스를 시각화하여 편집 할 수 있게 해주는 도구입니다. Prisma Studio를 실행하려면 다음과 같은 명령어를 입력하세요

```
npx prisma studio --experimental
```

> _Note : Prisma Studio는 현재 실험 단계입니다._

### 시험 결과를 Prisma Client로 Aggregating(집계)하기

Prisma Client는 aggregate 동작을 `Int` 와 `Float` 같은 숫자형 필드를 이용하여 실행 할 수 있게 해줍니다. Aggregate 동작은 입력 값( ex. 여러 행의 테이블 )의 집합을 하나의 결과로 계산해줍니다. 예를 들어, `TestResult` 행 집합을 통해 `result` 열의 _minimum_, _maximum_, _average_ 를 계산하는 것이 있습니다.

이 단계에서는 두 가지의 aggregate 동작을 실행 해 볼 것입니다.

1. 한 **시험**에서, 모든 **학생**의 시험의 어려움과 시험 주제에 대한 수업의 이해를 나타내는 집계를 도출하기.

   ```ts
   for (const test of course.tests) {
     const results = await prisma.testResult.aggregate({
       where: {
         testId: test.id,
       },
       avg: { result: true },
       max: { result: true },
       min: { result: true },
       count: true,
     });
     console.log(`test: ${test.name} (id: ${test.id})`, results);
   }
   ```

   결과는 다음과 같습니다.

   ```javascript
   test: First test (id: 1) {
    avg: { result: 725 },
    max: { result: 800 },
    min: { result: 650 },
    count: 2
   }
   test: Second test (id: 2) {
    avg: { result: 925 },
    max: { result: 950 },
    min: { result: 900 },
    count: 2
   }
   test: Final exam (id: 3) {
    avg: { result: 930 },
    max: { result: 950 },
    min: { result: 910 },
    count: 2
   }
   ```

2. 각 **학생**의, 모든 **시험**에서의 집계의 결과를 도출학기

   ```ts
   // Get aggregates for David
   const davidAggregates = await prisma.testResult.aggregate({
     where: {
       student: { email: david.email },
     },
     avg: { result: true },
     max: { result: true },
     min: { result: true },
     count: true,
   });
   console.log(`David's results (email: ${david.email})`, davidAggregates);

   // Get aggregates for Shakuntala
   const shakuntalaAggregates = await prisma.testResult.aggregate({
     where: {
       student: { email: shakuntala.email },
     },
     avg: { result: true },
     max: { result: true },
     min: { result: true },
     count: true,
   });
   console.log(
     `Shakuntala's results (email: ${shakuntala.email})`,
     shakuntalaAggregates
   );
   ```

   결과는 다음과 같습니다

   ```
   David's results (email: david@prisma.io) {
    avg: { result: 833.3333333333334 },
    max: { result: 950 },
    min: { result: 650 },
    count: 3
   }
   Shakuntala's results (email: devi@prisma.io) {
    avg: { result: 886.6666666666666 },
    max: { result: 950 },
    min: { result: 800 },
    count: 3
   }
   ```

### 요약 그리고 다음 단계

이 포스트는 문제 영역부터 시작하여 데이터 모델링, Prisma Schema, Prisma Migrate를 통한 데이터베이스 마이그레이션, 그리고 Prisma Client를 통한 CRUD 및 Aggreation을 다루었습니다.

코드를 작성하기 전에 문제 영역을 맵핑하는 것은 좋은 방법입니다. 왜냐하면 이 방법은 백엔드의 모든 측면에서 데이터 모델의 설계를 디자인 하는 것에 도움을 주기 때문입니다.

Prisma는 관계형 데이터베이스와의 작업을 쉽게 하는 것을 목표로 하지만, 기초적인 데이터베이스에 대한 이해를 더 깊게 할 수 있도록 도와 줄 것 입니다.

Prisma Data Guide를 통해 데이터베이스의 작동 방식, 올바른 데이터베이스를 선택하고 응용프로그램에 더 효과적으로 데이터베이스를 사용하는 방법을 배우세요.

다음 파트에서는 아래와 같은 사항을 더 배울 것 입니다.

- API layer
- Validation ( 검증 )
- Testing ( 테스트 )
- Authentication ( 인증 )
- Authorization ( 권한 부여 )
- Integration with external APIs ( 외부 API들과 통합)
- Deployment ( 배포 )
