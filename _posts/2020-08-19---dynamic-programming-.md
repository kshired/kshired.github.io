---
layout: post
title: "동적계획법 ( Dynamic Programming )"
subtitle: "메모하며 풀기"
date: 2020-08-19
author: "Kshired"
mathjax: true
header-style: text
tags:
  - Algorithms
  - DP
---

### 동적 계획법 ( Dynamic Programming )

다이나믹 프로그래밍은 이름이 왜 이렇게 붙은 지 잘모르겠지만, 실제로 문제를 "다이나믹"하게 해결하는 방법은 아닌 것 같다.. "메모하며 풀기", "기억하며 풀기"가 더 맞는 번역인듯..

어쨌든, 동적 계획법의 접근방식은

1. 주어진 문제를 부분 문제로 단순화 시킨다.
2. 점화식을 만든다
3. 이미 해결 한 작은 문제를 이용하여 전체 문제에 사용하여 속도를 높인다.

> 즉, 주어진 문제를 부분 문제로 나누고 한 번만 계산하고 저장해서 저장해둔 정답을 바로 산출하는 것이다.

### 피보나치 수열을 이용한 이해

#### 재귀적인 방법을 이용 한 구현

피보나치 수열은 아래와 같이 정의된다.

![fibo](/img/fibo.png)

이 피보나치 수열을 그냥 재귀적으로 구현하면 아래와 같다.

```python
def fibo(n):
    if n==0 or n==1:
        return n
    else:
        return fibo(n-1)+fibo(n-2)
```

이 때, 이렇게 재귀적으로 함수를 구현하게 되면 아래와 같은 예시에서 fibo(4)값을 구하기 위해 총 9번이나 재귀적으로 함수를 호출하게 되는 것이다.

```text
1. fibo(4)를 구하기 위해서 fibo(3)과 fibo(2)를 구함
2. fibo(4)에서 호출된 fibo(3)을 구하기 위해서 fibo(2)와 fibo(1)을 호출
3. fibo(3)에서 호출된 fibo(2)를 구하기 위해서 fibo(1)과 fibo(0)을 호출
4. fibo(4)에서 호출된 fibo(2)를 구하기 위해서 fibo(1)와 fibo(0)을 호출
```

지금은 9번이라는 숫자가 작다고 느껴 질 수 있겠지만, fibo(n)에서 n이 조금만 커져도 호출 되는 횟수가 말도 안되게 커지는 걸 알 수 있을 것이다.

그래서 이렇게 숫자가 조금이라도 커지게 되면 메모리에 스택오버플로우가 생기고 시간도 낭비하게 된다. 이런 낭비를 줄이기 위해, 다이나믹 프로그래밍을 사용하는 것이다.

#### 다이나믹 프로그래밍을 이용해 구현

다이나믹 프로그래밍 방법을 이용해 구현하면 아래와 같다.

```python
dp = [0 for _ in range(101)] # Memo를 할 dp 리스트 생성
dp[1] = 1 # fibo(1) 값 정의
def fibo(n):
    if n<=1:  # 0,1번째 피보나치 수는 자기 자신
        return n
    elif dp[n]!=0:  # 이미 피보나치 수를 구했다면 재귀하지않고 바로 리턴
        return dp[n]
    dp[n] = fibo(n-1)+fibo(n-2) # 값을 구하기 위해 부분 문제로 분할
        return dp[n]
```

이렇게 구현해 놓으면 fibo(n)을 호출 할 때, 이미 구해놓은 값은 재귀적으로 호출 할 필요 없이 바로 배열값에서 전달해주기때문에 시간 복잡도를 줄일 수 있다.

### 예제 풀어보기

#### 백준 1003 피보나치 함수

fibo 함수에서 0과 1이 호출 되는 횟수를 구하라고 되어있다.

그런데, 결국 fibo 함수자체가 피보나치 함수와 같은 동작을 하기 때문에 fibo(n)이 출력하는 0과 1의 횟수를 담은 이차원 리스트 dp[n] = dp[n-1]+dp[n-2]이다.

이걸 코드로 구현해보자.

```python
import sys
dp = [[0,0] for _ in range(41)] # 0과 1의 갯수를 담는 dp 배열
dp[0] = [1,0] # fibo(0)은 0을 1개 1을 0개
dp[1] = [0,1] # fibo(1)은 1을 1개 0을 0개

for i in range(2,41): # 문제에서 n은 40이하라고 했으니 전부 미리 구해놓자.
    dp[i][0] = dp[i-1][0] + dp[i-2][0]
    dp[i][1] = dp[i-1][1] + dp[i-2][1]
    # dp[n]은 dp[n-1]과 dp[n-2]의 요소를 각각 더한 것이니 위와같이 구현

sys.stdin.readline()
for line in sys.stdin.readlines():
    n = int(line)
    print(dp[n][0],dp[n][1])

```

#### 백준 1904 01타일

이것도 점화식을 뚝딱 뚝딱 구해보면
dp[n] = dp[n-1] + dp[n-2] 가 나온다.

그냥 이대로 코드로 구현하면

```python
import sys
n = int(sys.stdin.readline())
dp = [0 for _ in range(n+1)]
dp[1] = 1
dp[2] = 2
for i in range(3,n+1):
    dp[i] = (dp[i-1]+dp[i-2])%15746 # 15746으로 안나눠주다가 숫자가 너무 커져서 메모리가 터질 수 있으니 미리미리 나눠주자.
print(dp[n]%15746)
```

#### 여담

이 알고리즘은 계속 풀면서 bottom-up이던 top-down이던 여러가지 방법으로 구현하고, 점화식을 찾는게 중요한 것 같다.
