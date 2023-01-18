import { PrismaClient } from "@prisma/client";
import { getImageJson } from "../../../utils/db";
import { middleware } from "../../../utils/api";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    const { imageId } = req.query;

    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(imageId)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `imageId` parameter. Expected a UUID.",
            success: false,
        });
    }

    const prisma = new PrismaClient();

    const image = await prisma.images.findUnique({
        where: {
            id: imageId
        }
    });

    res.status(200).json({
        'data': await getImageJson(image, prisma),
        'success': true
    });

    prisma.$disconnect();
}