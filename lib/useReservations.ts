export interface Reservation {
  userName: string;
  lineId: string;
  staffId: string;
  course: number;
  reservationAt: Date;
  clientFreeForm: string;
  staffFreeForm: string;
}

export const createReservation = (microcmsClient, reservation: Reservation) => {
  console.log(reservation)
  microcmsClient.create({
    endpoint: 'reservations',
    content: reservation,
  })
  .catch((err) => console.error(err));

  return reservation;
}