import { Card, CardContent } from '@/components/dashboards/ui/card';
import { Clock, Shield, Users, MapPin, Phone, Calendar } from 'lucide-react';
import accessibilityImage from '@/assets/feature-accessibility.jpg';
import schedulingImage from '@/assets/feature-scheduling.jpg';
import secureImage from '@/assets/feature-secure.jpg';

const FeaturesSection = () => {
  const features = [
    {
      icon: MapPin,
      title: "Accessible Anywhere",
      description: "Get dental care from any location with internet access. No travel required.",
      image: accessibilityImage
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book appointments instantly with our smart scheduling system.",
      image: schedulingImage
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "HIPAA-compliant platform ensuring your privacy and data security.",
      image: secureImage
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Emergency consultations available around the clock.",
      image: null
    },
    {
      icon: Users,
      title: "Expert Dentists",
      description: "Connect with licensed dental professionals nationwide.",
      image: null
    },
    {
      icon: Phone,
      title: "Instant Connection",
      description: "Video calls with HD quality for clear dental examinations.",
      image: null
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose DentaLink?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of dental care with our comprehensive teledentistry platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 bg-card"
            >
              <CardContent className="p-6">
                {feature.image && (
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg mb-4 ${feature.image ? '' : 'mx-auto'}`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;