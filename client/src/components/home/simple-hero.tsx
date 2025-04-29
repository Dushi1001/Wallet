import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Define slider images and content
const slides = [
  {
    id: 1,
    title: "Smart Crypto Investing",
    subtitle: "Let us help you grow your assets",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80",
    stats: [
      { value: "4500+", label: "Happy Users" },
      { value: "3.0", label: "Avg Rating" },
      { value: "24/7", label: "Customer Support" },
      { value: "7 Days", label: "Free Premium Trial" }
    ]
  },
  {
    id: 2,
    title: "Multi-Chain Portfolio",
    subtitle: "Manage all your assets in one place",
    image: "https://images.unsplash.com/photo-1621932953986-15fcae0575eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    stats: [
      { value: "4500+", label: "Happy Users" },
      { value: "3.0", label: "Avg Rating" },
      { value: "24/7", label: "Customer Support" },
      { value: "7 Days", label: "Free Premium Trial" }
    ]
  },
  {
    id: 3,
    title: "Secure Crypto Storage",
    subtitle: "Bank-grade security for your assets",
    image: "https://images.unsplash.com/photo-1635236066449-5631e032053f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    stats: [
      { value: "4500+", label: "Happy Users" },
      { value: "3.0", label: "Avg Rating" },
      { value: "24/7", label: "Customer Support" },
      { value: "7 Days", label: "Free Premium Trial" }
    ]
  }
];

export default function SimpleHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative overflow-hidden mb-8 rounded-lg">
      <div 
        className="relative w-full h-[50vh] max-h-[600px] bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${slide.image})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
        
        {/* Rating */}
        <div className="absolute top-4 right-4 z-10 flex items-center bg-black/20 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-yellow-400">★★★★★</span>
          <span className="ml-1 text-xs text-white font-medium">653 REVIEWS</span>
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center p-8 lg:p-16">
          <div className="max-w-screen-xl mx-auto w-full">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 animate-fade-in">
              {slide.title}
            </h2>
            <h3 className="text-xl md:text-2xl text-white/80 mb-6 animate-fade-in">
              {slide.subtitle}
            </h3>
            <div className="animate-fade-in">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="ml-4 border-white/20 text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-4 p-4 max-w-screen-xl mx-auto">
            {slide.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
          onClick={goToPrevSlide}
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </Button>
        
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
          onClick={goToNextSlide}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </Button>
        
        {/* Dots Indicator */}
        <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? "bg-white" : "bg-white/50 hover:bg-white/70"
              }`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}