import { OrderStatus, AliasStatus, AddressStatus } from '../../constants'
export default {
	createNewUserWithoutInfo: `
        INSERT INTO "users" ("openId")
        VALUES ($1)
        ON CONFLICT ("openId") DO UPDATE SET "openId" = $1;  `,
	updateUserInfo: `
        UPDATE "users"
        SET "name" = $1, "avatar" = $2
        WHERE "openId" = $3; `,
	getAllChildren: `
        SELECT "username", "users"."openId", "users"."avatar", "connections"."id",
                EXISTS(SELECT "order"."status"
                        FROM "order"
                        WHERE "order"."openId" = "connections"."openId" AND "order"."openIdChild" = "connections"."openIdChild" AND "order"."status" = '${OrderStatus.UNPAID}') AS "ifUnpaid"
        FROM "users", "connections"
        WHERE "users"."openId" = "connections"."openIdChild" AND "connections"."openId" = $1 AND "connections"."status" = '${AliasStatus.ENABLED}';  `,
	getAllFathers: `
        SELECT "users"."username", "users"."openId", "users"."avatarUrl", "connections"."id",
                EXISTS(SELECT "order"."status"
                        FROM "order"
                        WHERE "order"."openId" = "connections"."openId" AND "order"."openIdChild" = "connections"."openIdChild" AND "order"."status" = '${OrderStatus.UNPAID}') AS "ifUnpaid"
        FROM "users", "connections"
        WHERE "users"."openId" = "connections"."openId" AND "connections"."openIdChild" = $1 AND "connections"."status" = '${AliasStatus.ENABLED}';  `,
	updateAliasStatusToDisabled: `
        UPDATE "connections"
        SET "status" = '${AliasStatus.DISABLED}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "aliasId" = $1
        RETURNING "openId", "openIdChild";  `,
	createOrUpdateAlias: `
        INSERT INTO "connections" ("openId", "openIdChild", "status")
        VALUES($1, $2, '${AliasStatus.ENABLED}')
        ON CONFLICT ON CONSTRAINT alias_connection_key
        DO UPDATE SET "status" = '${AliasStatus.ENABLED}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        RETURNING "openId"; `,
	getChildrenNumber: `
        SELECT COUNT("openIdChild")
        FROM "connections"
        WHERE "openId" = $1 AND "status" = '${AliasStatus.ENABLED}';  `,
	getUserName: `
        SELECT "name"
        FROM "users"
        WHERE "openId" = $1;  `,
	getFatherNumber: `
        SELECT COUNT("openId")
        FROM "connections"
        WHERE "openIdChild" = $1 AND "status" = '${AliasStatus.ENABLED}';  `,
	allAddress: `
        SELECT * FROM "address"
        WHERE "openId" = $1 AND "status" <> '${AddressStatus.DISABLED}'
        ORDER BY "createdAt" DESC; `,
	getAddressById: `
        SELECT * FROM "address"
        WHERE "addressId" = $1; `,
	newAddressWithFile: `
        INSERT INTO "address" ("openId", "street", "city", "province", "country", "name", "phone", "idFrontImage", "idBackImage", "quickInputAddress")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);  `,
	newAddressWithoutFile: `
        INSERT INTO "address" ("openId", "street", "city", "province", "country", "name", "phone")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING "addressId";  `,
	newAddressWithComment: `
        INSERT INTO "address" ("openId", "quickInputAddress")
        VALUES ($1, $2)
        RETURNING "addressId";  `,
	updateAddressWithImageOne: `
        UPDATE "address"
        SET "idFrontImage" = $1, "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "addressId" = $2 AND "openId" = $3;  `,
	updateAddressWithImageTwo: `
        UPDATE "address"
        SET "idBackImage" = $1, "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "addressId" = $2 AND "openId" = $3;  `,
	selectAddressImages: `
        SELECT "idFrontImage", "idBackImage"
        FROM "address"
        WHERE "addressId" = $1 AND "idFrontImage" IS NULL OR "idBackImage" IS NULL;`,
	deleteAddress: `
        UPDATE "address"
        SET "status" = '${AddressStatus.DISABLED}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "addressId" = $1 AND "openId" = $2; `,
	myCodes: `
        SELECT ARRAY_AGG ("code"
                ORDER BY "createdAt") AS "codes"
        FROM "aliasCode"
        WHERE "openId" = $1 AND "status" = '${AliasStatus.ENABLED}'
        GROUP BY "openId";  `,
	allCodes: `
        SELECT "code"
        FROM "aliasCode"
        WHERE "openId" = $1;  `,
	findOpenIdByCode: `
        SELECT "openId"
        FROM "aliasCode"
        WHERE "code" = $1 AND "status" = '${AliasStatus.ENABLED}' ;  `,
	findOpenIdAndCode: `
        SELECT "openId", status
        FROM "aliasCode"
        WHERE "code" = $1;  `,
	findAliasByOpenId: `
        SELECT "aliasId", "status"
        FROM "connections"
        WHERE "openIdFather" = $1 AND "openIdChild" = $2;  `,
	findEnableAliasByOpenId: `
        SELECT "aliasId", "status"
        FROM "connections"
        WHERE "openIdFather" = $1 AND "openIdChild" = $2 AND "status" = '${AliasStatus.ENABLED}';  `,
	newCode: `
        INSERT INTO "aliasCode" ("openId", "code", "status")
        VALUES ($1, $2, '${AliasStatus.ENABLED}'); `,
	usedCode: `
        UPDATE "aliasCode"
        SET "status" = '${AliasStatus.DISABLED}', "lastUpdatedAt" = CURRENT_TIMESTAMP
        WHERE "code" = $1 AND "openId" = $2; `
}
