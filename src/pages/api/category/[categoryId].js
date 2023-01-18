import { PrismaClient } from "@prisma/client";
import { parseCategory } from "../../../utils/db/parsers";
import { middleware } from "../../../utils/api";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }
    
    const { categoryId } = req.query;

    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(categoryId)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `categoryId` parameter. Expected a UUID.",
            success: false,
        });
    }

    const prisma = new PrismaClient();

    const category = await prisma.categories.findUnique({
        where: {
            id: categoryId
        }
    });

    if (!category) {
        res.status(404).json({
            code: 404,
            message: "Category not found.",
            success: false,
        });
    }

    res.status(200).json({
        'data': await parseCategory(category, prisma),
        'success': true
    });

    prisma.$disconnect();
}