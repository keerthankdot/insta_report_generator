import { useMicrolinkImage } from '../../hooks/useMicrolinkImage'
import { formatNumber, type TopPost } from '../../lib/data'

export function PostCard({ post }: { post: TopPost }) {
  const { imageUrl, loading } = useMicrolinkImage(post.url)

  const Wrapper = post.url
    ? ({ children }: { children: React.ReactNode }) => (
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="block">
          {children}
        </a>
      )
    : ({ children }: { children: React.ReactNode }) => <div>{children}</div>

  return (
    <Wrapper>
    <div
      className={`flex w-full overflow-hidden rounded-2xl border border-white/8 ${post.url ? 'cursor-pointer hover:border-white/20 transition-all' : ''}`}
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


      </div>

      {/* stats panel */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold text-white">{post.brand}</div>
          <div className="text-[10px] text-white flex-shrink-0">
            {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-white">{post.engagementRate}%</span>
            <span className="ml-1 text-xs text-white/35">eng rate</span>
          </div>
          <div className="space-y-1 text-xs">
            <div>
              <span className="font-semibold text-white">{formatNumber(post.reach)}</span>
              <span className="ml-1 text-white/35">reach</span>
            </div>
            <div>
              <span className="font-semibold text-white">{formatNumber(post.likes)}</span>
              <span className="ml-1 text-white/35">likes</span>
            </div>
            <div>
              <span className="font-semibold text-white">{formatNumber(post.shares)}</span>
              <span className="ml-1 text-white/35">shares</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Wrapper>
  )
}
