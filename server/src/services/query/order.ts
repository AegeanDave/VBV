import { OrderStatus } from '../../constants'
export default {
	createNewOrder: `
        INSERT INTO "Orders" ("orderId", "originOrderId", "openId", "openIdChild", "addressId", "orderNumber", "status", "comment", "isOriginOrder")
        VALUES ($1, $2, CAST($3 AS VARCHAR), CAST($4 AS VARCHAR), $5, $6, '${OrderStatus.UNPAID}', $7, $8)
        RETURNING "createdAt";  `,
	createNewOrderDetail: `
        INSERT INTO "OrderDetails" ("orderId", "originOrderId", "productId", "quantity", "price", "openIdFather", "status")
        VALUES ($1, $2, $3, $4, $5, $6, '${OrderStatus.PENDING}'); `,
	updateOrderStatusToPending: `
        UPDATE "OrderDetails"
        SET "status" = '${OrderStatus.PENDING}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "orderId" = $1; `,
	updateOrderStatusToPaid: `
        UPDATE "Orders"
        SET "status" = '${OrderStatus.PAID}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "orderId" = $1; `,
	updateOrderStatusToPaidWithComment: `
        UPDATE "Orders"
        SET "status" = '${OrderStatus.PAID}', "newComment" = $2, "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "orderId" = $1; `,
	updateOrderStatusToCanceled: `
        UPDATE "Orders"
        SET "status" = '${OrderStatus.CANCELLED}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "orderId" = $1; `,
        updateOrderToHidden: `
        UPDATE "Orders"
        SET "active" = false, "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "orderId" = $1; `,
	updateOrderDetailStatusToCanceled: `
        UPDATE "OrderDetails"
        SET "status" = '${OrderStatus.CANCELLED}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "orderId" = $1 ; `,
	updateOrderDetailStatusToCanceledByWarehouse: `
        UPDATE "OrderDetails"
        SET "status" = '${OrderStatus.CANCELLED}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "originOrderId" = $1 AND "productId" = $2; `,
	updateOrderStatusToShipping: `
        UPDATE "OrderDetails"
        SET "status" = '${OrderStatus.SHIPPING}'
        WHERE "originOrderId" = $1; `,
	getAllSaleOrdersUpdated: `
        SELECT "order"."orderId", "order"."orderNumber", "order"."originOrderId", "order"."status", "order"."comment", "order"."newComment", JSON_BUILD_OBJECT('openId', "user"."openId", 'name', "user"."name", 'avatar', "user"."avatar") buyer, "order"."openId", "order"."createdAt", "order"."lastUpdatedAt", ARRAY_TO_JSON(ARRAY_AGG(ROW_TO_JSON(order_detail.*))) AS "subOrders", ROW_TO_JSON("address".*) AS "address"
        FROM "user", "address", "order"
        INNER JOIN LATERAL (
		SELECT JSON_BUILD_OBJECT('openId', "user"."openId", 'name', "user"."name", 'avatar', "user"."avatar") dealer, ARRAY_TO_JSON(ARRAY_AGG(ROW_TO_JSON("saleProducts".*))) AS "orderProducts"
		FROM "user", (
			SELECT "orderDetail"."productId", "orderDetail"."price", "product"."productName", "product"."productDescription", "product"."coverImageURL",  "quantity", "orderDetail"."status", "trackingNumber", "carrier", "orderDetail"."orderId", "orderDetail"."openIdFather", "orderDetail"."createdAt", "orderDetail"."lastUpdatedAt"
			FROM "product", "orderDetail"
			WHERE "product"."productId" = "orderDetail"."productId"
		) AS "saleProducts"
		WHERE "saleProducts"."orderId" = "order"."orderId" AND "user"."openId" = "saleProducts"."openIdFather" AND "order".status <> '${OrderStatus.CANCELLED}'
		GROUP BY "user"."openId"
	) order_detail ON true
        WHERE "order"."openId" = $1 AND "user"."openId" = "order"."openIdChild" AND "address"."addressId" = "order"."addressId" AND "order"."active" = true
        GROUP BY "order"."orderId", "user"."openId", "address"."addressId"
        ORDER BY "order"."lastUpdatedAt" DESC;`,
	getAllPurchasedOrdersByFirstOrder: `
        SELECT "mainOrder"."orderNumber", "mainOrder"."originOrderId", "subOrders", "mainOrder"."comment", "mainOrder"."newComment", "mainOrder"."createdAt", ROW_TO_JSON("address".*) AS "address"
        FROM "address", (
        	SELECT "order"."orderNumber", "order"."originOrderId", "order"."comment", "order"."newComment", "order"."openIdChild", min("order"."createdAt") AS "createdAt", "addressId"
        	FROM "order"
        	WHERE "openIdChild" = $1 AND "isOriginOrder" = true
                GROUP BY "order"."originOrderId", "order"."openIdChild", "order"."comment", "order"."newComment", "order"."orderNumber", "order"."addressId"
        ) "mainOrder"
        INNER JOIN LATERAL (
           	SELECT ARRAY_TO_JSON(ARRAY_AGG (JSON_BUILD_OBJECT('orderId', Orders_OrderDetail."orderId", 'dealer', JSON_BUILD_OBJECT('openId', Orders_OrderDetail."openId", 'name', "user"."name", 'avatar', "user"."avatar"), 'status', Orders_OrderDetail."status", 'createdAt', Orders_OrderDetail."createdAt", 'orderProducts', orderProducts) ORDER BY Orders_OrderDetail."createdAt" ASC)) AS "subOrders"
        	FROM "user", "order" AS Orders_OrderDetail
			INNER JOIN LATERAL (
        		        SELECT ARRAY_TO_JSON(ARRAY_AGG (JSON_BUILD_OBJECT('productId', "orderDetail"."productId", 'coverImageURL', "product"."coverImageURL", 'productName', "product"."productName", 'price', "orderDetail"."price", 'quantity', "orderDetail"."quantity", 'status', "orderDetail"."status", 'carrier', "carrier", 'trackingNumber', "trackingNumber", 'lastUpdatedAt', "orderDetail"."lastUpdatedAt"))) orderProducts
                                FROM "orderDetail", "product"
				WHERE Orders_OrderDetail."orderId" = "orderDetail"."orderId" AND "product"."productId" = "orderDetail"."productId"
			) OrderDetail_SaleProducts ON true
        	WHERE Orders_OrderDetail."openId" = "user"."openId" AND Orders_OrderDetail."originOrderId" = "mainOrder"."originOrderId" AND Orders_OrderDetail."openIdChild" = "mainOrder"."openIdChild" AND OrderDetail_SaleProducts.orderProducts IS NOT NULL
                ) "SubOrders" ON true
        WHERE "subOrders" IS NOT NULL AND "address"."addressId" = "mainOrder"."addressId"
        ORDER BY "mainOrder"."createdAt" DESC; `,
	getWarehouseOrders: `
        SELECT "order"."orderId", "order"."orderNumber", "order"."status", "order"."originOrderId", ROW_TO_JSON("address".*) AS address, "order"."comment", "order"."newComment", order_Detail."orderDetail" AS "orderProducts", order_Detail."trackingNumber", order_Detail.company, order_Detail.status AS "trackingStatus", "order"."openId", ROW_TO_JSON("user".*) AS buyer, "order"."createdAt", "order"."lastUpdatedAt"
        FROM "address", "order"
        	INNER JOIN "user"
        	ON "user"."openId" = "order"."openIdChild",
        LATERAl(
        	SELECT ARRAY_TO_JSON(ARRAY_AGG(ROW_TO_JSON(order_products))) AS "orderDetail", order_products.status, order_products."trackingNumber", order_products.carrier as company
        	FROM (
        		SELECT "product"."productId", "product"."productName", "product"."productDescription", "product"."coverImageURL", "product"."freeShipping", "product"."idCardRequired", "orderDetail".price, "orderDetail".quantity, "orderDetail".carrier, "orderDetail"."trackingNumber", "orderDetail".status, "orderDetail"."createdAt", "orderDetail"."lastUpdatedAt", "orderDetail"."openIdFather", "orderDetail"."orderId"
        		FROM product, "orderDetail"
        		WHERE product."productId" = "orderDetail"."productId" AND "orderDetail"."openIdFather" = $1
        	) AS order_products
        	WHERE order_products."orderId" = "order"."orderId"
        	GROUP BY order_products."orderId", order_products.status, order_products."trackingNumber", order_products.carrier
        ) AS order_Detail
        WHERE "order"."openId" = $1 AND "order"."status" = '${OrderStatus.PAID}' AND "address"."addressId" = "order"."addressId"
        ORDER BY "order"."lastUpdatedAt" DESC;`,
	getOrdersFromChild: `
        SELECT "order"."orderId", "order"."orderNumber", "order"."originOrderId", "order"."status", "order"."comment", "order"."newComment", JSON_BUILD_OBJECT('openId', "user"."openId", 'name', "user"."name", 'avatar', "user"."avatar") buyer, "order"."openId", "order"."createdAt", "order"."lastUpdatedAt", ARRAY_TO_JSON(ARRAY_AGG(ROW_TO_JSON(order_detail.*))) AS "subOrders", ROW_TO_JSON("address".*) AS "address"
        FROM "user", "address", "order"
        INNER JOIN LATERAL (
		SELECT JSON_BUILD_OBJECT('openId', "user"."openId", 'name', "user"."name", 'avatar', "user"."avatar") dealer, ARRAY_TO_JSON(ARRAY_AGG(ROW_TO_JSON("saleProducts".*))) AS "orderProducts"
		FROM "user", (
			SELECT "orderDetail"."productId", "product"."productName", "product"."productDescription", "product"."coverImageURL", "orderDetail".price, "quantity", "orderDetail"."status", "trackingNumber", "carrier", "orderDetail"."orderId", "orderDetail"."openIdFather", "orderDetail"."createdAt", "orderDetail"."lastUpdatedAt"
			FROM "product", "orderDetail"
			WHERE "product"."productId" = "orderDetail"."productId"
		) AS "saleProducts"
		WHERE "saleProducts"."orderId" = "order"."orderId" AND "user"."openId" = "saleProducts"."openIdFather"
		GROUP BY "user"."openId"
	) order_detail ON true
        WHERE "order"."openId" = $1 AND "user"."openId" = "order"."openIdChild" AND "address"."addressId" = "order"."addressId" AND "order"."openIdChild" = $2 AND "order"."status" <> '${OrderStatus.CANCELLED}' AND "order"."active" = true
        GROUP BY "order"."orderId", "user"."openId", "address"."addressId"
        ORDER BY "order"."lastUpdatedAt" DESC; `,
	getOrdersFromFather: `
        SELECT "order"."orderNumber", "order"."orderId", "order"."originOrderId", JSON_BUILD_OBJECT('openId', "user"."openId", 'name', "user"."name", 'avatar', "user"."avatar") AS "dealer", "order"."comment", "order"."newComment", "SubOrders"."orderProducts", "order"."createdAt", "order"."lastUpdatedAt", ROW_TO_JSON("address".*) AS "address", "order"."status"
        FROM "address", "user", "order"
        ,LATERAL (
           	SELECT ARRAY_TO_JSON(ARRAY_AGG (ROW_TO_JSON(OrderDetail_SaleProducts.*))) AS "orderProducts"
           	FROM LATERAL (
        		SELECT "orderDetail"."productId", "orderDetail"."openIdFather", "product"."productName", "product"."coverImageURL", "orderDetail".price, "orderDetail"."quantity", "orderDetail"."status", "carrier" AS carrier, "trackingNumber", "orderDetail"."lastUpdatedAt"
                        FROM "orderDetail", "product"
			WHERE "order"."orderId" = "orderDetail"."orderId" AND "orderDetail"."productId" = "product"."productId"
		) OrderDetail_SaleProducts
        	GROUP BY "order"."orderId"
        ) "SubOrders"
        WHERE "address"."addressId" = "order"."addressId" AND "openIdChild" = $1 AND "order"."openId" = $2 AND "user"."openId" = "order"."openId" AND "order"."status" <> '${OrderStatus.CANCELLED}' AND "order"."isOriginOrder" <> true
        ORDER BY "order"."createdAt" DESC; `,
	updateTrackingToShipping: `
        UPDATE "orderDetail"
        SET "carrier" = $1, "trackingNumber" = $2, "status"='${OrderStatus.SHIPPING}', "lastUpdatedAt" = CURRENT_TIMESTAMP, "shippingAt" = CURRENT_TIMESTAMP
        WHERE "originOrderId" = $3 AND "productId" = $4; `,
	updateTrackingInfo: `
        UPDATE "OrderDetails"
        SET "carrier" = $1, "trackingNumber" = $2, "status"='${OrderStatus.SHIPPING}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "originOrderId" = $3 AND "productId" = $4; `,
	getOpenIdChildByOriginalOrder: `
        SELECT "openIdChild"
        FROM "Orders"
        WHERE "originOrderId" = $1 AND "status" = '${OrderStatus.PAID}';  `
}
