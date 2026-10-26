import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Music, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Upload, 
  BarChart3,
  Check,
  ArrowRight
} from "lucide-react";
import { onboardingSteps } from "@/lib/helpContent";
import { UserActivity } from "@/hooks/useOnboarding";
import OnboardingThemePicker from "@/components/OnboardingThemePicker";

interface OnboardingProps {
  isOpen: boolean;
  onComplete: (activity: UserActivity) => void;
  onClose: () => void;
}

type Step = 'welcome' | 'activity' | 'import' | 'tour' | 'theme';

const Onboarding = ({ isOpen, onComplete, onClose }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [selectedActivity, setSelectedActivity] = useState<UserActivity>(null);

  const steps: Step[] = ['welcome', 'activity', 'import', 'tour', 'theme'];
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    } else {
      onComplete(selectedActivity);
    }
  };

  const handlePrev = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSkip = () => {
    onComplete(selectedActivity);
  };

  const canProceed = () => {
    if (currentStep === 'activity') {
      return selectedActivity !== null;
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-card border-gold/20 max-h-[calc(100dvh-32px)] overflow-y-auto">
        {/* Progress Bar */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Passo {currentIndex + 1} de {steps.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Pular
            </Button>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Step Content */}
        <div className="p-6">
          {currentStep === 'welcome' && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                <Music className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
                  {onboardingSteps.welcome.title}
                </h2>
                <p className="text-muted-foreground">
                  {onboardingSteps.welcome.subtitle}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {onboardingSteps.welcome.description}
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="border-primary/50">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Shows
                </Badge>
                <Badge variant="outline" className="border-gold/50">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Finanças
                </Badge>
                <Badge variant="outline" className="border-primary/50">
                  <Music className="h-3 w-3 mr-1" />
                  Repertório
                </Badge>
              </div>
            </div>
          )}

          {currentStep === 'activity' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">
                  {onboardingSteps.activity.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {onboardingSteps.activity.subtitle}
                </p>
              </div>
              <div className="space-y-3">
                {onboardingSteps.activity.options.map((option) => (
                  <Card
                    key={option.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedActivity === option.id
                        ? 'border-primary bg-primary/10'
                        : 'hover:border-primary/40'
                    }`}
                    onClick={() => setSelectedActivity(option.id as UserActivity)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{option.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      {selectedActivity === option.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'import' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">
                  {onboardingSteps.import.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {onboardingSteps.import.subtitle}
                </p>
              </div>
              <div className="space-y-3">
                <Card className="p-4 border-dashed border-2 hover:border-primary/40 transition-all cursor-pointer opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Importar Shows</p>
                      <p className="text-sm text-muted-foreground">
                        Em breve: importação via CSV
                      </p>
                    </div>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                </Card>
                <Card className="p-4 border-dashed border-2 hover:border-gold/40 transition-all cursor-pointer opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gold/10">
                      <Music className="h-6 w-6 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Importar Repertório</p>
                      <p className="text-sm text-muted-foreground">
                        Em breve: importação via texto ou CSV
                      </p>
                    </div>
                    <Badge variant="secondary">Em breve</Badge>
                  </div>
                </Card>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {onboardingSteps.import.description}
              </p>
            </div>
          )}

          {currentStep === 'theme' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">Escolha seu tema</h2>
              <OnboardingThemePicker />
            </div>
          )}

          {currentStep === 'tour' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">
                  {onboardingSteps.tour.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {onboardingSteps.tour.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {onboardingSteps.tour.items.map((item, index) => (
                  <Card key={index} className="p-3 bg-secondary/30">
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </Card>
                ))}
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-gold/10 border border-gold/20">
                <Sparkles className="h-6 w-6 text-gold mx-auto mb-2" />
                <p className="text-sm font-medium">Pronto para começar!</p>
                <p className="text-xs text-muted-foreground">
                  Explore o app e descubra todas as funcionalidades
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="p-4 border-t border-border/50 flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2 bg-gradient-to-r from-primary to-gold hover:opacity-90"
          >
            {currentIndex === steps.length - 1 ? (
              <>
                Começar
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Onboarding;
