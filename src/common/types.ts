export interface S3MulterFile extends Express.Multer.File {
  location: string; // S3에 업로드된 파일의 public URL
}
