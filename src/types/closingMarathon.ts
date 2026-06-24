/** GET /api/v1/closing-marathon */
export interface ClosingMarathonResponse {
  designatedEventId: string | null;
  designatedEventName: string | null;
  displayEventId: string | null;
  displayEventName: string | null;
}
