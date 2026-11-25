# VectorGallery — Local Development & Server Setup

This guide walks you through running the complete VectorGallery stack locally.

---

## 1. Prerequisites

- **Node.js**: v18+ (tested on Node v26)
- **npm**: v9+ (tested on npm v11)
- **Flutter SDK**: v3.16+ (tested on Flutter 3.24.5 / Dart 3.5.4)
- **Git**

---

## 2. Web Application Setup

1. **Clone & Install Dependencies:**
   ```bash
   git clone https://github.com/krishsoni15/VectorGallery.git
   cd VectorGallery
   npm install --legacy-peer-deps
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   ```
   Set `CREDENTIAL_ENCRYPTION_KEY` using:
   ```bash
   openssl rand -hex 32
   ```

3. **Run Test Suites:**
   ```bash
   npm test
   ```
   Runs 48 tests across 8 test suites.

4. **Start Web Development Server:**
   ```bash
   npm run dev
   ```
   Access the dashboard at `http://localhost:3000`.

---

## 3. Asynchronous Background Worker Setup

To process large uploads, background OCR, and vector embeddings asynchronously:
```bash
npm run worker
```
The worker polls `files` with `processing_status = 'PENDING'` every 5 seconds.

---

## 4. Flutter Mobile Setup

1. **Navigate to mobile package:**
   ```bash
   cd mobile
   ```

2. **Fetch dependencies:**
   ```bash
   flutter pub get
   ```

3. **Run static analysis & tests:**
   ```bash
   flutter analyze
   flutter test
   ```

4. **Launch on connected Android or iOS device:**
   ```bash
   flutter run
   ```
   *Note: On Android emulator, the default backend URL `http://10.0.2.2:3000` is used automatically.*

