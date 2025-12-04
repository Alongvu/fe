import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useContext(ShopContext);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse URL parameters from VNPay redirect
    const searchParams = new URLSearchParams(location.search);
    
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");
    const vnp_Amount = searchParams.get("vnp_Amount");
    const vnp_BankCode = searchParams.get("vnp_BankCode");
    const vnp_TransactionNo = searchParams.get("vnp_TransactionNo");
    const vnp_PayDate = searchParams.get("vnp_PayDate");

    // Check if payment was successful
    if (vnp_ResponseCode === "00") {
      // Payment successful
      setPaymentInfo({
        success: true,
        transactionId: vnp_TransactionNo || vnp_TxnRef,
        orderId: vnp_TxnRef,
        amount: vnp_Amount ? (parseInt(vnp_Amount) / 100).toLocaleString() : "N/A",
        bankCode: vnp_BankCode,
        payDate: vnp_PayDate ? formatPayDate(vnp_PayDate) : "N/A",
      });

      // Clear cart after successful payment
      if (clearCart) {
        clearCart();
      }
    } else {
      // Payment failed
      setPaymentInfo({
        success: false,
        message: getErrorMessage(vnp_ResponseCode),
        orderId: vnp_TxnRef,
      });
    }

    setLoading(false);
  }, [location, clearCart]);

  const formatPayDate = (dateStr) => {
    // Format: YYYYMMDDHHmmss -> DD/MM/YYYY HH:mm:ss
    if (!dateStr || dateStr.length !== 14) return dateStr;
    
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const getErrorMessage = (code) => {
    const errorMessages = {
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
      "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      "75": "Ngân hàng thanh toán đang bảo trì.",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
      "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    };

    return errorMessages[code] || "Giao dịch thất bại. Vui lòng thử lại.";
  };

  if (loading) {
    return (
      <div className="payment-success-container">
        <div className="payment-card loading">
          <div className="spinner"></div>
          <p>Đang xử lý thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className={`payment-card ${paymentInfo?.success ? "success" : "failed"}`}>
        {paymentInfo?.success ? (
          <>
            <div className="icon-wrapper">
              <div className="success-icon">✓</div>
            </div>
            <h1>Thanh toán thành công! 🎉</h1>
            <p className="success-message">
              Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
            </p>

            <div className="payment-details">
              <div className="detail-row">
                <span className="label">Mã đơn hàng:</span>
                <span className="value">#{paymentInfo.orderId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Mã giao dịch:</span>
                <span className="value">{paymentInfo.transactionId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Số tiền:</span>
                <span className="value highlight">{paymentInfo.amount} VND</span>
              </div>
              {paymentInfo.bankCode && (
                <div className="detail-row">
                  <span className="label">Ngân hàng:</span>
                  <span className="value">{paymentInfo.bankCode}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Thời gian:</span>
                <span className="value">{paymentInfo.payDate}</span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-primary" onClick={() => navigate("/")}>
                Về trang chủ
              </button>
              <button className="btn-secondary" onClick={() => navigate("/orders")}>
                Xem đơn hàng
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="icon-wrapper">
              <div className="failed-icon">✕</div>
            </div>
            <h1>Thanh toán không thành công</h1>
            <p className="error-message">{paymentInfo?.message}</p>

            {paymentInfo?.orderId && (
              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Mã đơn hàng:</span>
                  <span className="value">#{paymentInfo.orderId}</span>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn-primary" onClick={() => navigate("/cart")}>
                Quay lại giỏ hàng
              </button>
              <button className="btn-secondary" onClick={() => navigate("/checkout")}>
                Thử lại thanh toán
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
