import { SaleStatus, ProductStatus } from '../../constants'
export default {
	getProductList: `
        SELECT "products"."productId", "products"."coverImageURL", "productName", "productDescription", "idCardRequired", "freeShipping", productImages."images", ROW_TO_JSON("DealerSale") AS "dealerSale", ROW_TO_JSON("MySale") AS "mySale"
        FROM "products"
        INNER JOIN LATERAL (
        	SELECT "inStoreProduct"."openId", "inStoreProduct"."openIdFather", "avatar", "name", COALESCE("price"."price", "inStoreProduct"."defaultPrice") AS "price", "inStoreProduct"."inStoreProductId", "inStoreProduct"."status", "price"."priceId", "serialForQRCode"
        	FROM "inStoreProduct"
        	LEFT JOIN "price"
        		ON "inStoreProduct"."inStoreProductId" = "price"."inStoreProductId" AND "price"."openIdChild" = $1
        	, "users", "alias"
        	WHERE "inStoreProduct"."openId" = "alias"."openId" AND "alias"."openId" = "users"."openId" AND "alias"."openIdChild" = $1 AND "products"."productId" = "inStoreProduct"."productId" AND "inStoreProduct"."status" = '${SaleStatus.PUBLISHED}' AND "alias".status = ''
        ) "DealerSale" ON TRUE
        LEFT JOIN LATERAL (
        	SELECT "inStoreProduct"."openId", "avatar", "name", "inStoreProduct"."inStoreProductId", "inStoreProduct"."defaultPrice" AS "price", "inStoreProduct"."status"
        	FROM "inStoreProduct", "users"
        	WHERE "inStoreProduct"."openId" = "users"."openId" AND "inStoreProduct"."openId" = $1 AND "inStoreProduct"."openIdFather" = "DealerSale"."openId" AND "products"."productId" = "inStoreProduct"."productId" AND "inStoreProduct".status <> '${SaleStatus.DELETED}'
        ) "MySale" ON TRUE
        LEFT JOIN LATERAL (
        	SELECT ARRAY_AGG(
                        "productImage"."imageURL"
                        ORDER BY "productImage"."priority"
                        ) AS "images"
        	FROM "productImage"
        	WHERE "productImage"."productId" = "products"."productId"
        	GROUP BY "products"."productId"
        ) productImages ON TRUE
        WHERE "products"."status" = '${ProductStatus.PUBLISHED}'; `,
	getSaleProductsByFather: `
        SELECT "productId", "inStoreProductId"
        FROM "inStoreProduct"
        WHERE "openId" = $1 AND "openIdFather" = $2 ;  `,
	getMySaleProductListWithSepcificPrice: `
        SELECT "products"."productId", "products"."coverImageURL", "productName", "productDescription", "idCardRequired", "freeShipping", productImages."images", ROW_TO_JSON("DealerSale") AS "dealerSale"
        FROM "products"
        INNER JOIN LATERAL (
        	SELECT "inStoreProduct"."openId", "inStoreProduct"."openIdFather", "avatar", "name", COALESCE("price"."price", "inStoreProduct"."defaultPrice") AS "price", "inStoreProduct"."inStoreProductId", "inStoreProduct"."status", "price"."priceId"
        	FROM "inStoreProduct"
        	LEFT JOIN "price"
        		ON "inStoreProduct"."inStoreProductId" = "price"."inStoreProductId" AND "price"."openIdChild" = $2
        	, "users", "alias"
        	WHERE "inStoreProduct"."openId" = $1 AND "inStoreProduct"."openId" = "alias"."openId" AND "alias"."openId" = "users"."openId" AND "alias"."openIdChild" = $2 AND "products"."productId" = "inStoreProduct"."productId" AND "inStoreProduct"."status" = '${SaleStatus.PUBLISHED}' AND "alias".status = ''
        ) "DealerSale" ON TRUE
        LEFT JOIN LATERAL (
        	SELECT ARRAY_AGG(
                        "productImage"."imageURL"
                        ORDER BY "productImage"."priority"
                        ) AS "images"
        	FROM "productImage"
        	WHERE "productImage"."productId" = "products"."productId"
        	GROUP BY "products"."productId"
        ) productImages ON TRUE
        WHERE "products"."status" = '${ProductStatus.PUBLISHED}';  `,
	getMySaleProductListByPublish: `
        SELECT "products"."productId", "products"."coverImageURL", "productName", "productDescription", "idCardRequired", "freeShipping", productImages."images", ROW_TO_JSON("DealerSale") AS "dealerSale", ROW_TO_JSON("MySale") AS "mySale"
        FROM "products"
        INNER JOIN LATERAL (
        	SELECT "inStoreProduct"."openId", "inStoreProduct"."openIdFather", "avatar", "name", COALESCE("price"."price", "inStoreProduct"."defaultPrice") AS "price", "inStoreProduct"."inStoreProductId", "inStoreProduct"."status", "price"."priceId", "serialForQRCode"
        	FROM "inStoreProduct"
        	LEFT JOIN "price"
        		ON "inStoreProduct"."inStoreProductId" = "price"."inStoreProductId" AND "price"."openIdChild" = $1
        	, "users", "alias"
        	WHERE "inStoreProduct"."openId" = "alias"."openId" AND "alias"."openId" = "users"."openId" AND "alias"."openIdChild" = $1 AND "products"."productId" = "inStoreProduct"."productId" AND "inStoreProduct"."status" = '${SaleStatus.PUBLISHED}' AND "alias".status = ''
        ) "DealerSale" ON TRUE
        LEFT JOIN LATERAL (
        	SELECT "inStoreProduct"."openId", "avatar", "name", "inStoreProduct"."inStoreProductId", "inStoreProduct"."defaultPrice" AS "price", "inStoreProduct"."status"
        	FROM "inStoreProduct", "users"
        	WHERE "inStoreProduct"."openId" = "users"."openId" AND "inStoreProduct"."openId" = $1 AND "inStoreProduct"."openIdFather" = "DealerSale"."openId" AND "products"."productId" = "inStoreProduct"."productId" AND "inStoreProduct".status <> '${SaleStatus.DELETED}'
        ) "MySale" ON TRUE
        LEFT JOIN LATERAL (
        	SELECT ARRAY_AGG(
                        "productImage"."imageURL"
                        ORDER BY "productImage"."priority"
                        ) AS "images"
        	FROM "productImage"
        	WHERE "productImage"."productId" = "products"."productId"
        	GROUP BY "products"."productId"
        ) productImages ON TRUE
        WHERE "products"."status" = '${ProductStatus.PUBLISHED}';  `,
	/* 查看上级产品，并保证自己还没有上架此产品，筛选除上级之外的所有自己已经上架的此产品，看上级产品是否在这些产品之中，如说在则不选择上级产品 */
	getMySaleProductListFromFather: `
        SELECT "products"."productId", "products"."coverImageURL", "productName", "productDescription", "idCardRequired", "freeShipping", productImages."images", ROW_TO_JSON("DealerSale") AS "dealerSale", ROW_TO_JSON("MySale") AS "mySale"
        FROM "products"
        INNER JOIN LATERAL (
        	SELECT "inStoreProduct"."openId", "inStoreProduct"."openIdFather", "avatar", "name", COALESCE("price"."price", "inStoreProduct"."defaultPrice") AS "price", "inStoreProduct"."inStoreProductId", "inStoreProduct"."status", "price"."priceId"
        	FROM "inStoreProduct"
        	LEFT JOIN "price"
        		ON "inStoreProduct"."inStoreProductId" = "price"."inStoreProductId" AND "price"."openIdChild" = $1
        	, "users", "alias"
        	WHERE "inStoreProduct"."openId" = $2 AND "inStoreProduct"."openId" = "alias"."openId" AND "alias"."openId" = "users"."openId" AND "alias"."openIdChild" = $1 AND "products"."productId" = "inStoreProduct"."productId" AND "inStoreProduct"."status" = '${SaleStatus.PUBLISHED}' AND "alias".status = ''
        ) "DealerSale" ON TRUE
        LEFT JOIN LATERAL (
        	SELECT "inStoreProduct"."openId", "avatar", "name", "inStoreProduct"."inStoreProductId", "inStoreProduct"."defaultPrice" AS "price", "inStoreProduct"."status"
        	FROM "inStoreProduct", "users"
        	WHERE "inStoreProduct"."openId" = "users"."openId" AND "inStoreProduct"."openId" = $1 AND "inStoreProduct"."openIdFather" = "DealerSale"."openId" AND "products"."productId" = "inStoreProduct"."productId" AND "inStoreProduct".status <> '${SaleStatus.DELETED}'
        ) "MySale" ON TRUE
        LEFT JOIN LATERAL (
        	SELECT ARRAY_AGG(
                        "productImage"."imageURL"
                        ORDER BY "productImage"."priority"
                        ) AS "images"
        	FROM "productImage"
        	WHERE "productImage"."productId" = "products"."productId"
        	GROUP BY "products"."productId"
        ) productImages ON TRUE
        WHERE "products"."status" = '${ProductStatus.PUBLISHED}'; `,
	disableAllChildrenInStoreProducts: `
        UPDATE "inStoreProduct"
        SET "status" = '${SaleStatus.DELETED}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "productId" = $1 AND "openIdFather" = $2 AND "openId" <> $2
        RETURNING "openId"; `,
	updateProductToDELETEDByOpenIdFather: `
        UPDATE "inStoreProduct"
        SET "status" = '${SaleStatus.DELETED}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "inStoreProductId" = $1 ;  `,
	updateMyProductToIdLEBySaleId: `
        UPDATE "inStoreProduct"
        SET "status" = '${SaleStatus.IDLE}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "inStoreProductId" = $1
        RETURNING "openIdFather";  `,
	releaseNewProduct: `
        INSERT INTO "inStoreProduct" ("productId", "openId", "openIdFather", "defaultPrice", "status")
        VALUES ($1, $2, $3, $4, '${SaleStatus.PUBLISHED}')
        RETURNING "inStoreProductId"; `,
	releaseProduct: `
        UPDATE "inStoreProduct"
        SET "defaultPrice" = COALESCE($1, "defaultPrice"), "status" = '${SaleStatus.PUBLISHED}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "inStoreProductId" = $2
        RETURNING "inStoreProductId"; `,
	updateDefaultPrice: `
        UPDATE "inStoreProduct"
        SET "defaultPrice" = $1, "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "inStoreProductId" = $2;  `,
	updateToOnHold: `
        UPDATE "products"
        SET "status" = '${ProductStatus.ONHOLD}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "productId" = $1;  `,
	newProductByHead: `
        INSERT INTO "products" ("openId", "productName", "productDescription", "coverImageURL", "freeShipping", "idCardRequired", "status")
        VALUES ($1, $2, $3, $4, $5, $6, '${ProductStatus.PUBLISHED}')
        RETURNING "productId"; `,
	editProductByHead: `
        UPDATE "products"
        SET "productName" = $1, "productDescription" = $2, "freeShipping" = $3, "idCardRequired" = $4
        WHERE "productId" = $5; `,
	getPriceId: `
        SELECT "priceId"
        FROM "prices"
        WHERE "openIdChild" = $1 AND "inStoreProductId" = $2 ; `,
	getPrice: `
        SELECT COALESCE("price"."price", "inStoreProduct"."defaultPrice") AS "price"
        FROM "inStoreProduct"
                LEFT JOIN "price"
                ON "price"."inStoreProductId" = "inStoreProduct"."inStoreProductId" AND "openIdChild" = $2
        WHERE "inStoreProduct"."inStoreProductId" = $1 AND "inStoreProduct".status <> '${SaleStatus.DELETED}' ; `,
	getPriceByFatherAndProduct: `
        SELECT COALESCE("price"."price", "inStoreProduct"."defaultPrice") AS "price", "openIdFather"
        FROM "inStoreProduct"
                LEFT JOIN "price"
                ON "price"."inStoreProductId" = "inStoreProduct"."inStoreProductId" AND "openIdChild" = $3
        WHERE "inStoreProduct"."openId" = $1 AND "inStoreProduct"."productId" = $2 AND "inStoreProduct".status <> '${SaleStatus.DELETED}'; `,
	updatePriceForChild: `
        UPDATE "price"
        SET "price" = $1, "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "priceId" = $2; `,
	createOrUpdatePrice: `
        INSERT INTO "price" ("openIdChild", "inStoreProductId", "price")
        VALUES ($1, $2, $3)
        ON CONFLICT ON CONSTRAINT price_in_store_product_key
        DO UPDATE SET "price" = $3, "lastUpdatedAt" = CURRENT_TIMESTAMP
        RETURNING "priceId"; `,
	getProductBySerialId: `
        SELECT "products"."productId", "products"."coverImageURL", "idCardRequired", "freeShipping", "productName", "productDescription", productImages."images", ROW_TO_JSON("DealerSale") AS "dealerSale", ROW_TO_JSON("MySale") AS "mySale"
        FROM "products"
        INNER JOIN LATERAL (
        	SELECT "inStoreProduct"."openIdFather" AS "openId", "avatar", "name", COALESCE("price"."price", "inStoreProduct"."defaultPrice") AS "price", "inStoreProduct".inStoreProductId, "price"."priceId"
        	FROM "inStoreProduct"
        	LEFT JOIN "price"
        		ON "inStoreProduct"."productId" = "price"."productId" AND "price"."openIdFather" = "inStoreProduct"."openIdFather" AND "price"."openIdChild" = $1
        	, "users"
        	WHERE "inStoreProduct"."openIdFather" = "users"."openId" AND "inStoreProduct"."serialId" = $2 AND "products"."productId" = "inStoreProduct"."productId" AND "inStoreProduct"."status" = '${SaleStatus.PUBLISHED}'
        ) "DealerSale" ON TRUE
        LEFT JOIN LATERAL (
        	SELECT "inStoreProduct"."openIdFather" AS "openId", "avatar", "name", "inStoreProduct".inStoreProductId, "inStoreProduct"."status"
        	FROM "inStoreProduct", "users", "alias"
        	WHERE "inStoreProduct"."openIdFather" = "users"."openId" AND "inStoreProduct"."openIdFather" = "alias"."openIdChild" AND "alias"."openIdChild" = $1 AND "inStoreProduct"."openIdFather" = "DealerSale"."openId" AND "products"."productId" = "inStoreProduct"."productId" AND "alias".status = ''
        ) "MySale" ON TRUE
        LEFT JOIN LATERAL (
        	SELECT ARRAY_AGG(
                        "productImage"."imageURL"
                        ORDER BY "productImage"."priority"
                        ) AS "images"
        	FROM "productImage"
        	WHERE "productImage"."productId" = "products"."productId"
        	GROUP BY "products"."productId"
        ) productImages ON TRUE
        WHERE "products"."status" = '${ProductStatus.PUBLISHED}'; `,
	getSaleIdByOpenId: `
        SELECT "inStoreProduct"."inStoreProductId"
        FROM "inStoreProduct"
        WHERE "openId" = $1 AND "productId" = $2 AND "status" <> '${SaleStatus.DELETED}'`,
	insertImage: `
        INSERT INTO "productImage" ("productId", "imageURL", "priority")
        VALUES ($1, $2, $3); `,
	checkInStoreProduct: `
        SELECT "inStoreProduct"."inStoreProductId"
        FROM "inStoreProduct"
        WHERE "openId" = $1 AND "openIdFather" <> $2 AND "productId" = $3 AND "status" <> '${SaleStatus.DELETED}' `
}
