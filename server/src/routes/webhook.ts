import { Router } from "express";
import { prisma } from "../prisma.js";
import { env } from "../config.js";

const router = Router();

/**
 * Parse flexible date formats into Date object
 */
function parseFlexibleDate(dateString: string): Date {
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (error) {
    console.warn("Failed to parse date:", dateString);
  }
  return new Date();
}

/**
 * Parse LinkedIn markdown format posts into structured data
 */
function parseLinkedInMarkdown(markdown: string): any[] {
  const posts: any[] = [];
  const lines = markdown.split("\n");

  let currentPost: any = null;
  let bodyStarted = false;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (line.startsWith("### ")) {
      if (currentPost && currentPost.title) {
        posts.push(currentPost);
      }
      currentPost = {
        title: line.replace("### ", "").trim(),
        body: "",
        postUrl: "",
        profileUrl: "",
        createdAt: "",
      };
      bodyStarted = false;
    } else if (line.startsWith("**Profile:**") && currentPost) {
      const urlMatch = line.match(/\]\(([^)]+)\)/);
      if (urlMatch) {
        currentPost.profileUrl = urlMatch[1].trim();
      }
    } else if (line.startsWith("**Posted:**") && currentPost) {
      const dateText = line.replace("**Posted:** ", "").trim();
      currentPost.createdAt = dateText;
    } else if (line.startsWith("**Post Content:**") && currentPost) {
      bodyStarted = true;
    } else if (line.startsWith("[View Full Post]") && currentPost) {
      const urlMatch = line.match(/\]\(([^)]+)\)/);
      if (urlMatch) {
        currentPost.postUrl = urlMatch[1].trim();
      }
    } else if (trimmedLine === "---" && currentPost) {
      if (currentPost.title && currentPost.postUrl) {
        posts.push(currentPost);
      }
      currentPost = null;
      bodyStarted = false;
    } else if (bodyStarted && trimmedLine && !trimmedLine.startsWith("**") && !trimmedLine.startsWith("[") && currentPost) {
      currentPost.body += line + "\n";
    }
  });

  if (currentPost && currentPost.title && currentPost.postUrl) {
    posts.push(currentPost);
  }

  return posts;
}

/**
 * Parse Reddit markdown format posts into structured data
 */
function parseMarkdownPosts(markdown: string): any[] {
  const posts: any[] = [];

  // Check if this is the grouped format (conversations_final)
  if (markdown.includes("## ") && markdown.includes("### ")) {
    return parseGroupedMarkdown(markdown);
  }

  // Simple format: Split by conversation headers
  const conversationBlocks = markdown.split(/# Conversation \d+/);

  conversationBlocks.forEach((block) => {
    if (!block.trim()) return;

    const post: any = {};

    const subredditMatch = block.match(/\*\*Subreddit:\*\* (.+)/);
    if (subredditMatch) {
      let subreddit = subredditMatch[1].trim();
      const linkMatch = subreddit.match(/\[r\/(\w+)\]/);
      if (linkMatch) {
        subreddit = linkMatch[1];
      } else {
        subreddit = subreddit.replace(/^r\//, "");
      }
      post.subreddit = subreddit;
    }

    const titleMatch = block.match(/\*\*Title:\*\* (.+)/);
    if (titleMatch) {
      post.title = titleMatch[1].trim();
    }

    const postedMatch = block.match(/\*\*Posted:\*\* (.+)/);
    if (postedMatch) {
      post.createdAt = postedMatch[1].trim();
    }

    const assessmentMatch = block.match(/\*\*Assessment:\*\* (.+)/);
    if (assessmentMatch) {
      post.assessment = assessmentMatch[1].trim();
    }

    const bodyMatch = block.match(/## Body\n([\s\S]*?)\n\[View Post\]/);
    if (bodyMatch) {
      post.body = bodyMatch[1].trim();
    }

    const urlMatch = block.match(/\[View (?:Post|Full Post)\]\((.+?)\)/);
    if (urlMatch) {
      post.postUrl = urlMatch[1].trim();
    }

    if (post.title && post.postUrl) {
      posts.push(post);
    }
  });

  return posts;
}

/**
 * Parse grouped markdown format (for conversations_final)
 */
function parseGroupedMarkdown(markdown: string): any[] {
  const posts: any[] = [];
  const lines = markdown.split("\n");

  let currentKeyword = "";
  let currentConv: any = null;
  let bodyStarted = false;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (line.startsWith("## ")) {
      currentKeyword = line.replace("## ", "").trim();
    } else if (line.startsWith("### ")) {
      if (currentConv && currentConv.title) {
        posts.push(currentConv);
      }
      currentConv = {
        keyword: currentKeyword,
        title: line.replace("### ", "").trim(),
        subreddit: "",
        createdAt: "",
        body: "",
        postUrl: "",
      };
      bodyStarted = false;
    } else if (line.startsWith("**Subreddit:**") && currentConv) {
      const linkMatch = line.match(/\[r\/(\w+)\]/);
      if (linkMatch) {
        currentConv.subreddit = linkMatch[1];
      } else {
        const plainMatch = line.match(/\*\*Subreddit:\*\* r\/(\w+)/);
        if (plainMatch) {
          currentConv.subreddit = plainMatch[1];
        }
      }
    } else if (line.startsWith("**Posted:**") && currentConv) {
      currentConv.createdAt = line.replace("**Posted:** ", "").trim();
    } else if (line.startsWith("**Discussion:**") && currentConv) {
      bodyStarted = true;
    } else if (line.startsWith("[View Full Post]") && currentConv) {
      const urlMatch = line.match(/\]\(([^)]+)\)/);
      if (urlMatch) {
        currentConv.postUrl = urlMatch[1].trim();
      }
    } else if (trimmedLine === "---" && currentConv) {
      if (currentConv.title && currentConv.postUrl) {
        posts.push(currentConv);
      }
      currentConv = null;
      bodyStarted = false;
    } else if (bodyStarted && trimmedLine && !trimmedLine.startsWith("**") && currentConv) {
      currentConv.body += line + "\n";
    }
  });

  if (currentConv && currentConv.title && currentConv.postUrl) {
    posts.push(currentConv);
  }

  return posts;
}

/**
 * Check if all selected platforms are completed and update overall status
 */
async function checkAndUpdateOverallStatus(searchId: string): Promise<void> {
  const search = await prisma.search.findUnique({
    where: { id: searchId },
    include: { platforms: true },
  });

  if (!search) return;

  const selectedPlatforms = search.platforms.filter((p) => p.selected);
  
  const allCompleted = selectedPlatforms.every(
    (p) => p.status === "completed" || p.status === "failed"
  );

  if (allCompleted) {
    const atLeastOneSucceeded = selectedPlatforms.some((p) => p.status === "completed");

    await prisma.search.update({
      where: { id: searchId },
      data: {
        // Frontend effect listens for status === "complete"
        status: atLeastOneSucceeded ? "complete" : "failed",
      },
    });
  }
}

/**
 * POST /api/webhook/n8n
 * Webhook endpoint for n8n to send back results
 */
router.post("/n8n", async (req, res) => {
  try {
    // Verify API key
    const requestSecret = req.headers["x-api-key"];

    if (!env.N8N_WEBHOOK_SECRET || requestSecret !== env.N8N_WEBHOOK_SECRET) {
      console.error("Invalid API key");
      return res.status(403).json({ error: "Forbidden: Invalid API key" });
    }

    const { searchId, stage, error, websiteData, keywords, keyword, passedPosts, platform, linkedinFinal } = req.body;

    if (!searchId) {
      return res.status(400).json({ error: "Missing searchId" });
    }

    // Get search document
    const search = await prisma.search.findUnique({
      where: { id: searchId },
    });

    if (!search) {
      return res.status(404).json({ error: "Search not found" });
    }

    // Handle error from n8n
    if (error) {
      await prisma.search.update({
        where: { id: searchId },
        data: {
          status: "FAILED",
          errorMessage: error,
        },
      });
      return res.json({ success: true, message: "Error recorded" });
    }

    // Determine which platform this webhook is for
    const webhookPlatform = platform ? platform.toUpperCase() : "REDDIT";

    // Handle different stages
    switch (stage) {
      case "website_analysis": {
        // Update only if not already set (first platform to report wins)
        if (!search.websiteInfo && websiteData && Array.isArray(websiteData) && websiteData.length > 0) {
          await prisma.search.update({
            where: { id: searchId },
            data: {
              // Frontend expects lowercase status values
              status: "analyzing",
              websiteInfo: JSON.stringify(websiteData[0]),
            },
          });
        }

        // Update platform status
        if (webhookPlatform) {
          await prisma.platform.updateMany({
            where: {
              searchId,
              name: webhookPlatform,
            },
            data: {
              status: "analyzing",
            },
          });
        }

        return res.json({ success: true, message: "Website analysis received" });
      }

      case "keywords_generated": {
        // Update only if not already set (first platform to report wins)
        if (!search.keywords && keywords) {
          const keywordsArray = Object.values(keywords);
          await prisma.search.update({
            where: { id: searchId },
            data: {
              status: "searching",
              keywords: JSON.stringify(keywordsArray),
            },
          });
        }

        // Update platform status
        if (webhookPlatform) {
          await prisma.platform.updateMany({
            where: {
              searchId,
              name: webhookPlatform,
            },
            data: {
              status: "searching",
            },
          });
        }

        return res.json({ success: true, message: "Keywords received" });
      }

      case "linkedin_final": {
        let postsToProcess: any[] = [];

        if (linkedinFinal && typeof linkedinFinal === "string") {
          postsToProcess = parseLinkedInMarkdown(linkedinFinal);
        }

        if (postsToProcess.length > 0) {
          // Create conversations
          await prisma.conversation.createMany({
            data: postsToProcess.map((post: any) => ({
              searchId,
              platform: "LINKEDIN",
              title: post.title || "",
              url: post.postUrl || "",
              excerpt: post.body ? post.body.trim() : "",
              author: post.author || "",
              authorProfileUrl: post.profileUrl || null,
              keyword: null,
              assessment: null,
              upvotes: 0,
              comments: 0,
              relevanceScore: null,
              postedAt: post.createdAt ? parseFlexibleDate(post.createdAt) : new Date(),
            })),
          });

          // Update counts
          const platformRecord = await prisma.platform.findFirst({
            where: { searchId, name: "LINKEDIN" },
          });

          await prisma.platform.updateMany({
            where: { searchId, name: "LINKEDIN" },
            data: {
              status: "completed",
              resultsCount: (platformRecord?.resultsCount || 0) + postsToProcess.length,
            },
          });

          await prisma.search.update({
            where: { id: searchId },
            data: {
              resultsCount: { increment: postsToProcess.length },
            },
          });
        } else {
          await prisma.platform.updateMany({
            where: { searchId, name: "LINKEDIN" },
            data: { status: "completed" },
          });
        }

        await checkAndUpdateOverallStatus(searchId);
        return res.json({ success: true, message: "LinkedIn results processed", conversationsCount: postsToProcess.length });
      }

      default: {
        // Handle conversations_partial and conversations_final for Reddit
        if (stage && (stage.startsWith("conversations_partial") || stage === "conversations_final")) {
          let postsToProcess: any[] = [];

          if (passedPosts) {
            if (typeof passedPosts === "string") {
              const trimmed = passedPosts.trim();
              // n8n sentinel value when no conversations were found for a keyword
              if (trimmed !== "no_conversations_found") {
                postsToProcess = parseMarkdownPosts(trimmed);
              }
            } else if (Array.isArray(passedPosts)) {
              passedPosts.forEach((item: any) => {
                if (!item || !item.passed_post) return;

                // Support both the normal array payload and sentinel string
                if (typeof item.passed_post === "string") {
                  const inner = item.passed_post.trim();
                  if (inner === "no_conversations_found") {
                    return;
                  }
                  postsToProcess = postsToProcess.concat(parseMarkdownPosts(inner));
                } else if (Array.isArray(item.passed_post)) {
                  postsToProcess = postsToProcess.concat(item.passed_post);
                }
              });
            }
          }

          if (postsToProcess.length > 0) {
            await prisma.conversation.createMany({
              data: postsToProcess.map((post: any) => ({
                searchId,
                platform: webhookPlatform,
                title: post.title || "",
                url: post.postUrl || post.url || "",
                excerpt: post.body || post.excerpt || "",
                author: post.author || "",
                subreddit: post.subreddit || null,
                authorProfileUrl: null,
                keyword: keyword || post.keyword || null,
                assessment: post.assessment || null,
                upvotes: post.upvotes || post.engagement?.upvotes || 0,
                comments: post.comments || post.engagement?.comments || 0,
                relevanceScore: post.relevanceScore || null,
                postedAt: post.createdAt ? parseFlexibleDate(post.createdAt) : new Date(),
              })),
            });

            // Update counts
            const platformRecord = await prisma.platform.findFirst({
              where: { searchId, name: webhookPlatform },
            });

            await prisma.platform.updateMany({
              where: { searchId, name: webhookPlatform },
              data: {
                status: stage === "conversations_final" ? "completed" : "searching",
                resultsCount: (platformRecord?.resultsCount || 0) + postsToProcess.length,
              },
            });

            await prisma.search.update({
              where: { id: searchId },
              data: {
                // When final batch arrives, mark search as complete for the frontend.
                status: stage === "conversations_final" ? "complete" : "searching",
                resultsCount: { increment: postsToProcess.length },
              },
            });
          }

          if (stage === "conversations_final") {
            if (postsToProcess.length === 0) {
              await prisma.platform.updateMany({
                where: { searchId, name: webhookPlatform },
                data: { status: "completed" },
              });
            }
            await checkAndUpdateOverallStatus(searchId);
          }

          return res.json({
            success: true,
            message: stage === "conversations_final" ? "Final results processed" : "Conversations received",
            conversationsCount: postsToProcess.length,
            stage,
          });
        }

        return res.status(400).json({ error: "Unknown stage: " + stage });
      }
    }
  } catch (error: any) {
    console.error("Error in POST /api/webhook/n8n:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
