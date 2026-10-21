// Extracts the video id from watch, youtu.be, shorts, embed and live URLs
export const getYoutubeId = (url: string): string | null => {
  const match = url
    .trim()
    .match(
      /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})(?:[?&#/].*)?$/
    );
  return match ? match[1] : null;
};
