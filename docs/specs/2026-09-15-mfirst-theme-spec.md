# MSB Virtual RM · Đặc Tả Bảng Màu Theme mFirst (mFirst Design Spec)

Tài liệu đặc tả hệ thống màu sắc cho phân khúc khách hàng ưu tiên **mFirst** dựa trên mã nguồn di động `MSBAliasColor`.

---

## 1. Bảng Màu Gốc (Kotlin Mobile Source)

```kotlin
fun mFirst() = MSBAliasColor(
    background = Background(
        overlay = Color(0x990C0E12),      // rgba(12, 14, 18, 0.60)
        primary = Color(0xFF13161B),      // #13161B
        secondary = Color(0xFF22262F),    // #22262F
        tertiary = Color(0x990C0E12),     // rgba(12, 14, 18, 0.60)
    ),
    border = Border(
        brand = Color(0xFFBE9A61),        // #BE9A61
        card = Color(0x40FFFFFF),         // rgba(255, 255, 255, 0.25)
        default = Color(0x40FFFFFF),      // rgba(255, 255, 255, 0.25)
        disable = Color(0xFF61656C),      // #61656C
        error = Color(0xFFF04438),        // #F04438
        focus = Color(0xFF987B4E),        // #987B4E
        hover = Color(0xFF987B4E),        // #987B4E
        information = Color(0xFF2E90FA),  // #2E90FA
        inverse = Color(0xFFFFFFFF),      // #FFFFFF
        pending = Color(0xFF373A41),      // #373A41
        success = Color(0xFF12B76A),      // #12B76A
        warning = Color(0xFFF79009),      // #F79009
    ),
    icon = Icon(
        brand = Color(0xFFBE9A61),        // #BE9A61
        button = Color(0xFF13161B),       // #13161B
        disable = Color(0xFF61656C),      // #61656C
        error = Color(0xFFF9B4AF),        // #F9B4AF
        errorHighlight = Color(0xFFF04438), // #F04438
        information = Color(0xFFABD3FD),  // #ABD3FD
        informationHighlight = Color(0xFF2E90FA), // #2E90FA
        inverse = Color(0xFFFFFFFF),      // #FFFFFF
        pending = Color(0xFFF0F0F1),      // #F0F0F1
        pendingHighlight = Color(0xFF94979C), // #94979C
        primary = Color(0xFFF0F0F1),      // #F0F0F1
        secondary = Color(0xFF94979C),    // #94979C
        success = Color(0xFFA0E2C3),      // #A0E2C3
        successHighlight = Color(0xFF12B76A), // #12B76A
        warning = Color(0xFFFCD39D),      // #FCD39D
        warningHighlight = Color(0xFFF79009), // #F79009
    ),
    surface = Surface(
        bottomSheet = Color(0xFF22262F),  // #22262F
        brand = Color(0xFFBE9A61),        // #BE9A61
        card = Color(0x660C0E12),         // rgba(12, 14, 18, 0.40)
        disable = Color(0xFF61656C),      // #61656C
        error = Color(0xFF601B16),        // #601B16
        errorHighlight = Color(0xFFF04438), // #F04438
        hover = Color(0xFF4C3E27),        // #4C3E27
        information = Color(0xFF123A64),  // #123A64
        informationHighlight = Color(0xFF2E90FA), // #2E90FA
        pending = Color(0xFF373A41),      // #373A41
        pendingHighlight = Color(0xFF85888E), // #85888E
        popup = Color(0xFF22262F),        // #22262F
        primary = Color(0xFF13161B),      // #13161B
        scrolled = Color(0x660C0E12),     // rgba(12, 14, 18, 0.40)
        secondary = Color(0x0DFFFFFF),    // rgba(255, 255, 255, 0.051)
        selected = Color(0xFF0C0E12),     // #0C0E12
        success = Color(0xFF07492A),      // #07492A
        successHighlight = Color(0xFF12B76A), // #12B76A
        toast = Color(0xFF311D02),        // #311D02
        tooltip = Color(0xFF22262F),      // #22262F
        warning = Color(0xFF633A04),      // #633A04
        warningHighlight = Color(0xFFF79009), // #F79009
    ),
    text = Text(
        brand = Color(0xFFE5D7C0),        // #E5D7C0
        brandHighlight = Color(0xFFBE9A61), // #BE9A61
        brandHover = Color(0xFF725C3A),   // #725C3A
        brandPressed = Color(0xFFD8C2A0), // #D8C2A0
        button = Color(0xFF13161B),       // #13161B
        disable = Color(0xFF373A41),      // #373A41
        error = Color(0xFFF9B4AF),        // #F9B4AF
        errorHighlight = Color(0xFFF04438), // #F04438
        inform = Color(0xFFFFFFFF),       // #FFFFFF
        information = Color(0xFFABD3FD),  // #ABD3FD
        informationHighlight = Color(0xFF2E90FA), // #2E90FA
        inverse = Color(0xFFFFFFFF),      // #FFFFFF
        link = Color(0xFFBE9A61),         // #BE9A61
        linkHover = Color(0xFF725C3A),    // #725C3A
        linkPressed = Color(0xFFD8C2A0),  // #D8C2A0
        pending = Color(0xFFF0F0F1),      // #F0F0F1
        pendingHighlight = Color(0xFF94979C), // #94979C
        placeHolder = Color(0xFF61656C),  // #61656C
        primary = Color(0xFFF0F0F1),      // #F0F0F1
        secondary = Color(0xFFCECFD2),    // #CECFD2
        success = Color(0xFFA0E2C3),      // #A0E2C3
        successHighlight = Color(0xFF12B76A), // #12B76A
        tertiary = Color(0xFF373A41),     // #373A41
        warning = Color(0xFFFCD39D),      // #FCD39D
        warningHighlight = Color(0xFFF79009), // #F79009
    ),
)
```

---

## 2. Quy Tắc Áp Dụng Cho Web Front-End

1. **Nền Chính**:
   - `background-color`: `#13161B`
   - `gradient`: `linear-gradient(115deg, #13161B 0%, #1A1D24 50%, #262019 100%)`
   - Scrim / Overlay: `rgba(12, 14, 18, 0.60)`
2. **Nút Bấm Chính (`.btn-primary-msb`)**:
   - Background: `linear-gradient(135deg, #BE9A61 0%, #D8C2A0 50%, #BE9A61 100%)`
   - Text color: `#13161B` (chữ than chì đậm nổi bật trên nền vàng kim)
   - Shadow: `0 4px 16px rgba(190, 154, 97, 0.35)`
3. **Thẻ Kính (`.card-glass`)**:
   - Nền: `rgba(12, 14, 18, 0.40)`
   - Viền đỉnh đón sáng: `rgba(190, 154, 97, 0.40)` (Specularity vàng Champagne)
   - Viền thân: `rgba(255, 255, 255, 0.15)`
4. **Trạng Thái Nghiệp Vụ (Semantic Surfaces)**:
   - Thẻ cảnh báo rủi ro / Từ chối: `surface.error` `#601B16`, chữ `text.error` `#F9B4AF`
   - Thẻ BottomSheet: `surface.bottomSheet` `#22262F`
   - Thẻ Popup: `surface.popup` `#22262F`
