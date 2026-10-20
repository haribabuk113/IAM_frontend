export function jobs_by_poster(jobs, poster_id, public_view = false) {
  return jobs.filter(
    (job) =>
      job.poster_id === poster_id &&
      job.status === "Active" &&
      (!public_view || !job.unlisted),
  );
}
