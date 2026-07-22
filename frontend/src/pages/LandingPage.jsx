import { Navbar } from '../components/landing/Navbar.jsx';
import { HeroSection } from '../components/landing/HeroSection.jsx';
import { FeaturesSection } from '../components/landing/FeaturesSection.jsx';
import { HowItWorksSection } from '../components/landing/HowItWorksSection.jsx';
import { AIAssistantSection } from '../components/landing/AIAssistantSection.jsx';
import { CommunitySection } from '../components/landing/CommunitySection.jsx';
import { StatsSection } from '../components/landing/StatsSection.jsx';
import { TestimonialsSection } from '../components/landing/TestimonialsSection.jsx';
import { FAQSection } from '../components/landing/FAQSection.jsx';
import { Footer } from '../components/landing/Footer.jsx';

export const LandingPage = () => <div className="landing-page"><Navbar /><main><HeroSection /><FeaturesSection /><HowItWorksSection /><AIAssistantSection /><CommunitySection /><StatsSection /><TestimonialsSection /><FAQSection /></main><Footer /></div>;
