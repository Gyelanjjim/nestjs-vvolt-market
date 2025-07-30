import { ApiProperty } from '@nestjs/swagger';

export class UserDetailDto {
  @ApiProperty({ example: 42, description: '판매자 ID' })
  sellerId: number;

  @ApiProperty({ example: '김철수', description: '판매자 닉네임' })
  sellerName: string;

  @ApiProperty({
    example: 'https://image.url',
    description: '프로필 이미지 URL',
  })
  sellerImg: string;

  @ApiProperty({ example: '안녕하세요~', description: '자기소개 문구' })
  sellerIntro: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '판매 시작일',
  })
  sellerOpenDay: Date;

  @ApiProperty({ example: '서울특별시 송파구', description: '주소' })
  address: string;

  @ApiProperty({ example: 37.1234, description: '위도' })
  latitude: number;

  @ApiProperty({ example: 127.5678, description: '경도' })
  longitude: number;

  @ApiProperty({ example: '송철진', description: '사용자 이름' })
  name: string;

  @ApiProperty({
    example: ['1', '2', '3'],
    description: '상품 ID 목록 (JSON_ARRAYAGG 결과)',
  })
  productId: number[];

  @ApiProperty({ example: 4.7, description: '평균 평점' })
  starAVG: number;

  @ApiProperty({ example: 12, description: '리뷰 개수' })
  reviewNum: number;

  @ApiProperty({ example: 3, description: '판매중인 상품 수' })
  onSaleNum: number;

  @ApiProperty({ example: 8, description: '판매 완료된 상품 수' })
  soldOutNum: number;

  @ApiProperty({ example: 45, description: '받은 좋아요 수' })
  likeNum: number;

  @ApiProperty({ example: 22, description: '팔로잉 수' })
  followingNum: number;

  @ApiProperty({ example: 102, description: '팔로워 수' })
  followNum: number;

  @ApiProperty({ example: 7, description: '주문 수' })
  orderNum: number;
}
