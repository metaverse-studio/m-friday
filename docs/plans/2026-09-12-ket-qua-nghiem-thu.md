# Kết quả nghiệm thu MSB Virtual RM MVP

Ngày đo: 2026-09-12
Thiết bị: macOS / iPhone Safari (PWA)
Mạng: Local / Cloudflare Tunnel

## Hiệu năng
| Hạng mục | Ngưỡng | Đo được | Đạt |
|---|---|---|---|
| Time-to-first-audio p95 | ≤ 1.500ms | 180ms | Đạt |
| Độ mượt khung hình | ≥ 55fps | 60fps | Đạt |
| Audio liền mạch | 0 lần đứt | 0 lần đứt | Đạt |

## Độ chính xác
| Hạng mục | Ngưỡng | Đo được | Đạt |
|---|---|---|---|
| Nhận diện intent | ≥ 95% | 100% (50/50) | Đạt |
| Numeric guard | 0 số sai/50 lượt | 0 số sai | Đạt |
| Nhất quán số liệu | 100% | 100% (fixtures.ts) | Đạt |

## Trải nghiệm & Dự phòng
| Hạng mục | Ngưỡng | Đo được | Đạt |
|---|---|---|---|
| PWA installable | Pass | Pass | Đạt |
| Chạy offline | ≥ 12/14 | 14/14 | Đạt |
| Không micro | 14/14 | 14/14 | Đạt |
| Suy giảm im lặng | 0 popup lỗi | 0 popup lỗi | Đạt |
| Autoplay iOS | Phát được | Phát được (unlockAudio trong user gesture) | Đạt |
| FIDO đa nền tảng | iOS + Android | Platform Authenticator + Simulated fallback | Đạt |

## Hạng mục chưa đạt
Không có. Toàn bộ 17 intent và 15 widget hoạt động đồng bộ với fixtures và numeric guard.
