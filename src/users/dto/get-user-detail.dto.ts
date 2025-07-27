export class UserDetailDto {
  sellerId: number;
  sellerName: string;
  sellerImg: string;
  sellerIntro: string;
  sellerOpenDay: Date;
  address: string;
  latitude: number;
  longitude: number;
  name: string;

  productId: number[]; // JSON_ARRAYAGG로 받아옴
  starAVG: number; // 평균 평점
  reviewNum: number; // 리뷰 개수
  onSaleNum: number; // 판매중인 상품 수
  soldOutNum: number; // 판매 완료 상품 수
  likeNum: number; // 받은 좋아요 수
  followingNum: number; // 팔로잉 수
  followNum: number; // 팔로워 수
  orderNum: number; // 주문 수
}
