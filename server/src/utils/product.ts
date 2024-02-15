import { Image } from '../models/sequelize'

const handleGetImages = async (productId: string, limit: number) => {
	return Image.findAll({
		where: { productId },
		attributes: ['url', 'isCoverImage'],
		limit
	})
}

export { handleGetImages }
