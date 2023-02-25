export interface Reservation {
  id: string;
  userName: string;
  lineId: string;
  staffId: string;
  course: number;
  reservationAt: Date;
  clientFreeForm: string;
  staffFreeForm: string;
}

export const createReservation = (microcmsClient, reservation: Reservation) => {
  microcmsClient.create({
    endpoint: 'reservations',
    content: reservation,
  })
  .catch((err) => console.error(err));

  return reservation;
}

export const deleteReservation = (microcmsClient, reservation: Reservation) => {
  microcmsClient.delete({
    endpoint: 'reservations',
    contentId: reservation.id,
  })
  .catch((err) => console.error(err));

  return reservation;
}