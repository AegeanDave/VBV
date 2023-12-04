import { S3Client } from '@aws-sdk/client-s3'
import { s3Config } from '../constants'
const s3 = new S3Client(s3Config)

export default s3
