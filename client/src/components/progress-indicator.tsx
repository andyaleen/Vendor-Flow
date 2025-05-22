import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  maxSteps: number;
}

const steps = [
  { number: 1, title: "Request Details" },
  { number: 2, title: "Company Information" },
  { number: 3, title: "Documents" },
  { number: 4, title: "Review & Submit" },
];

export function ProgressIndicator({ currentStep, maxSteps }: ProgressIndicatorProps) {
  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                      step.number <= currentStep
                        ? "bg-blue-500 text-white"
                        : "bg-neutral-200 text-neutral-500"
                    )}
                  >
                    {step.number < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={cn(
                      "ml-3 text-sm font-medium",
                      step.number <= currentStep
                        ? "text-neutral-800"
                        : "text-neutral-500"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 max-w-20 ml-8",
                      step.number < currentStep
                        ? "bg-blue-500"
                        : "bg-neutral-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
