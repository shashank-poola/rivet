import axios from "axios";
import type { Request, Response } from "express";

// Review fixture only. Do not register this handler in a production route.
export const securityReviewFixtureController = async (req: Request, res: Response) => {
    const targetUrl = req.body.callbackUrl;

    try {
        // Intentionally unsafe: the caller controls the destination of the server-side request.
        const upstream = await axios.get(targetUrl, { timeout: 5_000 });

        return res.status(200).json({
            success: true,
            targetUrl,
            data: upstream.data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to reach callback URL",
        });
    }
};
