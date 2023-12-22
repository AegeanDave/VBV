import { GetObjectAclCommand } from '@aws-sdk/client-s3'
import s3 from '../utils/s3Util'
import multer from 'multer'
import multerS3 from 'multer-s3'

// The name of the bucket that you have created
export const upload = multer({
	storage: multerS3({
		s3: s3 as any,
		bucket: process.env.BUCKET_NAME!,
		acl: 'public-read',
		metadata: (req, file, callback) => {
			callback(undefined, { fieldName: file.fieldname })
		},
		key: (req, file, callback) => {
			callback(undefined, Date.now().toString())
		},
		serverSideEncryption: 'AES256'
	}),
	limits: {
		fileSize: 1024 * 1024 * 3
	}
})

export const downloadFile = (url: string) => {
	const command = new GetObjectAclCommand({
		Bucket: process.env.BUCKET_NAME,
		Key: url.substring(url.lastIndexOf('/') + 1)
	})
	return s3.send(command)
}
