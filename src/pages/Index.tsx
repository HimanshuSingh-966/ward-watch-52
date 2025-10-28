import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-primary rounded-2xl shadow-lg">
            <Activity className="h-16 w-16 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Nurse Logging System
        </h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive patient care management and medication tracking system
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg" onClick={() => navigate('/auth')}>
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
