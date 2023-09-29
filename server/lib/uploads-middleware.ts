import { Request } from 'express';
import path from 'path';
import multer from 'multer';
// import fs from 'fs';
import multerS3 from 'multer-s3';
import { S3 } from '@aws-sdk/client-s3';

// connect us to S3 on AWS
const s3 = new S3({
  region: process.env.AWS_S3_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

// create a storage adapter
const storage = multerS3({
  s3: s3,
  acl: 'public-read',
  // ☝️ so that anyone with a url can view the file
  bucket: process.env.AWS_S3_BUCKET as string,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  // ☝️ so that when the file is downloaded,
  // the proper Content-Type header is set in the response
  key: (
    req: Request,
    file: any,
    done: (error: Error | null, filename: string) => void
  ) => {
    const fileExtension = path.extname(file.originalname);
    done(null, `${Date.now()}${fileExtension.toLowerCase()}`);
  },
});

// create the middleware
const uploadsMiddleware = multer({
  storage: storage,
}).single('file-to-upload');

// the string argument to .single() is the file's field name
// it matches the <input name="file-to-upload" type="file"/>
// or the key of the FormData field you appended

module.exports = uploadsMiddleware;
