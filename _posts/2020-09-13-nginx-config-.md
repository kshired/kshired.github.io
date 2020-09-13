---
layout: post
title: 'Nginx config 설정하기'
subtitle: 'setting'
date: 2020-09-13
author: 'Kshired'
header-style: text
tags:
  - devlog
  - setting
  - ssl
  - nginx
---

![Nginx](/img/NGINX.png)

SSL이 적용 된 하나의 서버에서 backend와 frontend를 모두 구동하기 설정하는 방법 정리.

### 설정하기

#### Nginx conf 파일 설정

자신의 nginx conf 파일에 들어가서 add_heder와 try_files 설정 및 api서버의 proxy 설정을 해준다.

```bash
server{
    # certbot으로 설정한 SSL
    # certbot이 자동으로 설정해줌.
    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    ssl_certificate [ ssl pem location ];
    ssl_certificate_key [ ssl certificate key location ];
    include [ ssl nginx conf location ];
    ssl_dhparam [ ssl dhparm location ];

    root /var/www/test/dist; # 빌드 한 front 파일 dist

    index index.html;

    server_name [ IP or Domain ];

    location / {
        add_header 'Access-Control-Allow-Origin' '*'; #CORS를 위한 설정
        try_files $uri $uri/ /index.html; # Router를 이용 할 시 index를 제외 한 파일을 찾을 때 나는 오류를 방지.
    }

    location /api {
        proxy_pass http://localhost:[ PORT ]/api; # api를 요청 할 때 proxy pass.
    }
}
server{
    # certbot 자동 설정
    # http로 접속했을 경우 https로 자동 redirection
    if($host=[IP or Domain]){
      return 301 https://$host$request_uri;
    }

    listen [::]:80;
    listen 80;

    server_name [ IP or Domain ]
    return 404;
}
```

#### Nginx Restart

nginx의 conf 파일을 수정한다고, 바로 반영되지 않음으로 아래 명령어를 이용하여 nginx를 restart해준다.

```bash
sudo systemctl restart nginx.service
```

만약 위 명령어를 실행 후 nginx의 status가 fail로 나온다면, `;`를 빼먹었는지 혹은 오타가 있는 지 확인.
