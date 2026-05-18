import { useMicrolinkImage } from '../../hooks/useMicrolinkImage'
import { PlatformBadge } from './Badge'
import { formatNumber, type TopPost } from '../../lib/data'

export function PostCard({ post, rank }: { post: TopPost; rank: number }) {
  const { imageUrl, loading } = useMicrolinkImage(post.url)

  return (
    <div
      className="flex w-full overflow-hidden rounded-2xl border border-white/8"
      style={{ background: 'rgba(255,255,255,0.04)', aspectRatio: '16/9' }}
    >
      {/* 4:5 image area */}
      <div className="relative flex-shrink-0" style={{ aspectRatio: '4/5', height: '100%' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.caption}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              </div>
            )}
          </div>
        )}

        {/* rank */}
        <div className="absolute left-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[10px] font-semibold text-white/70 backdrop-blur-sm">
          {rank}
        </div>

        {/* platform badge */}
        <div className="absolute right-2 top-2">
          <PlatformBadge platform={post.platform} />
        </div>

        {/* caption gradient overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 p-2.5"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%)' }}
        >
          <p className="line-clamp-2 text-[11px] leading-snug text-white">{post.caption}</p>
        </div>
      </div>

      {/* stats panel */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div>
          <div className="text-xs font-medium text-white/60">{post.brand}</div>
          <div className="mt-0.5 text-[10px] text-white/30">{post.date}</div>
        </div>
        <div>
          <div className="mb-2">
            <span className="text-xl font-bold text-white">{post.engagementRate}%</span>
            <span className="ml-1 text-[10px] text-white/35">eng rate</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div>
              <span className="font-medium text-white">{formatNumber(post.reach)}</span>
              <span className="ml-1 text-white/35">reach</span>
            </div>
            <div>
              <span className="font-medium text-white">{formatNumber(post.likes)}</span>
              <span className="ml-1 text-white/35">likes</span>
            </div>
            <div>
              <span className="font-medium text-white">{formatNumber(post.shares)}</span>
              <span className="ml-1 text-white/35">shares</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
