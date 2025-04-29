import { useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Define slider images and content
const slides = [
  {
    id: 1,
    title: "Smart Crypto Investing",
    subtitle: "Let us help you grow your assets",
    description: "Build your portfolio with our advanced trading algorithms and real-time market insights.",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80",
    stats: [
      { value: "4500+", label: "Happy Users" },
      { value: "3.2M", label: "Assets Managed" },
      { value: "24/7", label: "Customer Support" },
      { value: "7 Days", label: "Free Premium Trial" }
    ]
  },
  {
    id: 2,
    title: "Multi-Chain Portfolio",
    subtitle: "Manage all your assets in one place",
    description: "Support for Bitcoin, Ethereum, Solana, Cardano, Polkadot and more - all in a single dashboard.",
    image: "https://images.unsplash.com/photo-1621932953986-15fcae0575eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    stats: [
      { value: "12+", label: "Blockchains" },
      { value: "100+", label: "Cryptocurrencies" },
      { value: "Fast", label: "Transactions" },
      { value: "Low", label: "Transaction Fees" }
    ]
  },
  {
    id: 3,
    title: "Secure Crypto Storage",
    subtitle: "Bank-grade security for your assets",
    description: "Enterprise-level encryption and multi-factor authentication to keep your investments safe.",
    image: "https://images.unsplash.com/photo-1635236066449-5631e032053f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    stats: [
      { value: "99.99%", label: "Uptime" },
      { value: "Cold", label: "Storage" },
      { value: "2FA", label: "Authentication" },
      { value: "Real-time", label: "Monitoring" }
    ]
  }
];

export default function HeroSlider() {
  // Initialize Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const sliderRef = useRef(null);
  
  // Carousel navigation
  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="relative overflow-hidden mb-8 rounded-lg shadow-md">
      <div className="absolute top-4 right-4 z-10 flex items-center bg-black/20 backdrop-blur-sm rounded-full px-2 py-1">
        <span className="text-yellow-400">★</span>
        <span className="text-yellow-400">★</span>
        <span className="text-yellow-400">★</span>
        <span className="text-yellow-400">★</span>
        <span className="text-yellow-400">★</span>
        <span className="ml-1 text-xs text-white font-medium">653 REVIEWS</span>
      </div>
      
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide) => (
            <div key={slide.id} className="embla__slide flex-[0_0_100%] min-w-0">
              <div className="relative h-[50vh] max-h-[600px] w-full">
                {/* Background Image with Overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
                </div>
                
                {/* Content */}
                <div className="relative h-full flex flex-col justify-center p-8 lg:p-16 max-w-screen-xl mx-auto">
                  <div className="w-full lg:w-2/3">
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                      {slide.title}
                    </motion.h2>
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="text-xl md:text-2xl text-white/80 mb-4">
                      {slide.subtitle}
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="text-white/70 max-w-md mb-8">
                      {slide.description}
                    </motion.p>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <Button size="lg" className="bg-primary hover:bg-primary/90">
                        Get Started
                      </Button>
                      <Button size="lg" variant="outline" className="ml-4 border-white/20 text-white hover:bg-white/10">
                        Learn More
                      </Button>
                    </motion.div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 max-w-screen-xl mx-auto">
                    {slide.stats.map((stat, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                        className="text-center"
                      >
                        <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-white/70">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
        onClick={scrollNext}
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </Button>
      
      {/* Dots Indicator */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button 
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className="w-2 h-2 rounded-full bg-white/50 hover:bg-white"
          ></button>
        ))}
      </div>
    </div>
  );
}