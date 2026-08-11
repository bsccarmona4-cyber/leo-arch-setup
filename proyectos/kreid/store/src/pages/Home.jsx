import { useCart } from '../contexts/CartContext'
import { trackAddToCart } from '../lib/analytics'
import HeroSection from '../components/home/HeroSection'
import QuizSection from '../components/home/QuizSection'
import BenefitsSection from '../components/home/BenefitsSection'
import FeaturedProducts from '../components/home/FeaturedProducts'
import CollectionsSection from '../components/home/CollectionsSection'
import Testimonials from '../components/home/Testimonials'
import NewsletterSection from '../components/home/NewsletterSection'
import ScrubCanvas from '../components/effects/ScrubCanvas'
import HorizontalScroll from '../components/effects/HorizontalScroll'

/* ─── Datos ─── */
const featuredProducts = [
  {
    id: 'led-mask',
    name: 'LED Light Therapy Mask',
    price: 1999,
    original_price: 2499,
    rating: 4.8,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80',
    category: 'Rostro',
  },
  {
    id: 'boots-compression',
    name: 'Botas de Compresion Bienestar',
    price: 2499,
    original_price: 3299,
    rating: 4.5,
    reviews: 47,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    category: 'Cuerpo',
  },
  {
    id: 'roller-jade',
    name: 'Rodillo Facial de Jade',
    price: 349,
    original_price: null,
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80',
    category: 'Rostro',
  },
  {
    id: 'thermometer-ir',
    name: 'Termometro Infrarrojo Digital',
    price: 459,
    original_price: 599,
    rating: 4.6,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&q=80',
    category: 'Bienestar',
  },
]

const testimonials = [
  {
    name: 'Sofia M.',
    location: 'CDMX, 17 anos',
    rating: 5,
    text: 'El rodillo de jade cambio mi rutina de skincare. Lo uso todas las noches mientras veo TikTok y mi piel esta mucho mas lisa. Ademas el precio es super accesible.',
    avatar: 'SM',
  },
  {
    name: 'Ana Sofia R.',
    location: 'Monterrey, 42 anos',
    rating: 5,
    text: 'Las botas de compresion me ayudan muchisimo despues de caminar. Tengo 42 y mis piernas lo agradecen. La entrega fue rapidisima, llego en 5 dias.',
    avatar: 'AS',
  },
  {
    name: 'Valentina G.',
    location: 'Guadalajara, 35 anos',
    rating: 5,
    text: 'La mascarilla LED es mi momento de autocuidado. Entre el trabajo y los ninos, esos 15 minutos son solo para mi. Mi piel se ve mas firme y descansada.',
    avatar: 'VG',
  },
]

export default function Home() {
  const { addItem } = useCart()

  const handleQuickAdd = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    trackAddToCart(product)
  }

  return (
    <>
      <HeroSection />
      <FeaturedProducts products={featuredProducts} onQuickAdd={handleQuickAdd} />
      <CollectionsSection />
      <QuizSection />
      <BenefitsSection />
      <ScrubCanvas />
      <HorizontalScroll />
      <Testimonials testimonials={testimonials} />
      <NewsletterSection />
    </>
  )
}
