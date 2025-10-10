function isVisible(item, now = new Date()) {
  const n = new Date(now).getTime();
  if (item.status !== 'published') return false;
  if (!item.schedule) return true;
  const { startAt, endAt } = item.schedule;
  if (startAt && isNaN(Date.parse(startAt))) return false;
  if (endAt && isNaN(Date.parse(endAt))) return false;
  const start = startAt ? new Date(startAt).getTime() : -Infinity;
  const end = endAt ? new Date(endAt).getTime() : Infinity;
  return n >= start && n <= end;
}

function resolveBanners(list, now = new Date()) {
  const visible = list.filter((b) => isVisible(b, now));
  return visible.sort((a, b) => {
    const ap = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bp = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    if (bp !== ap) return bp - ap; // latest first
    return (b.order || 0) - (a.order || 0); // higher order first
  });
}

module.exports = { isVisible, resolveBanners };

