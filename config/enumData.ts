export const enumData = {
  /** Loại user */
  UserType: {
    Employee: { code: "Employee", name: "Nhân viên", description: "" , value: ""},
    Admin: { code: "Admin", name: "Admin", description: "" , value: ""},
    Author: { code: "Author", name: "Author", description: "" , value: ""},
    User: { code: "User", name: "User", description: "" , value: ""},
    Student: { code: "Student", name: "Student", description: "" , value: ""},
  },
  /** Loại đăng nhập */
  LoginType: {
    Local: { code: "Local", name: "Đăng nhập bằng username và password", description: "" , value: "local"},
    Google: { code: "Google", name: "Đăng nhập bằng google", description: "" , value: "google"},
    Facebook: { code: "Facebook", name: "Đăng nhập bằng facebook", description: "" , value: "facebook"},
    Github: { code: "Github", name: "Đăng nhập bằng github", description: "" , value: "github"},
  },

  /** Loại kỳ thanh toán */
  PaymentPeriods: {
    MONTH: { code: "MONTH", name: "Thanh toán theo tháng" },
    YEAR: { code: "YEAR", name: "Thanh toán theo năm" },
  },

  /** Trạng thái thanh toán */
  PaymentStatus: {
    UNPAID: { code: "UNPAID", name: "Chưa thanh toán", color: "gray" },
    PAID: { code: "PAID", name: "Đã thanh toán", color: "blue" },
  },
  /** Loại thanh toán */
  PaymentType: {
    TRANSFER: { code: "TRANSFER", name: "Chuyển khoản" },
    CASH: { code: "CASH", name: "Tiền mặt" },
  },

  Gender: {
    MALE: { code: "MALE", name: "Nam" },
    FEMALE: { code: "FEMALE", name: "Nữ" },
    OTHER: { code: "OTHER", name: "Khác" },
  },
  /** Chế độ làm việc  */
  WorkingMode: {
    FULL_TIME: { code: "FULL_TIME", name: "Toàn thời gian", name1: "Fulltime", color: "#40B34F" },
    PART_TIME: { code: "PART_TIME", name: "Bán thời gian", name1: "Partime", color: "#EAB042" },
  },

  /** Trạng thái nhân viên*/
  EmployeeStatus: {
    PENDING: { code: "PENDING", name: "Chờ duyệt", color: "#e8af4f" },
    WORKING: { code: "WORKING", name: "Đang làm việc", color: "#0b5a23" },
    STOP_WORKING: { code: "STOP_WORKING", name: "Thôi việc", color: "#f13060" },
  },

  EmailStatus: {
    Success: {
      code: "Success",
      name: "Gửi email thành 0ng",
      description: "",
    },
    Fail: {
      code: "Fail",
      name: "Gửi email thất bại",
      description: "",
    },
  },

  SQSMessageType: {
    Test: "test",
    Email: "email",
    SupplierBid: "supplier_bid",
    SupplierRegister: "supplier_register",
  },

  EmailTemplate: {
    InviteToInterview: {
      code: "GuiNccNguoiDuyetDuyetDangKy",
      name: "Hệ Thống Green Leaf - Thông báo thông tin tài khoản quý khách",
      description: "3/ Mẫu email gửi NCC khi người duyệt đã duyệt và thông tin tài khoản",
      numOfVariable: 3,
      default: `<p>Kính gửi Quý khách {0},</p>
        <br>
        <p>Chào mừng Quý khách đến với Hệ Thống Green Leaf.</p>
        <p>Thông tin đăng nhập của Quý khách như sau:</p>
        <p>- Tên Đăng Nhập: {1}</p>
        <p>- Mật khẩu: {2}</p>
        <p>Quý khách vui lòng đổi mật khẩu và lưu thông tin tài khoản trên để sử dụng cho việc đăng nhập.</p>
        <br>
        <p>Trân trọng,</p>
        <p>Hệ Thống Green Leaf</p>
        <br>
        <p><i>Lưu ý: Mail này được gửi tự động từ Hệ Thống Green Leaf, vui lòng không Reply.</i></p>`,
    },
  },

  DataType: {
    string: { code: "string", name: "Kiểu chuỗi", format: "" },
    int: { code: "int", name: "Kiểu sổ nguyên", format: "" },
    float: { code: "float", name: "Kiểu sổ thập phân", format: "" },
    date: { code: "date", name: "Kiểu ngày", format: "dd/MM/yyyy" },
    dateTime: { code: "dateTime", name: "Kiểu ngày giờ", format: "dd/MM/yyyy HH:mm:ss" },
    time: { code: "time", name: "Kiểu giờ", format: "HH:mm:ss" },
    boolean: { code: "boolean", name: "Kiểu checkbox", format: "" },
  },

  DayInWeek: {
    SUNDAY: { code: "0", name: "Chủ nhật" },
    MONDAY: { code: "1", name: "Thứ hai" },
    TUESDAY: { code: "2", name: "Thứ ba" },
    WEDNESDAY: { code: "3", name: "Thứ tư" },
    THURSDAR: { code: "4", name: "Thứ năm" },
    FRIDAY: { code: "5", name: "Thứ sáu" },
    SATURDAY: { code: "6", name: "Thứ bảy" },
  },

  /**Trạng thái notify */
  NotifyStatus: {
    Read: { name: "Đã đọc", code: "Read" },
    New: { name: "Chưa đọc", code: "New" },
  },

  /** Loại thông báo notify */
  NotifyType: {
    MOBILE_APP: { name: "Mobile", code: "MOBILE_APP" },
    WEB: { name: "Web", code: "WEB" },
  },

  Permission: {
    code: "Permission",
    name: "Phân Quyền",
    View: { name: "Xem", code: "Permission_View", value: false },
    Add: { name: "Tạo Mới", code: "Permission_Add", value: false },
    Edit: { name: "Chỉnh Sửa", code: "Permission_Edit", value: false },
    Delete: { name: "Xóa", code: "Permission_Delete", value: false },
  },

  /** Phân quyền hệ thống Role group cho website*/
  RoleGroup: {
    // 1. Khoá học
    Course: {
      id: 1,
      name: "Khoá học",
      code: "Course",
      children: [
        {
          code: "Course",
          name: "Danh sách khoá học",
          View: { name: "Xem", code: "Course_View", value: false },
          Create: { name: "Thêm mới", code: "Course_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "Course_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "Course_Edit", value: false },
          Delete: { name: "Xóa", code: "Course_Delete", value: false },
        },
        {
          code: "CourseCategory",
          name: "Danh sách loại khoá học",
          View: { name: "Xem", code: "CourseCategory_View", value: false },
          Create: { name: "Thêm mới", code: "CourseCategory_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "CourseCategory_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "CourseCategory_Edit", value: false },
          Delete: { name: "Xóa", code: "CourseCategory_Delete", value: false },
        },
        {
          code: "CourseSection",
          name: "Danh sách Chương của khoá học",
          View: { name: "Xem", code: "CourseSection_View", value: false },
          Create: { name: "Thêm mới", code: "", value: false },
          Detail: { name: "Xem chi tiết", code: "CourseSection_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "CourseSection_Edit", value: false },
          Delete: { name: "Xóa", code: "CourseSection_Delete", value: false },
        },
        {
          code: "CourseLesson",
          name: "Danh sách Bài học",
          View: { name: "Xem", code: "CourseLesson_View", value: false },
          Create: { name: "Thêm mới", code: "CourseLesson_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "CourseLesson_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "CourseLesson_Edit", value: false },
          Delete: { name: "Xóa", code: "CourseLesson_Delete", value: false },
        },
        {
          code: "CourseDiscuss",
          name: "Thảo luận bài học",
          View: { name: "Xem", code: "CourseDiscuss_View", value: false },
          Create: { name: "Thêm mới", code: "CourseDiscuss_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "CourseDiscuss_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "CourseDiscuss_Edit", value: false },
          Delete: { name: "Xóa", code: "CourseDiscuss_Delete", value: false },
        },
        {
          code: "CourseNote",
          name: "Ghi chú bài học",
          View: { name: "Xem", code: "CourseNote_View", value: false },
          Create: { name: "Thêm mới", code: "CourseNote_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "CourseNote_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "CourseNote_Edit", value: false },
          Delete: { name: "Xóa", code: "CourseNote_Delete", value: false },
        },
      ],
    },
    // 2. Đơn hàng
    Order: {
      id: 2,
      name: "Đơn hàng",
      code: "Order",
      children: [
        {
          code: "Order",
          name: "Danh sách Đơn hàng",
          View: { name: "Xem", code: "Order_View", value: false },
          Create: { name: "Thêm mới", code: "Order_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "Order_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "Order_Edit", value: false },
          Delete: { name: "Xóa", code: "Order_Delete", value: false },
        },
        {
          code: "OrderTransaction",
          name: "Danh sách giao dịch",
          View: { name: "Xem", code: "OrderTransaction_View", value: false },
          Create: { name: "Thêm mới", code: "OrderTransaction_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "OrderTransaction_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "OrderTransaction_Edit", value: false },
          Delete: { name: "Xóa", code: "OrderTransaction_Delete", value: false },
        },
      ],
    },
    // 3. Người dùng
    User: {
      id: 3,
      name: "Người dùng",
      code: "User",
      children: [
        {
          code: "User",
          name: "Danh sách người dùng",
          View: { name: "Xem", code: "User_View", value: false },
          Create: { name: "Thêm mới", code: "Order_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "User_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "User_Edit", value: false },
          Delete: { name: "Xóa", code: "User_Delete", value: false },
        },
        {
          code: "Permission",
          name: "Phân quyền",
          View: { name: "Xem", code: "Permission_View", value: false },
          Create: { name: "Thêm mới", code: "Permission_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "Permission_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "Permission_Edit", value: false },
          Delete: { name: "Xóa", code: "Permission_Delete", value: false },
        },
      ],
    },

    // 4. Báo cáo
    ReportCenter: {
      id: 4,
      name: "Báo cáo",
      code: "Report",
      children: [
        {
          code: "UserProgress",
          name: "Báo cáo chi tiết người dùng",
          View: { name: "Xem", code: "UserProgress_View", value: false },
          Create: { name: "Thêm mới", code: "UserProgress_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "UserProgress_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "UserProgress_Edit", value: false },
          Delete: { name: "Xóa", code: "UserProgress_Delete", value: false },
        },
        {
          code: "CourseInsight",
          name: "Báo cáo chi tiết khoá học",
          View: { name: "Xem", code: "CourseInsight_View", value: false },
          Create: { name: "Thêm mới", code: "CourseInsight_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "CourseInsight_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "CourseInsight_Edit", value: false },
          Delete: { name: "Xóa", code: "CourseInsight_Delete", value: false },
        },
      ],
    },

    // 5. Marketing
    Marketing: {
      id: 5,
      name: "Marketing",
      code: "Marketing",
      children: [
        {
          code: "CouponType",
          name: "Loại coupon",
          View: { name: "Xem", code: "CouponType_View", value: false },
          Create: { name: "Thêm mới", code: "CouponType_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "CouponType_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "CouponType_Edit", value: false },
          Delete: { name: "Xóa", code: "CouponType_Delete", value: false },
        },
        {
          code: "VoucherBundle",
          name: "Gói giảm giá",
          View: { name: "Xem", code: "VoucherBundle_View", value: false },
          Create: { name: "Thêm mới", code: "VoucherBundle_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "VoucherBundle_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "VoucherBundle_Edit", value: false },
          Delete: { name: "Xóa", code: "VoucherBundle_Delete", value: false },
        },
        {
          code: "Subscription",
          name: "Đăng ký hàng tháng/ năm",
          View: { name: "Xem", code: "Subscription_View", value: false },
          Create: { name: "Thêm mới", code: "Subscription_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "Subscription_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "Subscription_Edit", value: false },
          Delete: { name: "Xóa", code: "Subscription_Delete", value: false },
        },
        {
          code: "Coupon",
          name: "Danh sách coupon",
          View: { name: "Xem", code: "Coupon_View", value: false },
          Create: { name: "Thêm mới", code: "Coupon_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "Coupon_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "Coupon_Edit", value: false },
          Delete: { name: "Xóa", code: "Coupon_Delete", value: false },
        },
      ],
    },
    // 6. Blog
    Blog: {
      id: 6,
      name: "Blog",
      code: "Blog",
      children: [
        {
          code: "Blog",
          name: "Danh sách bài viết",
          View: { name: "Xem", code: "Blog_View", value: false },
          Create: { name: "Thêm mới", code: "Blog_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "Blog_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "Blog_Edit", value: false },
          Delete: { name: "Xóa", code: "Blog_Delete", value: false },
        },
        {
          code: "BlogCategory",
          name: "Danh sách loại bài viết",
          View: { name: "Xem", code: "BlogCategory_View", value: false },
          Create: { name: "Thêm mới", code: "BlogCategory_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "BlogCategory_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "BlogCategory_Edit", value: false },
          Delete: { name: "Xóa", code: "BlogCategory_Delete", value: false },
        },
        {
          code: "BlogComment",
          name: "Bình luận bài viết",
          View: { name: "Xem", code: "BlogComment_View", value: false },
          Create: { name: "Thêm mới", code: "BlogComment_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "BlogComment_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "BlogComment_Edit", value: false },
          Delete: { name: "Xóa", code: "BlogComment_Delete", value: false },
        },
      ],
    },
    // 7. Feedback
    Feedback: {
      id: 7,
      name: "Feedback",
      code: "Feedback",
      children: [
        {
          code: "Feedback",
          name: "Phản hồi feedback",
          View: { name: "Xem", code: "Feedback_View", value: false },
          Create: { name: "Thêm mới", code: "Feedback_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "Feedback_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "Feedback_Edit", value: false },
          Delete: { name: "Xóa", code: "Feedback_Delete", value: false },
        },
      ],
    },
    // 8. Feedback
    Setting: {
      id: 8,
      name: "Setting",
      code: "Setting",
      children: [
        {
          code: "Setting",
          name: "Cài đặt Setting",
          View: { name: "Xem", code: "Setting_View", value: false },
          Create: { name: "Thêm mới", code: "Setting_Create", value: false },
          Detail: { name: "Xem chi tiết", code: "Setting_Detail", value: false },
          Edit: { name: "Chỉnh Sửa", code: "Setting_Edit", value: false },
          Delete: { name: "Xóa", code: "Setting_Delete", value: false },
        },
      ],
    },
  },

  ActiveStatus: {
    ACTIVE: { code: "ACTIVE", name: "Đang hoạt động", value: false },
    INACTIVE: { code: "INACTIVE", name: "Ngưng hoạt động", value: true },
    ALL: { code: "ACTIVE", name: "Tất cả", value: null },
  },

  ActionLogType: {
    ThemMoi: { code: "ThemMoi", name: "Thêm mới", value: false },
    CapNhat: { code: "CapNhat", name: "Cập nhật", value: false },
    KichHoat: { code: "KichHoat", name: "Kích hoạt", value: false },
    HuyKichHoat: { code: "HuyKichHoat", name: "Hủy kích hoạt", value: false },
    ThoiViec: { code: "ThoiViec", name: "Thôi việc", value: false },
    Duyet: { code: "Duyet", name: "Duyệt", value: false },
    Huy: { code: "Huy", name: "Hủy", value: false },
    XacNhan: { code: "XacNhan", name: "Xác nhận", value: false },
    TuChoi: { code: "TuChoi", name: "Từ chối", value: false },
    KhongChinhXac: { code: "KhongChinhXac", name: "Không chính xác", value: false },
    ThaoTac: { code: "ThaoTac", name: "Thao tác", value: false },
  },

  ActionLogEnType: {
    Create: { code: "Create", name: "Created", value: false },
    Update: { code: "Update", name: "Updated", value: false },
    Activate: { code: "Activate", name: "Activated", value: false },
    Deactivate: { code: "Deactivate", name: "Deactivated", value: false },
    Fire: { code: "Fire", name: "Fired", value: false },
    Accept: { code: "Accept", name: "Accepted", value: false },
    Destroy: { code: "Destroy", name: "Destroyed", value: false },
    Confirm: { code: "Confirm", name: "Confirmed", value: false },
    Reject: { code: "Reject", name: "Rejected", value: false },
  },

  ManagerRole: {
    Manager: { code: "Manager", name: "Quản lý" },
    Director: { code: "Director", name: "Giám đốc" },
    Leader: { code: "Leader", name: "Leader" },
  },

  SettingString: {
    REVENUE_RATING_AUTHOR: {
      code: 'REVENUE_RATING_AUTHOR',
      name: "Rating for author revenue per order!",
      value: 0.4,
      type: "number"
    }
  },

  /** Trạng thái bài test */
  TestStatus: {
    NEW: { code: "NEW", name: "Mới tạo", color: "#EAB113" },
    DESTROYED: { code: "DESTROYED", name: "Đã huỷ", color: "#ff1a1a" },
    INVALID: { code: "INVALID", name: "Chưa đến hiệu lực", color: "#EAB042" },
    VALID: { code: "VALID", name: "Đang hiệu lực", color: "#005C20" },
    EXPIRE: { code: "EXPIRE", name: "Hết hạn", color: "#F5365C" },
  },

  /** Trạng thái bài test cho từng thằng nhân viên */
  TestUserStatus: {
    NOTTEST: { code: "NOTTEST", name: "Chưa thực hiện", color: "#EAB113" },
    PASS: { code: "PASS", name: "Đạt", color: "#ff1a1a" },
    NOTPASS: { code: "NOTPASS", name: "Chưa đạt", color: "#EAB042" },
  },

  /** Thao tác với bài test */
  TestAction: {
    ACCEPT: { code: "ACCEPT", name: "Duyệt" },
    DESTROY: { code: "DESTROY", name: "Huỷ" },
  },

  /** Các cấp độ của khoá học */
  CourseLevel: {
    ALL: { code: "ALL", name: "All Level", value: "" },
    BEGINNER: { code: "BEGINNER", name: "Beginner", value: "" },
    INTERMEDIATE: { code: "INTERMEDIATE", name: "Intermediate", value: "" },
    ADVANCED: { code: "ADVANCED", name: "Advanced", value: "" },
  },

  /** Trạng thái của người dùng */
  UserStatus: {
    NEW: { code: "NEW", name: "New", color: "#348aed" },
    ACTIVE: { code: "ACTIVE", name: "Active", color: "#5af542" },
    INACTIVE: { code: "INACTIVE", name: "In Active", color: "#ed4734" },
  },
};
