# GreatCatsby-BackEnd

<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white"/> <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=Express&logoColor=white"/>

<br>

## 👋 소개

위대한캣츠비 프로젝트 백엔드입니다.

<br>

## 👥 멤버

| ![bm](./readmeImg/members/bm.jpeg)                                  | ![wy](./readmeImg/members/wy.png)                               | ![hj](./readmeImg/members/hj.jpeg)                               | ![sg](./readmeImg/members/sg.png)                              | ![cm](./readmeImg/members/cm.jpeg)                                |
| ------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| <div align="center">[이병민](https://github.com/ByeongminLee)</div> | <div align="center">[김우영](https://github.com/0x000613)</div> | <div align="center">[노희재](https://github.com/heejj1206)</div> | <div align="center">[이슬기](https://github.com/abcabcp)</div> | <div align="center">[전찬민](https://github.com/cksals3753)</div> |

<br>

## 🗂️ API

### Admins

| API                                                                                                                                               | Request              | Response                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------- |
| <img src="https://img.shields.io/badge/%7F%20%20GET%20%20%20%7F-/admins/all-e1e1e1?labelColor=46C487&style=flat-square" height="25"/>             | none                 | user_id, email, name, tel, status, reg_date |
| <img src="https://img.shields.io/badge/%7F%20%20POST%20%7F-/admins/login-e1e1e1?labelColor=219BFD&style=flat-square" height="25"/>                | email, password      | none                                        |
| <img src="https://img.shields.io/badge/%7F%20%20PUT%20%20%20%7F-/admins/edit/:user_id-e1e1e1?labelColor=F89331&style=flat-square" height="25"/>   | user_id, email, name | none                                        |
| <img src="https://img.shields.io/badge/%7F%20%20PUT%20%20%20%7F-/admims/getout/:user_id-e1e1e1?labelColor=F89331&style=flat-square" height="25"/> | user_id              | none                                        |

### Members

| <div style="width:250px">API</div>                                                                                                                 | Request                                    | Response                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| <img src="https://img.shields.io/badge/%7F%20%20GET%20%20%20%7F-/members/all-e1e1e1?labelColor=46C487&style=flat-square" height="25"/>             | none                                       | user_id, email, name, tel, result, status, reg_date |
| <img src="https://img.shields.io/badge/%7F%20%20GET%20%20%20%7F-/members/address/:userid-e1e1e1?labelColor=46C487&style=flat-square" height="25"/> | user_id, name, tel, addr1, addr2, reg_date | none                                                |
| <img src="https://img.shields.io/badge/%7F%20%20POST%20%7F-/members/join-e1e1e1?labelColor=219BFD&style=flat-square" height="25"/>                 | email, password, name                      | none                                                |
| <img src="https://img.shields.io/badge/%7F%20%20POST%20%7F-/members/edit/:user_id-e1e1e1?labelColor=219BFD&style=flat-square" height="25"/>        | user_id, email, name, tel                  | none                                                |
| <img src="https://img.shields.io/badge/%7F%20%20POST%20%7F-/members/getout/:user_id-e1e1e1?labelColor=219BFD&style=flat-square" height="25"/>      | user_id                                    | none                                                |
| <img src="https://img.shields.io/badge/%7F%20%20POST%20%7F-/members/newaddr/:userid-e1e1e1?labelColor=219BFD&style=flat-square" height="25"/>      | user_id, tel, addr1, addr2, name           | none                                                |

### Orders

| <div style="width:250px">API</div>                                                                                                                  | Request                                                  | Response                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://img.shields.io/badge/%7F%20%20GET%20%20%20%7F-/orders/:user_id/:prod_id-e1e1e1?labelColor=46C487&style=flat-square" height="25"/> | userid, prodid                                           | order_id, user_id, prod_id                                                                                                            |
| <img src="https://img.shields.io/badge/%7F%20%20GET%20%20%20%7F-/orders/all-e1e1e1?labelColor=46C487&style=flat-square" height="25"/>               | none                                                     | orders.order_id, orders.order_price, order_date, orders.order_status, members.name, members.email, products.name, products.info_photo |
| <img src="https://img.shields.io/badge/%7F%20%20POST%20%7F-/orders/post-e1e1e1?labelColor=219BFD&style=flat-square" height="25"/>                   | order_price, order_select, order_count, prod_id, user_id | none                                                                                                                                  |
| <img src="https://img.shields.io/badge/%7F%20%20PUT%20%20%20%7F-/orders/:order_id-e1e1e1?labelColor=F89331&style=flat-square" height="25"/>         | order_id, order_date, order_price, order_status          | none                                                                                                                                  |

### Products

| <div style="width:250px">API</div>                                                                                                           | Request                                                                     | Response                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://img.shields.io/badge/%7F%20%20GET%20%20%20%7F-/products/all-e1e1e1?labelColor=46C487&style=flat-square" height="25"/>      | none                                                                        | prod_id, name, stock, status, price, category, thumbnail_photo, info_photo, prod_info, prod_feature, reg_date, review_count, stars_avg |
| <img src="https://img.shields.io/badge/%7F%20%20GET%20%20%20%7F-/products/:proid-e1e1e1?labelColor=46C487&style=flat-square" height="25"/>   | prod_id                                                                     | prod_id, name, stock, status, price, category, thumbnail_photo, info_photo, prod_info, prod_feature, reg_date, review_count, stars_avg |
| <img src="https://img.shields.io/badge/%7F%20%20GET%20%20%20%7F-/products/main-e1e1e1?labelColor=46C487&style=flat-square" height="25"/>     | none                                                                        | prod_id, name, stock, status, price, category, thumbnail_photo, info_photo, prod_info, prod_feature, reg_date, review_count, stars_avg |
| <img src="https://img.shields.io/badge/%7F%20%20POST%20%7F-/products-e1e1e1?labelColor=219BFD&style=flat-square" height="25"/>               | name, stock, price, category, thumImage, infoImage, prod_info, prod_feature | none                                                                                                                                   |
| <img src="https://img.shields.io/badge/%7F%20%20PUT%20%20%20%7F-/products/:prod_id-e1e1e1?labelColor=F89331&style=flat-square" height="25"/> | prod_id, name, stock, status                                                | none                                                                                                                                   |

### Reviews

| <div style="width:250px">API</div>                                                                                                       | Request                             | Response                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| <img src="https://img.shields.io/badge/%7F%20%20GET%20%20%20%7F-/review/admin-e1e1e1?labelColor=46C487&style=flat-square" height="25"/>  | none                                | r.review_id, name, m.email, r.review_text, r.stars, write_date                           |
| <img src="https://img.shields.io/badge/%7F%20%20GET%20%20%20%7F-/review/:proid-e1e1e1?labelColor=46C487&style=flat-square" height="25"/> | prod_id                             | r.review_id, m.email, p.name, m.name, r.review_text, r.stars, write_date, r.review_photo |
| <img src="https://img.shields.io/badge/%7F%20%20POST%20%7F-/reviews/write-e1e1e1?labelColor=219BFD&style=flat-square" height="25"/>      | review_text, review_photo, order_id | none                                                                                     |
| <img src="https://img.shields.io/badge/DELETE-/reviews/del/:review_id-e1e1e1?labelColor=F52E39&style=flat-square" height="25"/>          | review_id                           | none                                                                                     |

<br>

## ⚙️ 파일 구조

```
├── README.md
├── _files
│   └── _logs
├── app.js
├── controllers
│   ├── Admins.js
│   ├── Members.js
│   ├── Orders.js
│   ├── Products.js
│   └── Reviews.js
├── exceptions
│   ├── BadRequestException.js
│   ├── PageNotFoundException.js
│   └── RuntimeException.js
├── helper
│   ├── FileHelper.js
│   ├── LogHelper.js
│   ├── RegexHelper.js
│   ├── UtilHelper.js
│   ├── WebHelper.js
│   ├── \_config.js
│   └── key.json
├── hook.sh
├── package-lock.json
├── package.json
├── public
│   └── favicon.png
├── resource
│   └── Dump.sql
└── webhook.js
```
