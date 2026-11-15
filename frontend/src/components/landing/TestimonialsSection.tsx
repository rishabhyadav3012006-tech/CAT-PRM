import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Quote, Sparkles } from 'lucide-react';
import { GlassCard, GlassVariant } from '../ui/GlassCard.tsx';
import { CuteBadge } from '../ui/CuteBadge.tsx';

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  location: string;
  content: string;
  variant: GlassVariant;
  highlightBadge: string;
}

export const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Vance',
      role: 'Family Daughter & Guardian',
      location: 'Seattle, WA',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      variant: 'babyBlue',
      highlightBadge: 'Long-Distance Peace of Mind',
      content:
        'Living two states away from mom used to cause constant anxiety. With CareNest, I see her medication check-offs every morning and get notified the second Marcus records her blood pressure. It has brought our family pure peace of mind.'
    },
    {
      name: 'Marcus Chen',
      role: 'Certified Geriatric Caregiver',
      location: 'Springfield, OR',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
      variant: 'mint',
      highlightBadge: 'Streamlined Care Shifts',
      content:
        'The large fonts, soft colors, and clean daily checklists make my care shifts so smooth. I know exactly what Eleanor needs, and Sarah is always kept in the loop without endless texting or forgotten notes.'
    },
    {
      name: 'Dr. Elizabeth Adams',
      role: 'Attending Cardiologist',
      location: 'St. Mary Medical Center',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80',
      variant: 'lavender',
      highlightBadge: 'Clinical Precision',
      content:
        'When Eleanor visits my clinic with her longitudinal blood pressure and glucose charts from CareNest, my diagnosis is twice as effective. It is the gold standard for coordinated geriatric healthcare.'
    }
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2">
            <CuteBadge variant="pink" size="md" icon={<Heart className="w-3.5 h-3.5 text-[#B53364]" />}>
              Family & Clinician Stories
            </CuteBadge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-[#34354A] tracking-tight">
            Loved by Seniors, Trusted by Families
          </h2>

          <div className="inline-block bg-[#FFF9ED] border border-[#F7ECCF] px-4 py-1.5 rounded-full text-xs font-bold text-[#8E3F10]">
            ℹ️ Demonstration Content • Sample Healthcare Persona Case Studies
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
            >
              <GlassCard
                variant={item.variant}
                padding="lg"
                rounded="3xl"
                className="h-full flex flex-col justify-between border-2 space-y-5"
              >
                <div className="space-y-4">
                  {/* Star Rating & Cute Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <CuteBadge variant="cream" size="sm">
                      {item.highlightBadge}
                    </CuteBadge>
                  </div>

                  {/* Quote */}
                  <p className="text-sm font-medium font-body text-[#34354A] leading-relaxed italic">
                    "{item.content}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-white/60 flex items-center gap-3.5">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-2xs"
                  />
                  <div>
                    <h4 className="font-extrabold font-heading text-sm text-[#34354A]">{item.name}</h4>
                    <p className="text-xs font-semibold text-[#7969B5]">{item.role}</p>
                    <p className="text-[11px] text-[#7A7D9D]">{item.location}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

