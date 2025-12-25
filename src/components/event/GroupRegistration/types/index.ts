import { ParticipantData } from "@/app/event/[eventId]/registration/apply/shared/types/group";
import { EventRegistrationInfo } from "@/app/event/[eventId]/registration/apply/shared/types/common";

export interface ParticipantsSectionProps {
  participants: ParticipantData[];
  eventInfo: EventRegistrationInfo | null;
  onParticipantsChange: (participants: ParticipantData[]) => void;
  isEditMode?: boolean;
}

export interface SouvenirModalState {
  isOpen: boolean;
  participantIndex: number;
  categoryName: string;
  distance?: string;
}

export interface CategoryModalState {
  isOpen: boolean;
  participantIndex: number;
}

export interface ConfirmModalState {
  open: boolean;
  message: string;
}

