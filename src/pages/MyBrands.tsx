import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { PlatformBadge } from '../components/ui/Badge'
import { HealthBadge } from '../components/ui/HealthBadge'
import { getCurrentUser } from '../lib/auth'
import { getBrandsForUser, getBrandHealth, type Brand } from '../lib/data'

function BrandLogo({ brand }: { brand: Brand }) {
  const [failed, setFailed] = useState(false)

  if (brand.logoDomain && !failed) {
    return (
      <img
        src={`https://logo.clearbit.com/${brand.logoDomain}`}
        alt={brand.name}
        onError={() => setFailed(true)}
        className="h-10 w-10 rounded-xl object-contain bg-white p-1"
      />
    )
  }

  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white"
      style={{ backgroundColor: brand.color }}
    >
      {brand.name.charAt(0)}
    </div>
  )
}

export default function MyBrands() {
  const user = getCurrentUser()!
  const brands = getBrandsForUser(user.name, user.role)

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white">My Brands</h1>
        <p className="mt-1 text-sm text-white/50">{brands.length} active accounts</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => {
          const health = getBrandHealth(brand.id)
          return (
            <Link to={`/am/${brand.id}`} key={brand.id} className="block">
              <Card hover className="flex flex-col justify-between" style={{ height: '180px' }}>
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <BrandLogo brand={brand} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{brand.name}</div>
                      <div className="text-xs text-white/40 mt-0.5">{brand.amName}</div>
                    </div>
                  </div>
                  <ArrowRight size={15} className="mt-1 flex-shrink-0 text-white/25" />
                </div>

                {/* Middle: health + platforms */}
                <div className="mt-4 space-y-3">
                  <HealthBadge signal={health.signal} reason={health.reason} />
                  <div className="flex flex-wrap gap-1.5">
                    {brand.platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
                  </div>
                </div>

                {/* Bottom: creators (uniform height anchor) */}
                <div className="mt-4 border-t border-white/8 pt-3">
                  <p className="text-[10px] text-white/30 truncate">
                    {brand.creatorNames.slice(0, 3).join(' · ')}
                    {brand.creatorNames.length > 3 ? ` +${brand.creatorNames.length - 3}` : ''}
                  </p>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
