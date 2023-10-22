// import { Request } from 'express';
// import path from 'path';
// import multer from 'multer';
// import multerS3 from 'multer-s3';
// import { S3 } from '@aws-sdk/client-s3';

// // Connect us to S3 on AWS
// const s3 = new S3({
//   region: process.env.AWS_S3_REGION as string,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
//   },
// });

// // Create a storage adapter
// const storage = multerS3({
//   s3: s3,
//   acl: 'public-read',
//   // So that anyone with a URL can view the file
//   bucket: process.env.AWS_S3_BUCKET as string,
//   contentType: multerS3.AUTO_CONTENT_TYPE,
//   // So that when the file is downloaded,
//   // the proper Content-Type header is set in the response
//   key: (
//     req: Request,
//     file: any,
//     done: (error: Error | null, filename: string) => void
//   ) => {
//     const fileExtension = path.extname(file.originalname);
//     done(null, `${Date.now()}${fileExtension.toLowerCase()}`);
//   },
// });

// // Create the middleware
// const uploadsMiddleware = multer({
//   storage: storage,
// }).single('file-to-upload');

// // The string argument to .single() is the file's field name
// // It matches the <input name="file-to-upload" type="file"/>
// // or the key of the FormData field you appended

// export default uploadsMiddleware;

import path from 'node:path';
import multer from 'multer';
const imagesDirectory = 'public/images';
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, imagesDirectory);
  },
  filename: (req, file, callback) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExtension);
    const name = `${fileName}-${Date.now()}${fileExtension}`;
    callback(null, name);
  },
});
export const uploadsMiddleware = multer({ storage });
