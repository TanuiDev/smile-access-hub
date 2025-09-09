import { Button } from '@/components/dashboards/ui/button';
import { Card, CardContent } from '@/components/dashboards/ui/card';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const benefits = [
    "No waiting rooms",
    "Instant consultations",
    "Expert dental advice",
    "Secure & private"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary to-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Transform Your Dental Care?
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Join thousands of patients who've discovered the convenience of teledentistry
              </p>

             
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2 text-white">
                    <CheckCircle className="w-5 h-5 text-white/80" />
                    <span className="text-sm md:text-base">{benefit}</span>
                  </div>
                ))}
              </div>

             
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 transition-all duration-300 transform hover:scale-105"
                  
                >
                  <Link to ='/dentists'>
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary transition-all duration-300"
                  
                >
                  Learn More
                </Button>
              </div>

              <p className="text-white/80 text-sm">
                Free consultation for first-time users
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CTASection;