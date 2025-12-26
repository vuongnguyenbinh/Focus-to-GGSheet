# Focus to Notion - Chrome Extension

Stay focused while browsing and save everything to Notion.

> Tiện ích mở rộng Chrome giúp bạn tập trung làm việc trên trình duyệt và lưu trữ mọi thứ vào Notion.

## Tính năng

- **Công việc (Tasks)**: Quản lý việc cần làm với độ ưu tiên và hạn chót
- **Dấu trang (Bookmarks)**: Lưu trang web yêu thích
- **Ghi chú (Notes)**: Ghi chú nhanh mọi lúc
- **Đồng bộ Notion**: Tự động đồng bộ 2 chiều với Notion database
- **Hoạt động offline**: Dữ liệu lưu local, đồng bộ khi có mạng
- **Giao diện sáng/tối**: Tùy chỉnh theo sở thích

---

## Hướng dẫn cài đặt

### Bước 1: Build extension

```bash
# Clone hoặc tải source code
cd NotionEX

# Cài đặt dependencies
npm install

# Build extension
npm run build
```

Sau khi build xong, thư mục `dist/` sẽ chứa extension.

### Bước 2: Cài đặt vào Chrome

1. Mở Chrome, vào địa chỉ: `chrome://extensions`
2. Bật **Developer mode** (góc trên bên phải)
3. Click **Load unpacked**
4. Chọn thư mục `dist` trong project

![Extension đã cài đặt](docs/images/install-extension.png)

### Bước 3: Mở Sidebar

- **Cách 1**: Click vào icon extension trên toolbar
- **Cách 2**: Click chuột phải vào trang web → "Open Focus to Notion"

---

## Hướng dẫn sử dụng

### Thêm công việc mới

1. Chọn tab **Công việc**
2. Click nút **+** (góc dưới bên phải)
3. Nhập tiêu đề và thông tin
4. Chọn độ ưu tiên (Cao/Trung bình/Thấp)
5. Đặt hạn chót (nếu cần)
6. Click **Thêm**

### Thêm dấu trang

1. Chọn tab **Dấu trang**
2. Click nút **+**
3. Nhập tiêu đề
4. Dán URL trang web
5. Click **Thêm**

### Thêm ghi chú

1. Chọn tab **Ghi chú**
2. Click nút **+**
3. Nhập tiêu đề và nội dung
4. Click **Thêm**

### Đánh dấu hoàn thành

- Click vào ô tròn bên trái công việc để đánh dấu hoàn thành
- Click lần nữa để bỏ đánh dấu

### Sửa/Xóa mục

1. Di chuột vào mục cần sửa
2. Click icon **⋯** (góc phải)
3. Chọn **Sửa** hoặc **Xóa**

### Tìm kiếm

- Sử dụng thanh tìm kiếm ở đầu trang
- Gõ từ khóa để lọc các mục

### Chuyển đổi giao diện

- Click icon **☀️/🌙** trên header để đổi theme sáng/tối

---

## Hướng dẫn kết nối Notion

### Bước 1: Tạo Notion Integration

1. Truy cập: https://www.notion.so/my-integrations
2. Click **+ New integration**
3. Đặt tên: "Focus to Notion"
4. Chọn workspace bạn muốn dùng
5. Click **Submit**
6. Sao chép **Internal Integration Token** (bắt đầu bằng `secret_`)

### Bước 2: Tạo Database trong Notion

1. Tạo một trang mới trong Notion
2. Gõ `/database` và chọn **Database - Full page**
3. Thêm các cột (properties) sau:

| Tên cột | Loại | Mô tả |
|---------|------|-------|
| Title | Title | Tiêu đề mục (mặc định) |
| Type | Select | Loại: `task`, `bookmark`, `note` |
| Content | Text | Nội dung chi tiết |
| URL | URL | Link (cho dấu trang) |
| Priority | Select | Độ ưu tiên: `high`, `medium`, `low` |
| Deadline | Date | Hạn chót |
| Completed | Checkbox | Đã hoàn thành |
| Tags | Multi-select | Nhãn |
| LocalID | Text | ID local (để đồng bộ) |

### Bước 3: Chia sẻ Database với Integration

1. Mở database vừa tạo
2. Click **⋯** (góc trên phải) → **Connections**
3. Tìm và chọn integration "Focus to Notion"
4. Xác nhận chia sẻ

### Bước 4: Lấy Database ID

1. Mở database trong trình duyệt
2. Sao chép URL, ví dụ:
   ```
   https://www.notion.so/myworkspace/abc123def456...
   ```
3. Database ID là phần sau `/` và trước `?`:
   ```
   abc123def456...
   ```
   (32 ký tự hoặc có dấu `-` phân cách)

### Bước 5: Cấu hình trong Extension

1. Mở Sidebar
2. Click tab **Cài đặt** (icon ⚙️ ở footer)
3. Nhập **Integration Token** (secret_...)
4. Nhập **Database ID**
5. Click **Kiểm tra** để test kết nối
6. Click **Lưu**

### Bước 6: Đồng bộ

- **Tự động**: Extension đồng bộ mỗi 5 phút
- **Thủ công**: Click icon **↻** trên header để đồng bộ ngay

---

## Câu hỏi thường gặp

### Q: Dữ liệu có mất khi xóa extension không?
**A**: Không. Dữ liệu lưu trong IndexedDB của Chrome. Tuy nhiên, nếu xóa dữ liệu trình duyệt thì sẽ mất. Nên kết nối Notion để backup.

### Q: Tại sao kết nối Notion thất bại?
**A**: Kiểm tra:
- Token đúng và chưa hết hạn
- Database ID đúng định dạng
- Database đã chia sẻ với Integration

### Q: Đồng bộ bị lỗi liên tục?
**A**: Extension sẽ retry 3 lần. Nếu vẫn lỗi, kiểm tra:
- Kết nối mạng
- Notion API rate limit (max 3 request/giây)
- Cấu trúc database đúng

### Q: Làm sao biết đang đồng bộ?
**A**: Icon **↻** trên header sẽ xoay khi đang đồng bộ.

---

## Phát triển

```bash
# Chạy development mode (hot reload)
npm run dev

# Build production
npm run build

# Type check
npx tsc --noEmit
```

## Tech Stack

- React 18 + TypeScript
- Vite + CRXJS (Chrome Extension bundler)
- Tailwind CSS
- Dexie.js (IndexedDB wrapper)
- Notion API

---

## License

MIT License - Binh Vuong AI Marketing
