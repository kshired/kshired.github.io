---
layout: post
title: "Certbot으로 SSL 설정하기"
subtitle: "This is a subtitle"
date: 2020-09-07
author: "Kshired"
header-style: text
tags:
---

Ubuntu에서 Certbot을 이용하여 SSL을 설정하는 법을 알아봅시다.

### 1. PPA추가

레포지토리 리스트에 Certbot PPA를 추가해봅시다.

```bash
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
```

### 2. 설치

```bash
sudo apt-get install certbot python-certbot-nginx
```

### 3. NginX 기반으로 Certbot 설정

nginx로 리버스 프록시를 이용하고 있다면 아래와 같이 진행하면 됩니다.

```bash
sudo certbot --nginx
```

위 명령어를 입력하고 나서 certbot에서 나오는 질문을 차례로 대답하면서 설정해주시면 됩니다.

### 4. UFW 설정하기

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

#### 끝!

이거 처음에 설정 할 때, ssh를 ufw로 allow 해주지 않아서 서버가 잠겨서 아무것도 못했다는 건 안비밀..
