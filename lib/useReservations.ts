import { Staff } from "./useStaff";
export interface Reservation {
  id: string;
  userName: string;
  lineId: string;
  staff: any;
  course: number;
  reservationAt: Date;
  clientFreeForm: string;
  staffFreeForm: string;
}

export const createReservation = (
  microcmsClient,
  reservation: Reservation,
  staff: Staff,
  success = () => {}
) => {
  if (!confirm("予約しますか？")) return;
  // 「予約作成」のコードを追加する
  microcmsClient
    .create({
      endpoint: "reservations",
      content: reservation,
    })
    .then((res) => {
      success();
    })
    .catch((err) => console.error(err));

  return reservation;
};

export const getReservations = async (
  microcmsClient,
  filters: string,
  success: () => {}
) => {
  // 「予約一覧」のコードを追加する
  const res = await microcmsClient
    .get({
      endpoint: "reservations",
      queries: { filters: filters },
    })
    .then(success)
    .catch((err) => console.error(err));
  return [];
};

export const updateReservation = (
  microcmsClient,
  reservation: Reservation,
  success = () => {}
) => {
  // 「予約メモの更新」のコードを追加する
  microcmsClient
    .update({
      endpoint: `reservations/${reservation.id}`,
      content: reservation,
    })
    .then(() => {
      success();
    })
    .catch((err) => console.error(err));
  return reservation;
};

export const deleteReservation = (
  microcmsClient,
  reservation: Reservation,
  success: () => {}
) => {
  if (!confirm("予約を解除しますか？")) return;
  // 「予約削除」のコードを追加する
  microcmsClient
    .delete({
      endpoint: "reservations",
      contentId: reservation.id,
    })
    .then(() => {
      success();
    })
    .catch((err) => console.error(err));

  return reservation;
};
