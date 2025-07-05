import { OnboardingFlow } from '@/components/OnboardingFlow';
import { useAuth } from '@/lib/auth-context';

export default function AuthScreen() {
  const { signIn, signUp, completeOnboarding } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    await signUp(name, email, password);
  };

  const handleOnboardingComplete = () => {
    // This will be called when the user completes the onboarding flow
    // The auth context will handle the navigation to the main app
    console.log('Onboarding completed');
    completeOnboarding();
  };

  return (
    <OnboardingFlow
      onComplete={handleOnboardingComplete}
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
    />
  );
}
