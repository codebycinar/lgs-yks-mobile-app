# LGS/YKS Mobile App

LGS ve YKS Eğitim Platformu Mobil Uygulaması

## 🚀 Teknoloji Stack

- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type safety
- **React Native Paper** - Material Design components
- **React Navigation** - Navigation library
- **React Native Vector Icons** - Icon library
- **AsyncStorage** - Local storage
- **Axios** - HTTP client

## ✨ Özellikler

- ✅ Telefon numarası ile kimlik doğrulama
- ✅ SMS doğrulama sistemi
- ✅ Kullanıcı profil yönetimi
- ✅ Dashboard ve istatistikler
- ✅ Ders ve konu haritası
- ✅ İlerleme takibi ("Konuyu Öğrendim")
- ✅ Hedef belirleme ve takibi
- ✅ Haftalık program oluşturma
- ✅ Günlük görev yönetimi
- ✅ Responsive tasarım
- ✅ Material Design 3

## 🛠 Kurulum

### Prerequisites
- Node.js 18+
- React Native CLI
- Android Studio (Android için)
- Xcode (iOS için)

### Dependencies
```bash
# Dependencies install
npm install

# iOS pods install (sadece iOS için)
cd ios && pod install
```

### Development

```bash
# Metro server başlat
npm start

# Android emulator
npm run android

# iOS simulator  
npm run ios

# Tests çalıştır
npm test
```

## 📱 Ekranlar

### Authentication
- **Login Screen** - Telefon numarası ile giriş
- **Register Screen** - Kullanıcı kayıt formu
- **SMS Verification** - 6 haneli SMS kodu doğrulama

### Main App
- **Dashboard** - Ana sayfa, istatistikler, bugünün görevleri
- **Subjects** - Ders ve konu haritası, accordion yapı
- **Goals** - Hedef oluşturma ve takibi
- **Programs** - Haftalık program ve görev yönetimi
- **Profile** - Kullanıcı profili ve ayarlar

## 🎯 Ana Özellikler

### Dashboard
- Kişiselleştirilmiş karşılama
- Sınava kalan süre
- Genel ve ders bazında ilerleme
- Bugün yapılacaklar
- Hedef özetleri

### Ders & Konu Sistemi
- Kullanıcının sınıfına özel içerik
- Hiyerarşik konu yapısı
- "Başla" ve "Öğrendim" butonları
- İlerleme çubukları
- Alt konu desteği

### Hedef Sistemi
- CRUD işlemleri
- Tarihli/tarihi hedefler
- Tamamlanma takibi
- Geciken hedefler uyarısı
- İstatistikler

### Program Sistemi
- Haftalık program oluşturma
- Günlük görev ekleme
- Görev tamamlama
- Takvim görünümü
- Program istatistikleri

## 🔧 Konfigürasyon

### API Configuration
`src/services/api.ts` dosyasında:

```typescript
const BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator
// const BASE_URL = 'http://localhost:3000/api'; // iOS simulator
```

## 📁 Proje Yapısı

```
src/
├── components/        # Reusable components
├── contexts/         # React contexts (Auth, Theme)
├── navigation/       # Navigation structure
├── screens/          # App screens
│   ├── auth/        # Authentication screens
│   └── main/        # Main app screens
├── services/        # API services
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## 🔐 Authentication Flow

1. **Phone Number Entry** - Türk telefon numarası formatında
2. **SMS Verification** - 6 haneli kod, 60s countdown
3. **Profile Setup** - Ad, soyad, sınıf, cinsiyet
4. **JWT Token Management** - Otomatik token yenileme

## 👨‍💻 Geliştirici

- **Hüseyin Çınar** - Mobile Developer
- Email: huseyin-cinar@outlook.com
- GitHub: [@codebycinar](https://github.com/codebycinar)