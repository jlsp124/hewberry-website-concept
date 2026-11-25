export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export function seekOnScroll(video: HTMLVideoElement) {
  let target = 0;
  let requested = false;

  function seek() {
    if (video.seeking || video.readyState < 1 || !Number.isFinite(video.duration)) return;
    const time = target * Math.max(0, video.duration - .075);
    if (Math.abs(video.currentTime - time) > .04) video.currentTime = time;
  }

  video.addEventListener('loadeddata', () => {
    video.dataset.frame = 'true';
    seek();
  });
  video.addEventListener('seeked', seek);
  video.addEventListener('error', () => { delete video.dataset.frame; });

  return (value: number) => {
    target = clamp(value);
    if (!requested) {
      const src = video.dataset.src;
      if (!src) return;
      requested = true;
      video.preload = 'auto';
      video.src = src;
      video.load();
    }
    seek();
  };
}
