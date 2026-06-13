# Screen Translator (Chrome Extension)

Tiện ích mở rộng mạnh mẽ cho trình duyệt Google Chrome phát triển trên nền tảng Manifest V3, cho phép bạn dịch lập tức các vùng màn hình được chọn hoặc văn bản được bôi đen. Tiện ích này sử dụng Google Gemini API với model gemini-3.1-flash-lite-preview nhanh và tối ưu, hỗ trợ tự động xoay vòng API key để tránh giới hạn lượt truy cập, duy trì tiến trình dịch dưới nền, quản lý lịch sử dịch thuật và sở hữu giao diện gradient tím phân cực cao cấp theo phong cách Telegram hỗ trợ cả chế độ sáng và tối.

## Các tính năng chính

- Dịch nhanh: Sử dụng model được tối ưu hóa gemini-3.1-flash-lite-preview cho phản hồi dịch thuật ngay lập tức.
- Xoay vòng API Key: Cấu hình nhiều Google Gemini API key trong trang cài đặt. Trình chạy ngầm sẽ tự động chuyển đổi sang key khác nếu key hiện tại gặp lỗi hoặc vượt quá hạn mức sử dụng.
- Dịch vùng màn hình: Khoanh và cắt bất kỳ vùng nào trên màn hình và dịch nội dung chữ bên trong ảnh trực tiếp thông qua khả năng thị giác của model.
- Dịch văn bản bôi đen: Dịch ngay lập tức văn bản được bôi đen trên bất kỳ trang web nào nhờ các prompt có nhận diện ngữ cảnh trang.
- Giao diện pop-up tiện lợi: Nhập và dịch văn bản trực tiếp trong cửa sổ popup. Yêu cầu được thực hiện dưới nền, giúp giữ nguyên kết quả ngay cả khi bạn đóng cửa sổ.
- Quản lý lịch sử: Xem và quản lý đến 200 bản ghi lịch sử dịch thuật gần nhất trong một giao diện riêng, hỗ trợ tìm kiếm theo từ khóa và lọc theo ngôn ngữ.
- Giao diện cao cấp: Chế độ sáng và tối được thiết kế đẹp mắt với gradient tím và đường nét tinh tế.

## Phím tắt mặc định

- Alt+Shift+W: Mở giao diện dịch nhanh trong Popup.
- Alt+Shift+S: Bắt đầu chọn vùng màn hình để dịch.
- Alt+Shift+D: Dịch văn bản đang được bôi đen trên trang web.
- Alt+Shift+H: Mở trang lịch sử dịch thuật.

Người dùng có thể tùy chỉnh các phím tắt này bằng cách truy cập chrome://extensions/shortcuts trên trình duyệt.

## Hướng dẫn cài đặt

1. Tải về hoặc sao chép mã nguồn của kho lưu trữ này về máy tính.
2. Mở Google Chrome và truy cập đường dẫn chrome://extensions/.
3. Bật Chế độ dành cho nhà phát triển (Developer Mode) ở góc trên cùng bên phải.
4. Nhấn vào nút Tải tiện ích đã giải nén (Load Unpacked) ở goc trên cùng bên trái.
5. Chọn thư mục chứa các file của tiện ích mở rộng (thư mục có chứa file manifest.json).
6. Tiện ích Screen Translator đã được cài đặt và sẵn sàng sử dụng.

## Cấu hình

Trước khi bắt đầu dịch, bạn cần cấu hình các Google Gemini API key:

1. Click vào biểu tượng tiện ích trên thanh công cụ và chọn Cài đặt (Settings), hoặc mở trang cấu hình options.html.
2. Nhập một hoặc nhiều Gemini API key vào các ô nhập liệu.
3. Nhấn Lưu cài đặt (Save Settings).

## Cấu trúc thư mục dự án

- manifest.json: Cấu hình tiện ích, thông tin phím tắt và thiết lập quyền truy cập.
- popup.html / popup.js / popup.css: Giao diện và logic cho popup dịch thuật nhanh.
- options.html / options.js / options.css: Cửa sổ cấu hình để quản lý các API key và ngôn ngữ dịch.
- history.html / history.js / history.css: Xem và quản lý lịch sử dịch thuật.
- background.js: Service worker chạy ngầm điều phối yêu cầu dịch thuật, xoay vòng API key và giao tiếp với Google Gemini API.
- content.js / content.css: Content script được nhúng vào các trang web để tạo vùng chọn, cắt ảnh màn hình và hiển thị bản dịch đè lên trên chữ gốc.
- theme-init.js: Script gọn nhẹ khởi tạo theme tối/sáng chính xác trước khi giao diện hiển thị.
- icons/: Thư mục chứa các icon của tiện ích.

## Giấy phép

Dự án này là mã nguồn mở và được cung cấp dưới Giấy phép MIT.
