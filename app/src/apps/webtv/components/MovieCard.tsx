
import type { VodItem } from '../lib/types';

/** 影片卡片：海报 + 首字兜底（等价原版 movie-card 模板） */
export default function MovieCard({
  movie,
  siteName,
  onClick,
}: {
  movie: VodItem;
  siteName?: string;
  onClick: () => void;
}) {
  const name = movie.vod_name || '';
  return (
    <div className="movie-card" onClick={onClick}>
      {movie.vod_pic ? (
        <>
          <img
            className="card-poster"
            src={movie.vod_pic}
            alt={name}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = 'none';
              const next = img.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = 'flex';
            }}
          />
          <div className="card-no-poster" style={{ display: 'none' }}>{(name || '?').charAt(0)}</div>
        </>
      ) : (
        <div className="card-no-poster">{(name || '?').charAt(0)}</div>
      )}
      <div className="card-body">
        <div className="card-title" title={name}>{name}</div>
        {movie.vod_remarks ? <div className="card-remarks">{movie.vod_remarks}</div> : null}
        {siteName ? (
          <div className="card-meta">{siteName}</div>
        ) : movie.vod_year ? (
          <div className="card-meta">{movie.vod_year}</div>
        ) : null}
      </div>
    </div>
  );
}
