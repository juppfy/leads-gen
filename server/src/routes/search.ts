import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { env } from "../config.js";

const router = Router();

/**
 * POST /api/search
 * Create a new search and trigger n8n workflows
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { productUrl, platforms } = req.body;
    const userId = req.user!.id;

    // Validate input
    if (!productUrl || typeof productUrl !== "string") {
      return res.status(400).json({ error: "Product URL is required and must be a string" });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ error: "At least one platform must be selected" });
    }

    // Validate platforms
    const validPlatforms = ["REDDIT", "LINKEDIN", "TWITTER"];
    const invalidPlatforms = platforms.filter((p: string) => !validPlatforms.includes(p.toUpperCase()));
    
    if (invalidPlatforms.length > 0) {
      return res.status(400).json({ error: `Invalid platforms: ${invalidPlatforms.join(", ")}` });
    }

    // Create search with platforms in a transaction
    const search = await prisma.$transaction(async (tx) => {
      // Create search
      const newSearch = await tx.search.create({
        data: {
          userId,
          productUrl,
          status: "PENDING",
          keywords: null,
          websiteInfo: null,
          resultsCount: 0,
        },
      });

      // Create platform entries
      const platformData = validPlatforms.map((platform) => ({
        searchId: newSearch.id,
        name: platform, // REDDIT, LINKEDIN, or TWITTER as string
        selected: platforms.map((p: string) => p.toUpperCase()).includes(platform),
        status: "pending",
        resultsCount: 0,
      }));

      await tx.platform.createMany({
        data: platformData,
      });

      // Increment user search count
      await tx.user.update({
        where: { id: userId },
        data: { searchCount: { increment: 1 } },
      });

      return newSearch;
    });

    const searchId = search.id;

    // Send to n8n webhooks for each selected platform
    const webhookPromises = platforms.map(async (platform: string) => {
      const platformUpper = platform.toUpperCase();
      let webhookUrl: string | undefined;

      switch (platformUpper) {
        case "REDDIT":
          webhookUrl = env.N8N_WEBHOOK_REDDIT;
          break;
        case "LINKEDIN":
          webhookUrl = env.N8N_WEBHOOK_LINKEDIN;
          break;
        case "TWITTER":
          webhookUrl = env.N8N_WEBHOOK_TWITTER;
          break;
      }

      if (!webhookUrl) {
        console.warn(`Webhook URL not configured for platform: ${platform}`);
        // Mark platform as failed
        await prisma.platform.updateMany({
          where: {
            searchId,
            name: platformUpper,
          },
          data: {
            status: "failed",
            errorMessage: "Webhook URL not configured",
          },
        });
        return;
      }

      try {
        console.log(`Sending webhook to ${platform} at ${webhookUrl}`);
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.N8N_WEBHOOK_SECRET || "",
          },
          body: JSON.stringify({
            searchId,
            productUrl,
            userId,
            platform: platform.toLowerCase(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed with status: ${response.status}`);
        }
        console.log(`Successfully sent webhook to ${platform}`);
      } catch (error: any) {
        console.error(`Error sending to ${platform} webhook:`, error);
        // Mark platform as failed but don't fail entire search
        await prisma.platform.updateMany({
          where: {
            searchId,
            name: platformUpper,
          },
          data: {
            status: "failed",
            errorMessage: error.message,
          },
        });
      }
    });

    await Promise.all(webhookPromises);

    res.status(201).json({
      success: true,
      searchId,
      message: "Search request submitted successfully",
    });
  } catch (error: any) {
    console.error("Error in POST /api/search:", error);
    res.status(500).json({ error: error.message || "Failed to process search request" });
  }
});

/**
 * GET /api/search/stats
 * Get aggregate search stats + recent searches for the authenticated user
 *
 * NOTE: This must be declared before `/:id` routes so `/stats` isn't treated as a searchId.
 */
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalSearches, activeSearches, totalLeadsAgg, searchesThisMonth, recentSearches] =
      await Promise.all([
        prisma.search.count({
          where: { userId },
        }),
        prisma.search.count({
          where: {
            userId,
            status: {
              in: ["pending", "analyzing", "searching"],
            },
          },
        }),
        prisma.search.aggregate({
          _sum: { resultsCount: true },
          where: { userId },
        }),
        prisma.search.count({
          where: {
            userId,
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),
        prisma.search.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            productUrl: true,
            createdAt: true,
            resultsCount: true,
          },
        }),
      ]);

    const stats = {
      totalSearches,
      activeSearches,
      totalLeads: totalLeadsAgg._sum.resultsCount || 0,
      searchesThisMonth,
      recent: recentSearches,
    };

    res.json(stats);
  } catch (error: any) {
    console.error("Error in GET /api/search/stats:", error);
    res.status(500).json({ error: error.message || "Failed to fetch search stats" });
  }
});

/**
 * GET /api/search/:id
 * Get a specific search with its platforms
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const search = await prisma.search.findFirst({
      where: {
        id,
        userId, // Ensure user owns this search
      },
      include: {
        platforms: true,
      },
    });

    if (!search) {
      return res.status(404).json({ error: "Search not found" });
    }

    // Parse JSON fields
    const response = {
      ...search,
      keywords: search.keywords ? JSON.parse(search.keywords) : [],
      websiteInfo: search.websiteInfo ? JSON.parse(search.websiteInfo) : null,
    };

    res.json(response);
  } catch (error: any) {
    console.error("Error in GET /api/search/:id:", error);
    res.status(500).json({ error: error.message || "Failed to fetch search" });
  }
});

/**
 * GET /api/search/:id/conversations
 * Get all conversations for a search
 */
router.get("/:id/conversations", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify user owns this search
    const search = await prisma.search.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!search) {
      return res.status(404).json({ error: "Search not found" });
    }

    // Get conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        searchId: id,
      },
      orderBy: [
        { relevanceScore: "desc" },
        { foundAt: "desc" },
      ],
    });

    res.json(conversations);
  } catch (error: any) {
    console.error("Error in GET /api/search/:id/conversations:", error);
    res.status(500).json({ error: error.message || "Failed to fetch conversations" });
  }
});

/**
 * GET /api/search
 * Get all searches for the authenticated user (search history)
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const searches = await prisma.search.findMany({
      where: {
        userId,
      },
      include: {
        platforms: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Parse JSON fields
    const response = searches.map((search) => ({
      ...search,
      keywords: search.keywords ? JSON.parse(search.keywords) : [],
      websiteInfo: search.websiteInfo ? JSON.parse(search.websiteInfo) : null,
    }));

    res.json(response);
  } catch (error: any) {
    console.error("Error in GET /api/search:", error);
    res.status(500).json({ error: error.message || "Failed to fetch searches" });
  }
});

/**
 * DELETE /api/search/:id
 * Delete a search (and its conversations via cascade)
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify user owns this search
    const search = await prisma.search.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!search) {
      return res.status(404).json({ error: "Search not found" });
    }

    // Delete (platforms and conversations will cascade)
    await prisma.search.delete({
      where: { id },
    });

    res.json({ success: true, message: "Search deleted successfully" });
  } catch (error: any) {
    console.error("Error in DELETE /api/search/:id:", error);
    res.status(500).json({ error: error.message || "Failed to delete search" });
  }
});

export default router;
