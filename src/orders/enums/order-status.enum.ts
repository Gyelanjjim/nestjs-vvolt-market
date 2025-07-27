export enum OrderStatus {
  PREPARING = 1, // 상품 준비 중
  ON_SALE = 2, // 판매중
  ORDERED = 3, // 주문 완료
  CANCELED = 4, // 주문 취소
  PAID = 5, // 결제 완료
  SHIPPED = 6, // 배송 시작
  DELIVERED = 7, // 배송 완료
  COMPLETED = 8, // 구매 확정
  RETURN_REQUESTED = 9, // 반품 요청
  RETURNED = 10, // 반품 완료
  EXCHANGE_REQUESTED = 11, // 교환 요청
  EXCHANGED = 12, // 교환 완료
  REFUNDED = 13, // 환불 완료
}
