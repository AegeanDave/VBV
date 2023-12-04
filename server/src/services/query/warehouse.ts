import { ProductStatus, SaleStatus } from '../../constants'
export default {
	adminLogin: `
        SELECT "warehouse"."email", "warehouse"."notificationPhoneNumber", "warehouse"."notificationPhoneNumberCountryCode", "warehouse"."openId", "warehouse"."warehouseId", "warehouse"."smsService", "warehouse"."emailService", "user"."name"
        FROM "warehouse", "user"
        WHERE LOWER("email") = LOWER($1) AND "warehouse"."openId" = "user"."openId";`,
	getMailerUserInfo: `
        SELECT "warehouse"."email", "warehouse"."notificationPhoneNumber", "warehouse"."notificationPhoneNumberCountryCode", "warehouse"."smsService", "warehouse"."emailService", "user"."name"
        FROM "warehouse"
        INNER JOIN "order"
        ON "order"."openId" = "warehouse"."openId" AND "order"."originOrderId" = $2
        INNER JOIN "user"
        ON "order"."openIdChild" = "user"."openId"
        WHERE "warehouse"."openId" = $1; `,
	createWarehouse: `
        INSERT INTO "warehouse" ("openId", "loginPhoneNumber", "loginPhoneNumberCountryCode")
        VALUES ($1, $2, $3)
        ON CONFLICT ("openId") DO UPDATE SET "loginPhoneNumber" = $2, "loginPhoneNumberCountryCode" = $3
        RETURNING "warehouseId";`,
	checkWarehouse: `
        SELECT "openId", "loginPhoneNumber", "email", "loginPhoneNumberCountryCode", ARRAY_TO_JSON(ARRAY_AGG (ROW_TO_JSON(products))) AS products
        FROM "warehouse"
        LEFT JOIN LATERAL (
        	SELECT "product"."productId", "product"."coverImageURL", "productName", "productDescription", "idCardRequired", "freeShipping", productImages."images", ROW_TO_JSON("MySale") AS "mySale"
        	FROM "product"
        	INNER JOIN LATERAL (
        		SELECT "inStoreProduct"."openId", "avatar", "name", "inStoreProduct"."inStoreProductId", "inStoreProduct"."defaultPrice" AS "price", "inStoreProduct"."status"
        		FROM "inStoreProduct", "user"
        		WHERE "inStoreProduct"."openId" = "user"."openId" AND "inStoreProduct"."openId" = $1 AND "inStoreProduct"."openIdFather" = "inStoreProduct"."openId" AND "product"."productId" = "inStoreProduct"."productId" AND "inStoreProduct".status <> '${SaleStatus.DELETED}'
        	) "MySale" ON TRUE
        	LEFT JOIN LATERAL (
        		SELECT ARRAY_AGG(
                                "productImage"."imageURL"
                                ORDER BY "productImage"."priority"
                        ) AS "images"
        		FROM "productImage"
        		WHERE "productImage"."productId" = "product"."productId"
        		GROUP BY "product"."productId"
        	) productImages ON TRUE
        	WHERE "product"."openId" = "warehouse"."openId" AND "product".status = '${ProductStatus.PUBLISHED}'
        ) AS products ON TRUE
        WHERE "openId" = $1
        GROUP BY "openId", "loginPhoneNumber", "email", "loginPhoneNumberCountryCode"; `,
	getWarehouseId: `
        SELECT "warehouse"."email", "warehouse"."loginPhoneNumberCountryCode", "warehouse"."loginPhoneNumber", "warehouse"."openId", "warehouse"."warehouseId", "warehouse"."smsService", "warehouse"."emailService", "user"."name"
        FROM "warehouse", "user"
        WHERE "loginPhoneNumber" = $1 AND "loginPhoneNumberCountryCode" = $2 AND "warehouse"."openId" = "user"."openId";`,
	updatePhone: `
        UPDATE "warehouse"
        SET "notificationPhoneNumber" = $1, "notificationPhoneNumberCountryCode" = $2
        WHERE "openId" = $3 AND "warehouseId" = $4;`,
	updatePhoneAdmin: `
        UPDATE "warehouse"
        SET "loginPhoneNumber" = $1, "loginPhoneNumberCountryCode" = $2
        WHERE "openId" = $3;`,
	updateSMSAndEmailService: `
        UPDATE "warehouse"
        SET "smsService" = $1, "emailService" = $2
        WHERE "openId" = $3;`,
	getWarehouseProducts: `
        SELECT "product"."productId", "product"."coverImageURL", "productName", "inStoreProduct"."status", "inStoreProduct"."defaultPrice" AS "price", "productDescription", "idCardRequired", "freeShipping"
        FROM "product"
        LEFT JOIN "warehouse"
        ON "warehouse"."openId" = "product"."openId"
        LEFT JOIN "inStoreProduct"
        ON "product"."productId" = "inStoreProduct"."productId" AND "product"."openId" = "inStoreProduct"."openId"
        WHERE "inStoreProduct"."openId" = $1 AND "product"."status" <> '${ProductStatus.ONHOLD}'
        GROUP BY "product"."coverImageURL", "product"."productId", "inStoreProduct"."inStoreProductId"; `,
	getWarehouseProductsByWarehouseId: `
        SELECT "product"."productId","product"."coverImageURL", "productName", "inStoreProduct"."status", "inStoreProduct"."inStoreProductId", "productDescription", "idCardRequired", "freeShipping", "inStoreProduct"."defaultPrice" AS "price", ARRAY_TO_JSON( ARRAY_AGG( productimage.image )) AS "images"
        FROM "inStoreProduct", "product", "warehouse"
        LEFT JOIN LATERAL (
		SELECT JSON_BUILD_OBJECT('id', "productImage"."productImageId", 'url', "productImage"."imageURL", 'priority', "priority") AS image
            	FROM "productImage"
            	WHERE "product"."productId" = "productImage"."productId"
            	ORDER BY "productImage"."priority"
        ) productimage ON TRUE
        WHERE "warehouse"."openId" = $1 AND "warehouse"."warehouseId" = $2 AND "product"."status" = '${ProductStatus.PUBLISHED}' AND "product"."productId" = "inStoreProduct"."productId" AND "product"."openId" = "inStoreProduct"."openIdFather" AND "product"."openId" = "inStoreProduct"."openId" AND "warehouse"."openId" = "product"."openId"
        GROUP BY "product"."coverImageURL", "product"."productId", "inStoreProduct"."inStoreProductId", "inStoreProduct"."inStoreProductId"
        ORDER BY "product"."lastUpdatedAt" DESC; `
}
