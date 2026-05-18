import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { PlatformBadge } from '../components/ui/Badge'
import { getCurrentUser } from '../lib/auth'
import { BRAND_METRICS, FORTNIGHT_BRAND, formatNumber, getBrandsForUser } from '../lib/data'

export default function MyBrands() {
  const user = getCurrentUser()!

  const brands = getBrandsForUser(user.name, user.role)

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {user.role === 'am' ? 'My Brands' : 'Brands'}
        </h1>
        <p className="mt-1 text-sm text-white/50">{brands.length} active accounts</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => {
          const metrics = BRAND_METRICS.find((m) => m.brandId === brand.id)
          const f = FORTNIGHT_BRAND[brand.id]
          return (
            <Link to={`/am/${brand.id}`} key={brand.id} className="block">
              <Card hover>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="text-base font-semibold text-white">{brand.name}</div>
                    <div className="mt-0.5 text-xs text-white/40">{brand.amName}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {brand.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
                    </div>
                  </div>
                  <ArrowRight size={15} className="mt-1 flex-shrink-0 text-white/25" />
                </div>

                {metrics && (
                  <div className="mb-3 space-y-1.5">
                    {metrics.platforms.map((p) => (
                      <div key={p.platform} className="flex items-center justify-between text-xs">
                        <span className="text-white/40">{p.platform}</span>
                        <span className="font-medium text-white">
                          {formatNumber(p.primary.value)}{' '}
                          <span className="font-normal text-white/35">{p.primary.label.toLowerCase()}</span>
                          {p.secondary[0] && (
                            <span className="ml-2 text-white/35">
                              · {formatNumber(p.secondary[0].value)} {p.secondary[0].label.toLowerCase()}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {f && (
                  <div className="flex gap-5 border-t border-white/8 pt-3 text-xs">
                    <span className="text-white/40">
                      <span className="font-medium text-white">{f.postsPublished}</span> posts
                    </span>
                    <span className="text-white/40">
                      <span className="font-medium text-white">{f.engagementRate}%</span> eng
                    </span>
                    <span className="text-white/40">
                      <span className="font-medium text-white">{f.hoursLogged}h</span> logged
                    </span>
                  </div>
                )}
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
