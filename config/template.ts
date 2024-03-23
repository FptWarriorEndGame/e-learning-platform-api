export const template = {
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
    SendUserNameAndPasswordForAuthor: {
      code: "GuiNccNguoiDuyetDuyetDangKy",
      name: "E Learning Platform System - Notify your author account ",
      description: "3/ Mẫu email gửi NCC khi người duyệt đã duyệt và thông tin tài khoản",
      from: "e-learning-platform@gmail.com",
      numOfVariable: 3,
      default: `<p>Dear Author {0},</p>
        <br>
        <p>Welcome to the E Learning Platform System!</p>
        <p>Your account information to login follow bellow:</p>
        <p>- <b>username</b>: {1}</p>
        <p>- <b>password</b>: {2}</p>
        <p>You should change your password after login to secure your account./p>
        <br>
        <p>Sincerly,</p>
        <p>E Learning Platform!</p>
        <br>
        <p><i>Note: This email is automatically generated. Please do not reply</i></p>`,
    },
    ReplyToFeedback: {
      code: "ReplyToCustomerFeedback",
      name: "E Learning Platform System - Reply to customer feedback",
      description: "Email template for replying to customer feedback",
      from: "e-learning-platform@gmail.com",
      numOfVariable: 1,
      default: `<p>Dear Customer,</p>
        <br>
        <p>Thank you for your feedback.</p>
        <p>Here is our response to your feedback:</p>
        <p>{0}</p>
        <br>
        <p>Best regards,</p>
        <p>E Learning Platform System</p>
        <br>
        <p><i>Please note: This email is automatically generated from the E Learning Platform System, please do not reply.</i></p>`,
    },
  },
};
