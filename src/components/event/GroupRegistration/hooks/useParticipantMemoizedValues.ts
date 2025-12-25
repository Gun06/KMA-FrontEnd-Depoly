import { useMemo } from 'react';
import { ParticipantData } from "@/app/event/[eventId]/registration/apply/shared/types/group";
import { EventRegistrationInfo } from "@/app/event/[eventId]/registration/apply/shared/types/common";
import { calculateParticipantDisabledStates } from "../utils/participantCalculations";

interface UseParticipantMemoizedValuesProps {
  participants: ParticipantData[];
  eventInfo: EventRegistrationInfo | null;
}

export const useParticipantMemoizedValues = ({
  participants,
  eventInfo
}: UseParticipantMemoizedValuesProps) => {
  const participantDisabledStates = useMemo(() => {
    return calculateParticipantDisabledStates(participants, eventInfo);
  }, [participants, eventInfo]);

  return {
    participantDisabledStates
  };
};

