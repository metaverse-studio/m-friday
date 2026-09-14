# Kế hoạch Tích hợp FingerprintJS Tạo User ID Cố định & Tối ưu FIDO WebAuthn

## 1. Mục tiêu
- Sử dụng thư viện **FingerprintJS** (`@fingerprintjs/fingerprintjs`) để trích xuất định danh thiết bị (`visitorId`), từ đó sinh ra `user.id` cố định (32-byte ArrayBuffer) duy nhất cho từng trình duyệt/thiết bị của khách hàng.
- Giải quyết triệt để tình trạng **"luôn bị hỏi đăng ký passkey mới"** bằng cách kết hợp `user.id` cố định với cơ chế lưu `credentialId`:
  - **Lần đầu**: Đăng ký Passkey với `user.id` cố định bằng `navigator.credentials.create()`, lưu lại `credential.id` vào `localStorage`.
  - **Các lần sau**: Thực hiện xác thực sinh trắc học chuẩn bằng **`navigator.credentials.get()`** với `allowCredentials: [{ id: credentialId, type: 'public-key' }]` $\to$ Hệ điều hành chỉ quét Face ID / Touch ID trong 1 giây mà KHÔNG HỎI lưu/tạo passkey mới.

---

## 2. Thách thức Kỹ thuật & Giải pháp (Critical Safari Gesture Rule)

### Thách thức:
Safari trên iOS chỉ cho phép gọi WebAuthn API (`credentials.create` / `credentials.get`) **bên trong tác vụ trực tiếp của user gesture** (sự kiện click/tap). Nếu có bất kỳ lệnh `await` bất đồng bộ nào chen vào trước lời gọi WebAuthn (như `await FingerprintJS.load()`), **user gesture sẽ bị vô hiệu hóa** và Safari sẽ ném `NotAllowedError` ngay lập tức!

### Giải pháp kiến trúc:
1. **Pre-warm Fingerprint Cache**:
   - Khi `LockScreen` component mount (`useEffect`), khởi động ngầm FingerprintJS lấy `visitorId` và tính toán trước `user.id` 32-byte (qua SHA-256).
   - Lưu kết quả vào in-memory cache và `localStorage` (`msb_fido_user_id`).
2. **Synchronous Retrieval Trong Handler**:
   - Khi người dùng chạm nút "Mở khóa": `handleAuthenticate()` lấy `user.id` và `savedCredentialId` **ngay lập tức bằng hàm đồng bộ (0ms latency, không `await`)**.
   - Gọi thẳng `navigator.credentials.get()` hoặc `credentials.create()`, đảm bảo giữ nguyên vẹn $100\%$ user gesture trên cả Safari iOS và Android/Desktop.

---

## 3. Các thay đổi dự kiến

### 1. Module mới: `src/lib/fingerprint.ts`
- `initFingerprint()`: Khởi tạo FingerprintJS, tính toán hash SHA-256 của `visitorId`, cache vào RAM và `localStorage`.
- `getFixedUserIdSync()`: Trả về `Uint8Array` 32-byte đồng bộ từ cache (nếu chưa có thì fallback về hash cố định từ localStorage/canvas).
- `getSavedCredentialId()` / `saveCredentialId(id: string)`: Quản lý ID của Passkey đã đăng ký.

### 2. Cập nhật `src/lib/fido.ts`
- Hàm `authenticate(knownAvailable?: boolean)`:
  - Lấy `savedCredId = getSavedCredentialId()`.
  - Nếu đã có `savedCredId`: Gọi `navigator.credentials.get({ publicKey: { challenge, allowCredentials: [{ id: base64ToBuffer(savedCredId), type: 'public-key' }], userVerification: 'required' } })`.
  - Nếu chưa có hoặc get thất bại: Gọi `navigator.credentials.create({ publicKey: { user: { id: getFixedUserIdSync(), name: 'stark@starkindustry.com', displayName: 'Mr Stark' }, ... } })` và lưu `credential.id`.

### 3. Cập nhật `src/components/fido/LockScreen.tsx`
- Trong `useEffect`: gọi `void initFingerprint()` song song với `hasPlatformAuthenticator()`.

### 4. Cập nhật Unit Tests: `src/lib/fido.test.ts`
- Mock `FingerprintJS` và `navigator.credentials` để kiểm thử cả 2 luồng create (lần đầu) và get (lần sau).

---

## 4. Kế hoạch Kiểm tra & Xác minh
- ` bun test src/lib/fido.test.ts`: Pass 100%.
- ` bun x tsc --noEmit`: 0 lỗi compile.
- Thử nghiệm trên browser:
  - Lần 1: Bấm mở khóa -> Popup Face ID / Passkey tạo mới thành công và lưu credential ID.
  - Lần 2: Bấm mở khóa -> Chỉ quét sinh trắc học xác thực tĩnh lặng, không còn popup hỏi lưu mã khóa passkey.
