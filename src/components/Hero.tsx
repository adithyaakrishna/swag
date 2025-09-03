import { Button } from "@/components/ui/button";

const Hero = ({ onBookNow }: { onBookNow: () => void }) => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Wear Your Way
        </h1>
        
        <p className="text-lg text-muted-foreground">
          Your brand. My daily routes. Thousands of impressions.
        </p>

        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span>Bangalore Metro • City Streets • Social Media</span>
        </div>

        <Button 
          onClick={onBookNow}
          size="lg"
          className="mt-8"
        >
          Book a Day
        </Button>
      </div>
    </section>
  );
};

export default Hero;