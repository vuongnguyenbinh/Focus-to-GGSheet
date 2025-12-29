/**
 * Focus to GGSheet - Landing Page i18n (Internationalization)
 * Bilingual: English (en) and Vietnamese (vi)
 */

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.guide': 'Guide',
    'nav.install': 'Install Free',

    // Hero
    'hero.badge': 'Free Chrome Extension',
    'hero.title1': 'Stop Juggling Browser Tabs.',
    'hero.title2': 'Start Getting Things Done.',
    'hero.description': 'Manage tasks, save bookmarks, and capture ideas without leaving your current page. Everything syncs with Google Sheets while working offline-first.',
    'hero.cta1': 'Add to Chrome - Free',
    'hero.cta2': 'How It Works',

    // Features Section
    'features.title': 'Everything You Need to Stay Focused',
    'features.subtitle': 'A powerful sidebar that lives in your browser. Capture, organize, and sync - all in one place.',
    'features.tasks.title': 'Task Management',
    'features.tasks.desc': 'Track tasks with priority levels (High/Medium/Low) and deadlines. One-click completion marking.',
    'features.bookmarks.title': 'Smart Bookmarks',
    'features.bookmarks.desc': 'Save pages with categories and tags. Drag-drop URLs for quick capture with auto-fetched metadata.',
    'features.notes.title': 'Quick Notes',
    'features.notes.desc': 'Capture thoughts instantly with markdown support. Never lose a brilliant idea again.',
    'features.prompts.title': 'AI Prompts Library',
    'features.prompts.desc': 'Store and organize AI prompts for ChatGPT, Claude. Sync to Google Sheets for team sharing.',
    'features.sync.title': 'Two-Way Google Sheets Sync',
    'features.sync.desc': 'Changes in the extension update Google Sheets, and vice versa. Auto-syncs every 5 minutes.',
    'features.offline.title': 'Offline-First',
    'features.offline.desc': 'All data stored locally in IndexedDB. Works without internet, syncs when connected.',

    // Use Cases
    'usecases.title': 'Perfect For',
    'usecases.subtitle': 'Whether you\'re researching, creating, or managing projects - Focus to GGSheet adapts to your workflow.',
    'usecases.research.title': 'Research & Learning',
    'usecases.research.desc': 'Save articles, take notes, and track follow-up tasks while reading documentation.',
    'usecases.content.title': 'Content Creation',
    'usecases.content.desc': 'Bookmark references, draft ideas in notes, and manage deadlines for writing projects.',
    'usecases.project.title': 'Project Management',
    'usecases.project.desc': 'Track action items from meetings, organize resources by tags, sync with Google Sheets databases.',
    'usecases.ai.title': 'AI Workflow',
    'usecases.ai.desc': 'Build a personal prompt library for ChatGPT, Claude, or other AI tools.',

    // CTA
    'cta.title': 'Ready to Boost Your Productivity?',
    'cta.subtitle': 'Join thousands of users who stay organized while browsing. Free forever, no account required.',
    'cta.button': 'Install Now - It\'s Free',

    // Footer
    'footer.credit': 'Made by',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy',

    // Privacy Page
    'privacy.title': 'Privacy Policy',
    'privacy.lastUpdated': 'Last updated: December 29, 2024',

    // Features Page
    'featuresPage.title': 'All Features',
    'featuresPage.subtitle': 'Everything you need to stay productive while browsing. No feature bloat, just what matters.',
    'featuresPage.tasks.title': 'Task Management',
    'featuresPage.tasks.desc': 'Stay on top of your work with a simple yet powerful task system.',
    'featuresPage.tasks.f1': 'Priority levels: High, Medium, Low with visual indicators',
    'featuresPage.tasks.f2': 'Deadline tracking with overdue notifications',
    'featuresPage.tasks.f3': 'One-click completion marking',
    'featuresPage.tasks.f4': 'Categories and tags for organization',
    'featuresPage.bookmarks.title': 'Smart Bookmarks',
    'featuresPage.bookmarks.desc': 'Save and organize web pages with intelligent metadata capture.',
    'featuresPage.bookmarks.f1': 'Drag-drop URLs for instant capture',
    'featuresPage.bookmarks.f2': 'Auto-fetch page title and favicon',
    'featuresPage.bookmarks.f3': 'Category-based grouping with expand/collapse',
    'featuresPage.bookmarks.f4': 'Search across all bookmarks instantly',
    'featuresPage.notes.title': 'Quick Notes',
    'featuresPage.notes.desc': 'Capture ideas the moment they appear. No friction, just instant notes.',
    'featuresPage.notes.f1': 'Lightning-fast note creation',
    'featuresPage.notes.f2': 'Markdown support for formatting',
    'featuresPage.notes.f3': 'Full-text search across all notes',
    'featuresPage.notes.f4': 'Sync to Google Sheets as rich text',
    'featuresPage.prompts.title': 'AI Prompts Library',
    'featuresPage.prompts.desc': 'Build your personal prompt engineering library for AI tools.',
    'featuresPage.prompts.f1': 'Store prompts for ChatGPT, Claude, etc.',
    'featuresPage.prompts.f2': 'Organize by category and tags',
    'featuresPage.prompts.f3': 'One-click copy to clipboard',
    'featuresPage.prompts.f4': 'Sync with Google Sheets for team sharing',
    'featuresPage.sync.title': 'Two-Way Google Sheets Sync',
    'featuresPage.sync.desc': 'Real bidirectional sync - not just export. Your data stays consistent everywhere.',
    'featuresPage.sync.f1': 'Changes sync both ways automatically',
    'featuresPage.sync.f2': 'Auto-sync every 5 minutes or manual trigger',
    'featuresPage.sync.f3': 'Conflict resolution built-in',
    'featuresPage.sync.f4': 'Works with existing Google Sheets databases',
    'featuresPage.offline.title': 'Offline-First Architecture',
    'featuresPage.offline.desc': 'Your data is always available, even without internet connection.',
    'featuresPage.offline.f1': 'All data stored locally in IndexedDB',
    'featuresPage.offline.f2': 'Works on planes, trains, anywhere',
    'featuresPage.offline.f3': 'Auto-syncs when connection restored',
    'featuresPage.offline.f4': 'Zero data loss guarantee',

    // Guide Page
    'guide.title': 'Setup Guide',
    'guide.subtitle': 'Get started with Focus to GGSheet in just a few minutes. Follow these simple steps.',
    'guide.install.title': '1. Install the Extension',
    'guide.install.step1.title': 'Visit Chrome Web Store',
    'guide.install.step1.desc': 'Click the button below to open Focus to GGSheet on Chrome Web Store.',
    'guide.install.step2.title': 'Add to Chrome',
    'guide.install.step2.desc': 'Click "Add to Chrome" button and accept the permissions. The extension needs these permissions to work:',
    'guide.install.step3.title': 'Pin to Toolbar',
    'guide.install.step3.desc': 'Click the puzzle icon in Chrome toolbar, then click the pin icon next to "Focus to GGSheet" for quick access.',
    'guide.install.step4.title': 'Open Sidebar',
    'guide.install.step4.desc': 'Click the Focus to GGSheet icon to open the sidebar. You can now start adding tasks, bookmarks, and notes!',
    'guide.notion.title': '2. Connect to Google Sheets (Optional)',
    'guide.notion.intro': 'Google Sheets sync is optional. The extension works perfectly offline without it. If you want to sync with Google Sheets, follow these steps:',
    'guide.notion.step1.title': 'Create Google Sheets Integration',
    'guide.notion.step1.desc': 'Go to Google Sheets\'s integration page and create a new integration:',
    'guide.notion.step2.title': 'Create Database in Google Sheets',
    'guide.notion.step2.desc': 'Create a new database in Google Sheets with these properties:',
    'guide.notion.table.name': 'Property Name',
    'guide.notion.table.type': 'Type',
    'guide.notion.table.desc': 'Description',
    'guide.notion.prop.title': 'Item title (default)',
    'guide.notion.prop.type': 'task, bookmark, note',
    'guide.notion.prop.content': 'Detailed content',
    'guide.notion.prop.url': 'Link (for bookmarks)',
    'guide.notion.prop.priority': 'high, medium, low',
    'guide.notion.prop.deadline': 'Due date',
    'guide.notion.prop.completed': 'Task completion status',
    'guide.notion.prop.tags': 'Labels',
    'guide.notion.prop.localid': 'Local ID for sync',
    'guide.notion.step3.title': 'Share Database with Integration',
    'guide.notion.step3.desc': 'Open your database in Google Sheets, then:',
    'guide.notion.step4.title': 'Get Database ID',
    'guide.notion.step4.desc': 'Open your database in browser and copy the Database ID from URL:',
    'guide.notion.step4.hint': 'The Database ID is the 32-character string after your workspace name and before "?v="',
    'guide.notion.step5.title': 'Configure in Extension',
    'guide.notion.step5.desc': 'Open the extension sidebar, go to Settings (gear icon), then:',
    'guide.notion.step5.f1': 'Paste your Integration Token',
    'guide.notion.step5.f2': 'Paste your Database ID',
    'guide.notion.step5.f3': 'Click "Test" to verify connection',
    'guide.notion.step5.f4': 'Click "Save" to save settings',
    'guide.notion.step6.title': 'Start Syncing!',
    'guide.notion.step6.desc': 'The extension will automatically sync every 5 minutes. You can also click the sync icon in the header to sync manually.',
    'guide.faq.title': 'Frequently Asked Questions',
    'guide.faq.q1': 'Will I lose data if I uninstall the extension?',
    'guide.faq.a1': 'Data is stored in Chrome\'s IndexedDB. If you clear browser data, local data will be lost. Connect to Google Sheets for backup.',
    'guide.faq.q2': 'Why does Google Sheets connection fail?',
    'guide.faq.a2': 'Check: (1) Token is correct and not expired, (2) Database ID format is correct, (3) Database is shared with your integration.',
    'guide.faq.q3': 'How do I know sync is working?',
    'guide.faq.a3': 'The sync icon in the header spins during sync. Check "Last synced" timestamp in Settings.',
    'guide.faq.q4': 'Can I use multiple Google Sheets databases?',
    'guide.faq.a4': 'Currently supports one database for items (tasks/bookmarks/notes) and one for prompts. Multi-database support is planned.',
    'guide.cta.title': 'Ready to Get Started?',
    'guide.cta.subtitle': 'Install Focus to GGSheet now and transform your browsing experience.',
  },

  vi: {
    // Navigation
    'nav.home': 'Trang chủ',
    'nav.features': 'Tính năng',
    'nav.guide': 'Hướng dẫn',
    'nav.install': 'Cài đặt miễn phí',

    // Hero
    'hero.badge': 'Extension Chrome miễn phí',
    'hero.title1': 'Đừng Mở 20 Tab Nữa.',
    'hero.title2': 'Hãy Hoàn Thành Việc.',
    'hero.description': 'Quản lý công việc, lưu bookmark và ghi chú nhanh mà không cần rời khỏi trang web đang xem. Mọi thứ đồng bộ với Google Sheets trong khi vẫn hoạt động offline.',
    'hero.cta1': 'Thêm vào Chrome - Miễn phí',
    'hero.cta2': 'Xem cách hoạt động',

    // Features Section
    'features.title': 'Mọi Thứ Bạn Cần Để Tập Trung',
    'features.subtitle': 'Thanh sidebar mạnh mẽ ngay trên trình duyệt. Ghi chép, tổ chức và đồng bộ - tất cả trong một.',
    'features.tasks.title': 'Quản Lý Công Việc',
    'features.tasks.desc': 'Theo dõi công việc với độ ưu tiên (Cao/Trung bình/Thấp) và hạn chót. Đánh dấu hoàn thành chỉ một cú click.',
    'features.bookmarks.title': 'Bookmark Thông Minh',
    'features.bookmarks.desc': 'Lưu trang web với danh mục và nhãn. Kéo thả URL để lưu nhanh với metadata tự động.',
    'features.notes.title': 'Ghi Chú Nhanh',
    'features.notes.desc': 'Ghi lại ý tưởng ngay lập tức với hỗ trợ markdown. Không bao giờ mất ý tưởng hay nữa.',
    'features.prompts.title': 'Thư Viện AI Prompts',
    'features.prompts.desc': 'Lưu trữ và tổ chức prompt AI cho ChatGPT, Claude. Đồng bộ lên Google Sheets để chia sẻ team.',
    'features.sync.title': 'Đồng Bộ 2 Chiều Google Sheets',
    'features.sync.desc': 'Thay đổi trong extension cập nhật lên Google Sheets và ngược lại. Tự động đồng bộ 5 phút một lần.',
    'features.offline.title': 'Offline-First',
    'features.offline.desc': 'Toàn bộ dữ liệu lưu local trong IndexedDB. Hoạt động không cần internet, đồng bộ khi có mạng.',

    // Use Cases
    'usecases.title': 'Hoàn Hảo Cho',
    'usecases.subtitle': 'Dù bạn đang nghiên cứu, sáng tạo hay quản lý dự án - Focus to GGSheet thích nghi với quy trình của bạn.',
    'usecases.research.title': 'Nghiên Cứu & Học Tập',
    'usecases.research.desc': 'Lưu bài viết, ghi chú và theo dõi công việc cần làm khi đọc tài liệu.',
    'usecases.content.title': 'Sáng Tạo Nội Dung',
    'usecases.content.desc': 'Bookmark tài liệu tham khảo, nháp ý tưởng và quản lý deadline cho dự án viết lách.',
    'usecases.project.title': 'Quản Lý Dự Án',
    'usecases.project.desc': 'Theo dõi công việc từ cuộc họp, tổ chức tài nguyên theo nhãn, đồng bộ với Google Sheets database.',
    'usecases.ai.title': 'Quy Trình AI',
    'usecases.ai.desc': 'Xây dựng thư viện prompt cá nhân cho ChatGPT, Claude hoặc AI tool khác.',

    // CTA
    'cta.title': 'Sẵn Sàng Tăng Năng Suất?',
    'cta.subtitle': 'Tham gia cùng hàng nghìn người dùng tổ chức công việc khi lướt web. Miễn phí mãi mãi, không cần tài khoản.',
    'cta.button': 'Cài Đặt Ngay - Miễn Phí',

    // Footer
    'footer.credit': 'Tạo bởi',
    'footer.contact': 'Liên hệ',
    'footer.privacy': 'Bảo mật',

    // Privacy Page
    'privacy.title': 'Chính Sách Bảo Mật',
    'privacy.lastUpdated': 'Cập nhật lần cuối: 29 tháng 12, 2024',

    // Features Page
    'featuresPage.title': 'Tất Cả Tính Năng',
    'featuresPage.subtitle': 'Mọi thứ bạn cần để làm việc hiệu quả khi duyệt web. Không tính năng thừa, chỉ những gì cần thiết.',
    'featuresPage.tasks.title': 'Quản Lý Công Việc',
    'featuresPage.tasks.desc': 'Kiểm soát công việc với hệ thống task đơn giản nhưng mạnh mẽ.',
    'featuresPage.tasks.f1': 'Độ ưu tiên: Cao, Trung bình, Thấp với hiển thị trực quan',
    'featuresPage.tasks.f2': 'Theo dõi deadline với thông báo quá hạn',
    'featuresPage.tasks.f3': 'Đánh dấu hoàn thành chỉ một click',
    'featuresPage.tasks.f4': 'Danh mục và nhãn để tổ chức',
    'featuresPage.bookmarks.title': 'Bookmark Thông Minh',
    'featuresPage.bookmarks.desc': 'Lưu và tổ chức trang web với khả năng lấy metadata tự động.',
    'featuresPage.bookmarks.f1': 'Kéo thả URL để lưu ngay lập tức',
    'featuresPage.bookmarks.f2': 'Tự động lấy tiêu đề trang và favicon',
    'featuresPage.bookmarks.f3': 'Nhóm theo danh mục với mở rộng/thu gọn',
    'featuresPage.bookmarks.f4': 'Tìm kiếm tức thì trong tất cả bookmark',
    'featuresPage.notes.title': 'Ghi Chú Nhanh',
    'featuresPage.notes.desc': 'Ghi lại ý tưởng ngay khi nó xuất hiện. Không ma sát, chỉ có ghi chú tức thì.',
    'featuresPage.notes.f1': 'Tạo ghi chú siêu nhanh',
    'featuresPage.notes.f2': 'Hỗ trợ Markdown để định dạng',
    'featuresPage.notes.f3': 'Tìm kiếm toàn văn trong tất cả ghi chú',
    'featuresPage.notes.f4': 'Đồng bộ lên Google Sheets dạng rich text',
    'featuresPage.prompts.title': 'Thư Viện AI Prompts',
    'featuresPage.prompts.desc': 'Xây dựng thư viện prompt engineering cá nhân cho các công cụ AI.',
    'featuresPage.prompts.f1': 'Lưu prompt cho ChatGPT, Claude, v.v.',
    'featuresPage.prompts.f2': 'Tổ chức theo danh mục và nhãn',
    'featuresPage.prompts.f3': 'Sao chép một click vào clipboard',
    'featuresPage.prompts.f4': 'Đồng bộ với Google Sheets để chia sẻ team',
    'featuresPage.sync.title': 'Đồng Bộ 2 Chiều Google Sheets',
    'featuresPage.sync.desc': 'Đồng bộ hai chiều thực sự - không chỉ xuất. Dữ liệu nhất quán ở mọi nơi.',
    'featuresPage.sync.f1': 'Thay đổi đồng bộ cả hai chiều tự động',
    'featuresPage.sync.f2': 'Tự động đồng bộ 5 phút hoặc kích hoạt thủ công',
    'featuresPage.sync.f3': 'Xử lý xung đột tích hợp sẵn',
    'featuresPage.sync.f4': 'Hoạt động với Google Sheets database có sẵn',
    'featuresPage.offline.title': 'Kiến Trúc Offline-First',
    'featuresPage.offline.desc': 'Dữ liệu luôn sẵn sàng, ngay cả khi không có kết nối internet.',
    'featuresPage.offline.f1': 'Toàn bộ dữ liệu lưu local trong IndexedDB',
    'featuresPage.offline.f2': 'Hoạt động trên máy bay, tàu, ở bất kỳ đâu',
    'featuresPage.offline.f3': 'Tự động đồng bộ khi có kết nối trở lại',
    'featuresPage.offline.f4': 'Đảm bảo không mất dữ liệu',

    // Guide Page
    'guide.title': 'Hướng Dẫn Cài Đặt',
    'guide.subtitle': 'Bắt đầu với Focus to GGSheet chỉ trong vài phút. Làm theo các bước đơn giản sau.',
    'guide.install.title': '1. Cài Đặt Extension',
    'guide.install.step1.title': 'Truy Cập Chrome Web Store',
    'guide.install.step1.desc': 'Click nút bên dưới để mở Focus to GGSheet trên Chrome Web Store.',
    'guide.install.step2.title': 'Thêm Vào Chrome',
    'guide.install.step2.desc': 'Click nút "Add to Chrome" và chấp nhận các quyền. Extension cần các quyền này để hoạt động:',
    'guide.install.step3.title': 'Ghim Lên Thanh Công Cụ',
    'guide.install.step3.desc': 'Click icon puzzle trên thanh công cụ Chrome, sau đó click icon ghim bên cạnh "Focus to GGSheet" để truy cập nhanh.',
    'guide.install.step4.title': 'Mở Sidebar',
    'guide.install.step4.desc': 'Click icon Focus to GGSheet để mở sidebar. Bây giờ bạn có thể bắt đầu thêm công việc, bookmark và ghi chú!',
    'guide.notion.title': '2. Kết Nối Google Sheets (Tùy Chọn)',
    'guide.notion.intro': 'Đồng bộ Google Sheets là tùy chọn. Extension hoạt động hoàn hảo offline không cần nó. Nếu bạn muốn đồng bộ với Google Sheets, làm theo các bước sau:',
    'guide.notion.step1.title': 'Tạo Google Sheets Integration',
    'guide.notion.step1.desc': 'Truy cập trang integration của Google Sheets và tạo integration mới:',
    'guide.notion.step2.title': 'Tạo Database Trong Google Sheets',
    'guide.notion.step2.desc': 'Tạo database mới trong Google Sheets với các thuộc tính sau:',
    'guide.notion.table.name': 'Tên Thuộc Tính',
    'guide.notion.table.type': 'Loại',
    'guide.notion.table.desc': 'Mô Tả',
    'guide.notion.prop.title': 'Tiêu đề mục (mặc định)',
    'guide.notion.prop.type': 'task, bookmark, note',
    'guide.notion.prop.content': 'Nội dung chi tiết',
    'guide.notion.prop.url': 'Link (cho bookmark)',
    'guide.notion.prop.priority': 'high, medium, low',
    'guide.notion.prop.deadline': 'Hạn chót',
    'guide.notion.prop.completed': 'Trạng thái hoàn thành',
    'guide.notion.prop.tags': 'Nhãn',
    'guide.notion.prop.localid': 'ID local để đồng bộ',
    'guide.notion.step3.title': 'Chia Sẻ Database Với Integration',
    'guide.notion.step3.desc': 'Mở database trong Google Sheets, sau đó:',
    'guide.notion.step4.title': 'Lấy Database ID',
    'guide.notion.step4.desc': 'Mở database trong trình duyệt và sao chép Database ID từ URL:',
    'guide.notion.step4.hint': 'Database ID là chuỗi 32 ký tự sau tên workspace và trước "?v="',
    'guide.notion.step5.title': 'Cấu Hình Trong Extension',
    'guide.notion.step5.desc': 'Mở sidebar extension, vào Settings (icon bánh răng), sau đó:',
    'guide.notion.step5.f1': 'Dán Integration Token của bạn',
    'guide.notion.step5.f2': 'Dán Database ID của bạn',
    'guide.notion.step5.f3': 'Click "Test" để kiểm tra kết nối',
    'guide.notion.step5.f4': 'Click "Save" để lưu cài đặt',
    'guide.notion.step6.title': 'Bắt Đầu Đồng Bộ!',
    'guide.notion.step6.desc': 'Extension sẽ tự động đồng bộ mỗi 5 phút. Bạn cũng có thể click icon sync ở header để đồng bộ thủ công.',
    'guide.faq.title': 'Câu Hỏi Thường Gặp',
    'guide.faq.q1': 'Tôi có mất dữ liệu nếu gỡ extension không?',
    'guide.faq.a1': 'Dữ liệu lưu trong IndexedDB của Chrome. Nếu bạn xóa dữ liệu trình duyệt, dữ liệu local sẽ mất. Kết nối Google Sheets để backup.',
    'guide.faq.q2': 'Tại sao kết nối Google Sheets thất bại?',
    'guide.faq.a2': 'Kiểm tra: (1) Token đúng và chưa hết hạn, (2) Database ID đúng định dạng, (3) Database đã chia sẻ với integration.',
    'guide.faq.q3': 'Làm sao biết đồng bộ đang hoạt động?',
    'guide.faq.a3': 'Icon sync ở header sẽ xoay khi đang đồng bộ. Kiểm tra "Last synced" trong Settings.',
    'guide.faq.q4': 'Tôi có thể dùng nhiều Google Sheets database không?',
    'guide.faq.a4': 'Hiện hỗ trợ một database cho items (task/bookmark/note) và một cho prompts. Hỗ trợ đa database đang được lên kế hoạch.',
    'guide.cta.title': 'Sẵn Sàng Bắt Đầu?',
    'guide.cta.subtitle': 'Cài đặt Focus to GGSheet ngay và chuyển đổi trải nghiệm duyệt web của bạn.',
  }
};

// Get current language
function getLang() {
  return localStorage.getItem('lang') || 'en';
}

// Set language
function setLang(lang) {
  localStorage.setItem('lang', lang);
  updateUI(lang);
  updateLangButtons(lang);
}

// Update language toggle buttons
function updateLangButtons(lang) {
  const enBtn = document.getElementById('langEn');
  const viBtn = document.getElementById('langVi');

  if (enBtn && viBtn) {
    enBtn.classList.toggle('active', lang === 'en');
    viBtn.classList.toggle('active', lang === 'vi');
  }
}

// Update all UI text
function updateUI(lang) {
  const t = translations[lang] || translations.en;

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // Update html lang attribute
  document.documentElement.lang = lang;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = getLang();
  updateUI(savedLang);
  updateLangButtons(savedLang);
});
