import { getPayload } from 'payload'
import config from '@payload-config'
import { GalleryGrid } from '@/components/frontend/GalleryGrid'
import { IntroAnimation } from '@/components/frontend/IntroAnimation'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Anna Blomgren — Artist & Illustrator',
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'art-pieces',
    sort: '-featured',
    depth: 1,
    limit: 200,
    overrideAccess: true,
  })

  return (
    <IntroAnimation>
      <div className="max-w-7xl mx-auto py-8">
        <GalleryGrid pieces={docs} />
      </div>
    </IntroAnimation>
  )
}
