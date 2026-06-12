# 將 Snapcart - D盻ｱ ﾃ｡n Thﾆｰﾆ｡ng m蘯｡i ﾄ進盻㌻ t盻ｭ thﾃｴng minh

D盻ｱ ﾃ｡n website thﾆｰﾆ｡ng m蘯｡i ﾄ訴盻㌻ t盻ｭ tﾃｭch h盻｣p tr盻｣ lﾃｽ mua s蘯ｯm AI (RAG), c盻貧g thanh toﾃ｡n t盻ｱ ﾄ黛ｻ冢g qua SePay, t蘯｣i 蘯｣nh lﾃｪn Cloudinary vﾃ h盻・th盻創g g盻ｭi Email qua Resend. H盻・th盻創g s盻ｭ d盻･ng ki蘯ｿn trﾃｺc phﾃ｢n tﾃ｡ch rﾃｵ rﾃng gi盻ｯa Backend (Spring Boot) vﾃ Frontend (ReactJS).

*   **Website Demo:** [https://snap-cart.app](https://snap-cart.app)

---

## 噫 Hﾆｰ盻嬾g d蘯ｫn kh盻殃 ch蘯｡y d盻ｱ ﾃ｡n (Quick Start)

### Cﾃ｡ch 1: Ch蘯｡y b蘯ｱng Docker Compose (Khuyﾃｪn dﾃｹng - Nhanh nh蘯･t)
B蘯｡n khﾃｴng c蘯ｧn cﾃi ﾄ黛ｺｷt Java hay Node.js trﾃｪn mﾃ｡y cﾃ｡ nhﾃ｢n, ch盻・c蘯ｧn cﾃi ﾄ黛ｺｷt **Docker Desktop**.

1.  M盻・terminal t蘯｡i thﾆｰ m盻･c g盻祖 c盻ｧa d盻ｱ ﾃ｡n (nﾆ｡i ch盻ｩa file `docker-compose.yml`).
2.  Ch蘯｡y l盻㌻h kh盻殃 t蘯｡o vﾃ xﾃ｢y d盻ｱng container:
    ```bash
    docker-compose up --build
    ```
3.  Docker s蘯ｽ t盻ｱ ﾄ黛ｻ冢g t蘯｡o cﾆ｡ s盻・d盻ｯ li盻㎡ MySQL, build 盻ｩng d盻･ng Spring Boot vﾃ ch蘯｡y giao di盻㌻ ReactJS.
    *   **Frontend:** `http://localhost:5173`
    *   **Backend API:** `http://localhost:8080`
    *   **MySQL Database:** C盻貧g `3306` c盻ｧa localhost.

---

### Cﾃ｡ch 2: Ch蘯｡y tr盻ｱc ti蘯ｿp t盻ｫ mﾃ｣ ngu盻渡 (Yﾃｪu c蘯ｧu cﾃi ﾄ黛ｺｷt Java 21+ vﾃ Node.js 18+)

#### Bﾆｰ盻嫩 1: Kh盻殃 ﾄ黛ｻ冢g Database
*   T蘯｡o database MySQL cﾃｳ tﾃｪn `ecom_db` trﾃｪn localhost ho蘯ｷc cloud.
*   C蘯ｭp nh蘯ｭt thﾃｴng s盻・k蘯ｿt n盻訴 trong `application.properties`.

#### Bﾆｰ盻嫩 2: Ch蘯｡y Backend
M盻・terminal t蘯｡i thﾆｰ m盻･c `backend` vﾃ ch蘯｡y l盻㌻h:
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
chmod +x mvnw
./mvnw spring-boot:run
```
*   *Backend s蘯ｽ kh盻殃 ch蘯｡y 盻・c盻貧g `8080`. Tﾃi li盻㎡ API Swagger cﾃｳ th盻・truy c蘯ｭp t蘯｡i: `http://localhost:8080/swagger-ui/index.html`*

#### Bﾆｰ盻嫩 3: Ch蘯｡y Frontend
M盻・terminal m盻嬖 t蘯｡i thﾆｰ m盻･c `frontend` vﾃ ch蘯｡y l盻㌻h:
```bash
npm install
npm run dev
```
*   *Frontend s蘯ｽ kh盻殃 ch蘯｡y 盻・c盻貧g `5173`. B蘯｡n truy c蘯ｭp 盻ｩng d盻･ng t蘯｡i `http://localhost:5173`*

---

## 笞呻ｸ・C蘯･u hﾃｬnh mﾃｴi trﾆｰ盻拵g (Environment Variables)

### 1. Backend (`backend/src/main/resources/application.properties`)
Trﾆｰ盻嫩 khi ch蘯｡y backend, b蘯｡n c蘯ｧn c蘯･u hﾃｬnh cﾃ｡c thﾃｴng s盻・k蘯ｿt n盻訴 ho蘯ｷc thi蘯ｿt l蘯ｭp qua cﾃ｡c bi蘯ｿn mﾃｴi trﾆｰ盻拵g:

```properties
# MySQL Connection (Ch蘯｡y Local ho蘯ｷc cloud)
spring.datasource.url=jdbc:mysql://localhost:3306/ecom_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

# JWT Configuration
ecommerce.app.jwtSecret=SnapcartSecretKeyForJWTEncryption2026SnapcartSecretKeyForJWTEncryption2026
ecommerce.app.jwtExpirationMs=86400000

# Gemini AI API (C蘯ｧn thi蘯ｿt cho tr盻｣ lﾃｽ 蘯｣o mua s蘯ｯm)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Google OAuth2 (ﾄ斉ハg nh蘯ｭp Google)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Cloudinary (Qu蘯｣n lﾃｽ hﾃｬnh 蘯｣nh)
cloudinary.cloud-name=YOUR_CLOUDINARY_CLOUD_NAME
cloudinary.api-key=YOUR_CLOUDINARY_API_KEY
cloudinary.api-secret=YOUR_CLOUDINARY_API_SECRET

# Resend Email (Thﾃｴng bﾃ｡o ﾄ柁｡n hﾃng)
RESEND_API_KEY=YOUR_RESEND_API_KEY
RESEND_FROM_EMAIL=no-reply@yourdomain.com

# SePay Webhook Key (ﾄ雪ｻ・xﾃ｡c th盻ｱc thanh toﾃ｡n an toﾃn)
SEPAY_WEBHOOK_API_KEY=YOUR_SEPAY_WEBHOOK_API_KEY
```

### 2. Frontend (`frontend/.env`)
T蘯｡o file `.env` trong thﾆｰ m盻･c `frontend` vﾃ c蘯･u hﾃｬnh:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
VITE_API_URL=http://localhost:8080/api
VITE_BANK_NAME=MB
VITE_BANK_ACC=0368163301
```
*(Thay th蘯ｿ ngﾃ｢n hﾃng vﾃ s盻・tﾃi kho蘯｣n nh蘯ｭn ti盻］ th盻ｱc t蘯ｿ khi ch蘯｡y th盻ｭ thanh toﾃ｡n QR)*

---

## 屏・・Cﾃｴng ngh盻・& H蘯｡ t蘯ｧng s盻ｭ d盻･ng

### 1. Cﾃｴng ngh盻・c盻奏 lﾃｵi
*   **Backend:** Spring Boot 3.2.4, Spring Security, Spring Data JPA, JWT (JSON Web Token), Lombok, Swagger/OpenAPI.
*   **Frontend:** ReactJS 19 (Vite), Tailwind CSS, Framer Motion, React Icons, Axios, React Router.
*   **Database:** MySQL (lﾆｰu tr盻ｯ thﾃｴng tin ngﾆｰ盻拱 dﾃｹng, ﾄ柁｡n hﾃng, s蘯｣n ph蘯ｩm).

### 2. Tﾃｭch h盻｣p bﾃｪn th盻ｩ ba (Third-party Services)
*   **Gemini AI (Cﾆ｡ ch蘯ｿ RAG):** Tﾃｭch h盻｣p Gemini 2.5 Flash thﾃｴng qua API ﾄ黛ｻ・tﾆｰ v蘯･n s蘯｣n ph蘯ｩm thﾃｴng minh d盻ｱa trﾃｪn d盻ｯ li盻㎡ s蘯｣n ph蘯ｩm th盻ｱc t蘯ｿ ﾄ柁ｰ盻｣c ﾄ黛ｻ渡g b盻・(ﾄ黛ｻ皇 t盻ｫ file `docs/products.jsonl`).
*   **SePay (Thanh toﾃ｡n t盻ｱ ﾄ黛ｻ冢g):** T盻ｱ ﾄ黛ｻ冢g t蘯｡o mﾃ｣ QR VietQR (thﾃｴng qua c盻貧g SePay), b蘯ｯt webhook ph蘯｣n h盻妬 t盻ｫ SePay ﾄ黛ｻ・c蘯ｭp nh蘯ｭt tr蘯｡ng thﾃ｡i ﾄ柁｡n hﾃng ngay khi khﾃ｡ch hﾃng chuy盻ハ kho蘯｣n thﾃnh cﾃｴng.
*   **Cloudinary:** Lﾆｰu tr盻ｯ vﾃ qu蘯｣n lﾃｽ hﾃｬnh 蘯｣nh s蘯｣n ph蘯ｩm t蘯｣i lﾃｪn t盻ｫ Admin Dashboard.
*   **Resend Email:** G盻ｭi email t盻ｱ ﾄ黛ｻ冢g thﾃｴng bﾃ｡o ﾄ柁｡n hﾃng vﾃ xﾃ｡c th盻ｱc tﾃi kho蘯｣n.

### 3. H蘯｡ t蘯ｧng & Deploy
*   **Backend:** Deploy lﾃｪn **Railway** (k蘯ｿt n盻訴 tr盻ｱc ti蘯ｿp v盻嬖 database MySQL lﾆｰu tr盻ｯ trﾃｪn mﾃ｢y).
*   **Frontend:** Deploy lﾃｪn **Vercel** ﾄ黛ｻ・t盻訴 ﾆｰu hﾃｳa t盻祖 ﾄ黛ｻ・t蘯｣i trang toﾃn c蘯ｧu vﾃ SSL mi盻・ phﾃｭ.
*   **Containerization:** H盻・tr盻｣ **Docker & Docker Compose** giﾃｺp kh盻殃 ch蘯｡y toﾃn b盻・d盻ｱ ﾃ｡n (Database + Backend + Frontend) ch盻・v盻嬖 1 cﾃ｢u l盻㌻h duy nh蘯･t.

---

## 搭 Phﾃ｢n chia cﾃｴng vi盻㌘ (Thﾃnh viﾃｪn nhﾃｳm)

### 1. ﾄ雪ｻｩc - Backend Security, Infrastructure & AI Integration
*   **AI Shopping Assistant:** Tﾃｭch h盻｣p Gemini/OpenAI API, xﾃ｢y d盻ｱng cﾆ｡ ch蘯ｿ **RAG (Retrieval-Augmented Generation)** ﾄ黛ｻ・AI tﾆｰ v蘯･n s蘯｣n ph蘯ｩm d盻ｱa trﾃｪn d盻ｯ li盻㎡ t盻ｫ Database.
*   **Security:** Thi蘯ｿt l蘯ｭp h盻・th盻創g JWT, mﾃ｣ hﾃｳa m蘯ｭt kh蘯ｩu, phﾃ｢n quy盻］ Role-based (Admin/User).
*   **Email:** Tﾃｭch h盻｣p d盻議h v盻･ g盻ｭi Mail (Resend/Nodemailer) ﾄ黛ｻ・xﾃ｡c th盻ｱc tﾃi kho蘯｣n vﾃ bﾃ｡o ﾄ柁｡n hﾃng.
*   **Infrastructure:** Ch盻ｧ trﾃｬ c蘯･u hﾃｬnh mﾃｴi trﾆｰ盻拵g **Railway** cho Backend, qu蘯｣n lﾃｽ bi蘯ｿn mﾃｴi trﾆｰ盻拵g (Env).
*   **Payment Logic:** Vi蘯ｿt API Webhook/IPN ﾄ黛ｻ・nh蘯ｭn k蘯ｿt qu蘯｣ thanh toﾃ｡n t盻ｫ SePay/Momo vﾃ c蘯ｭp nh蘯ｭt ﾄ柁｡n hﾃng.

### 2. Sﾆ｡n - Backend Core & Payment SDK
*   **Database:** Thi蘯ｿt l蘯ｭp c蘯･u trﾃｺc MySQL trﾃｪn Railway, t盻訴 ﾆｰu hﾃｳa Index vﾃ cﾃ｡c cﾃ｢u truy v蘯･n ph盻ｩc t蘯｡p.
*   **Payment SDK:** Tﾃｭch h盻｣p SDK SePay/QR ﾄ黛ｻ・t蘯｡o mﾃ｣ thanh toﾃ｡n chuy盻ハ kho蘯｣n nhanh.
*   **Order Service:** Vi蘯ｿt API x盻ｭ lﾃｽ logic ﾄ黛ｺｷt hﾃng, tﾃｭnh phﾃｭ v蘯ｭn chuy盻ハ vﾃ ﾃ｡p d盻･ng mﾃ｣ gi蘯｣m giﾃ｡.
*   **User API:** Vi蘯ｿt cﾃ｡c API qu蘯｣n lﾃｽ thﾃｴng tin cﾃ｡ nhﾃ｢n khﾃ｡ch hﾃng.

### 3. Tu蘯･n - Main UI & Fullstack Module 1
*   **Frontend Home:** Code giao di盻㌻ Trang ch盻ｧ (Banner, Hero Section, S蘯｣n ph蘯ｩm n盻品 b蘯ｭt).
*   **Frontend Shop:** Code trang danh sﾃ｡ch s蘯｣n ph蘯ｩm (Product Listing) vﾃ logic g盻絞 d盻ｯ li盻㎡ t盻ｫ API.
*   **Fullstack Product:** Ch盻丘 trﾃ｡ch nhi盻㍊ c蘯｣ API Backend vﾃ Giao di盻㌻ Frontend cho ph蘯ｧn qu蘯｣n lﾃｽ s蘯｣n ph蘯ｩm (CRUD).
*   **Vercel:** C蘯･u hﾃｬnh vﾃ qu蘯｣n lﾃｽ vi盻㌘ deploy Frontend lﾃｪn Vercel.

### 4. Duy - Shopping Flow & Fullstack Module 2
*   **Shopping UI:** Code giao di盻㌻ trang Chi ti蘯ｿt s蘯｣n ph蘯ｩm, Gi盻・hﾃng vﾃ trang Thanh toﾃ｡n (Checkout).
*   **Frontend Logic:** Qu蘯｣n lﾃｽ State toﾃn c盻･c, logic c盻冢g d盻渡 gi盻・hﾃng.
*   **Admin Dashboard:** Code giao di盻㌻ qu蘯｣n tr盻・(B蘯｣ng ﾄ訴盻「 khi盻ハ doanh thu, qu蘯｣n lﾃｽ ﾄ柁｡n hﾃng).
*   **Fullstack Category:** Ch盻丘 trﾃ｡ch nhi盻㍊ c蘯｣ API Backend vﾃ Giao di盻㌻ Frontend cho ph蘯ｧn qu蘯｣n lﾃｽ danh m盻･c (Category).

### 5. Vi盻㏄ Anh - UI Static & UX Enhancement
*   **AI UI:** Thi蘯ｿt k蘯ｿ giao di盻㌻ khung chat (Chat bubble) vﾃ giao di盻㌻ tin nh蘯ｯn AI mﾆｰ盻｣t mﾃ.
*   **Static Pages:** Code giao di盻㌻ trang ﾄ斉ハg nh蘯ｭp/ﾄ斉ハg kﾃｽ, Contact, About Us, Footer vﾃ trang 404.
*   **UX Components:** Xﾃ｢y d盻ｱng h盻・th盻創g **Toast Notifications** vﾃ **Loading Skeletons** cho toﾃn b盻・web.
*   **Search & Filter UI:** Code giao di盻㌻ Thanh tﾃｬm ki蘯ｿm vﾃ Sidebar l盻皇 s蘯｣n ph蘯ｩm (Visual).
*   **SEO & Support:** T盻訴 ﾆｰu Meta tags, 蘯｣nh. Nh蘯ｭp li盻㎡ d盻ｯ li盻㎡ m蘯ｫu vﾃ vi蘯ｿt bﾃ｡o cﾃ｡o d盻ｱ ﾃ｡n.

---
*C蘯ｭp nh蘯ｭt l蘯ｧn cu盻訴 chu蘯ｩn b盻・n盻冪 bﾃi: 11/06/2026*
