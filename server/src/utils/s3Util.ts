import { S3Client } from '@aws-sdk/client-s3'

const s3Config = {
	credentials: {
		accessKeyId: process.env.AWS_ID!,
		secretAccessKey: process.env.AWS_SECRET!
	},
	region: process.env.AWS_REGION!
}
const s3 = new S3Client(s3Config)

export default s3
