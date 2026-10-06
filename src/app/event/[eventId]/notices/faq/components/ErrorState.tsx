import { FaqErrorState } from '@/components/common/faq/FaqErrorState';

interface ErrorStateProps {
  eventId: string;
  error: string;
}

export const ErrorState = ({ eventId: _eventId, error }: ErrorStateProps) => {
  return <FaqErrorState error={error} />;
};
