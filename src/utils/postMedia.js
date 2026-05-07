/**
 * Normalize post media from API for vendor UI.
 * Supports legacy `images` / `videoUrl`, standard `media[]`, and triple `containers[]`.
 */
export function getPostMediaItems(post) {
  if (!post) return [];

  if (post.type === "Reel" && post.videoUrl) {
    return [{ url: post.videoUrl, mediaType: "video" }];
  }

  if (post.layout === "triple" && Array.isArray(post.containers) && post.containers.length > 0) {
    return post.containers.flatMap((c) =>
      (c.media || []).map((m) => ({
        url: m.url,
        mediaType: m.mediaType === "video" ? "video" : "image",
      }))
    );
  }

  if (Array.isArray(post.media) && post.media.length > 0) {
    return post.media.map((m) => ({
      url: m.url,
      mediaType: m.mediaType === "video" ? "video" : "image",
    }));
  }

  if (Array.isArray(post.images) && post.images.length > 0) {
    return post.images.map((url) => ({ url, mediaType: "image" }));
  }

  return [];
}
